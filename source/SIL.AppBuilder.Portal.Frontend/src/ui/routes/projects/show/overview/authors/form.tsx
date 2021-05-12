import * as React from 'react';
import { compose } from 'recompose';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import { isEmpty } from '@lib/collection';
import { ResourceObject } from 'jsonapi-typescript';
import { ProjectResource } from '@data/models/project';
import { UserAttributes } from '@data/models/user';

import { USERS_TYPE } from '@data';

import {
    withDataActions,
    IProvidedProps,
} from '@data/containers/resources/author/with-data-actions'; 

import { withTranslations } from '~/lib/i18n';

import { withCurrentUserContext } from '@data/containers/with-current-user';
import AuthorSelect from '@ui/components/inputs/author-select';
import { OrganizationResource } from '~/data/models/organization';
import { GroupResource } from '~/data/models/group';

interface Params {
  project: ProjectResource;
  organization: OrganizationResource;
  group: GroupResource;
}
interface IOwnProps {
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
}
type IProps = Params & i18nProps & IProvidedProps & IOwnProps;

class AddAuthorForm extends React.Component<IProps> {

    state = {
        userId: '',
        userError: '',
    };

    resetForm = () => {
        this.setState({
            userId: '',
            userError: '',
        });
    };

    isValidForm = () => {
        const { userId } = this.state;
        const { t } = this.props;
        console.log("isValidForm", userId);

        if (isEmpty(userId)) {
            this.setState( { nameError: t('project.side.authors.form.userError') });
        }

        return !isEmpty(userId);
    }

    addAuthor = (e) => {
        e.preventDefault();

        const { createRecord, project } = this.props;
        const { userId } = this.state;

        try {
            if (this.isValidForm()) {
                const attribute = { };
                const relationships = {
                    project: { data: { type: 'project', id: project.id } }, 
                    user:  { data: { type: 'user', id: userId } }
                };
                console.log("create author", relationships);
                createRecord(attribute, relationships);
                this.resetForm();
            }

        } catch (e) {
            console.error(e);
        }
    }

    _updateUserId = (newUserId) => {
        this.setState({
            userId: newUserId
        });
    }

    render() {
        const { project, group, organization, t } = this.props;
        const { userId } = this.state;
        const groupId = group && group.id;
        return (
            <form
                data-test-project-authors-add-form
                className='ui form add-form'
                onSubmit={this.addAuthor}
            >
                <div className='field'>
                    <AuthorSelect
                        project={project}
                        selected={userId}
                        groupId={groupId}
                        restrictToGroup={true}
                        scopeToOrganization={organization}
                        onChange={this._updateUserId}
                    />
                </div>
                <button data-test-project-authors-add-form-submit className='ui button'>
                    {t('project.side.authors.form.submit')}
                </button>
            </form>  
        );
    }
}

export default compose(
    withTranslations,
    withDataActions,
    withCurrentUserContext
)(AddAuthorForm);