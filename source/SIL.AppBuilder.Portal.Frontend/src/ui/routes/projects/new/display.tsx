import * as React from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';

import { idFromRecordIdentity } from '@data';
import { i18nProps } from '@lib/i18n';
import * as toast from '@lib/toast';
import { isEmpty } from '@lib/collection';
import ApplicationTypeSelect from '@ui/components/inputs/application-type-select';
import GroupSelect from '@ui/components/inputs/group-select';

import { IProvidedProps as IDataProps } from './with-data';
import { IProvidedProps as ICurrentOrganizationProps } from '@data/containers/with-current-organization';

type IProps =
  & i18nProps
  & IDataProps
  & RouteComponentProps
  & ICurrentOrganizationProps;

interface IState {
  name?: string;
  groupId?: string;
  language?: string;
  isPublic?: boolean;
  disableSubmit: boolean;
  typeId?: string;
  description?: string;
}

@withTemplateHelpers
export default class Display extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  state: IState = { disableSubmit: false, isPublic: true };

  componentDidUpdate(prevProps) {
    const hasOrgChanged = prevProps.currentOrganizationId !== this.props.currentOrganizationId;

    if (hasOrgChanged) {
      this.setState({ groupId: undefined });
    }
  }

  areAllRequiredFieldsPresent = () => {
    const { name, groupId, language, typeId } = this.state;

    return (
      !isEmpty(name)
      && !isEmpty(groupId)
      && !isEmpty(language)
      && !isEmpty(typeId)
    );
  }

  isSaveDisabled(): boolean {
    const { disableSubmit } = this.state;

    return disableSubmit || !this.areAllRequiredFieldsPresent();
  }

  onSubmit = async () => {
    const { create, t, history } = this.props;

    this.setState({ disableSubmit: true });

    const { name, groupId, language, isPublic, typeId, description } = this.state;

    try {
      const project = await create({ name, language, isPublic, description }, groupId, typeId);

      const id = idFromRecordIdentity(project);
      history.push(`/projects/${id}`);

    } catch (e) {
      const message = (e.data && e.data.errors && e.data.errors.lenght > 0 && e.data.errors[0].detail) || e.message;
      toast.error(t('errors.generic', { errorMessage: message }));
    }

    this.setState({ disableSubmit: false });

  }

  render() {
    const { mut, toggle } = this;
    const { t, currentOrganization } = this.props;
    const { name, groupId, language, isPublic, typeId, description } = this.state;

    const submitClasses = `
      ui button primary huge
      ${this.isSaveDisabled() ? 'disabled' : ''}
    `;

    return (
      <div
        data-test-new-project-form
        className='p-t-xl flex-column align-items-center justify-content-center'>
        <Card className='w-100'>
          <Card.Header className='flex-row justify-content-space-between'>
            <h1 className='ui header p-l-md p-r-md m-t-md m-b-md'>{t('project.newProject')}</h1>
          </Card.Header>

          <Card.Content className='p-lg'>
            <Form data-test-new-project-form>
              <h2 className='form-title'>{t('project.title')}</h2>

              <div className='flex justify-content-space-between'>
                <Form.Field className='flex-50 m-r-md'>
                  <label>{t('project.projectName')}</label>
                  <input required
                    data-test-name
                    value={name || ''}
                    onChange={mut('name')} />
                </Form.Field>

                <Form.Field className='flex-50 m-l-md'>
                  <label>{t('project.projectGroup')}</label>
                  <GroupSelect
                    scopeToCurrentUser={true}
                    scopeToOrganization={currentOrganization}
                    selected={groupId}
                    onChange={mut('groupId')}
                  />
                </Form.Field>
              </div>

              <div className='flex justify-content-space-between'>
                <Form.Field className='flex-50 m-r-md'>
                  <label>{t('project.languageCode')}</label>
                  <input required
                    data-test-language
                    value={language || ''}
                    onChange={mut('language')} />
                </Form.Field>

                <Form.Field className='flex-50 m-l-md m-b-md'>
                  <label>{t('project.type')}</label>
                  <ApplicationTypeSelect
                    selected={typeId}
                    onChange={mut('typeId')}
                  />
                </Form.Field>
              </div>

              <div className='flex justify-content-space-between'>
                <Form.Field className='flex-50 m-r-md'>
                  <label>{t('project.projectDescription')}</label>
                  <textarea value={description || ''} onChange={mut('description')}/>
                </Form.Field>
                <Form.Field className='flex-50 m-l-md m-t-md p-t-sm'>
                  <div className='flex-row'>
                    <div className='toggle-selector flex-row flex-grow justify-content-space-between'>
                      <span className='bold'>{t('project.visibilityLabel')}</span>
                      <Checkbox
                        toggle
                        data-test-visibility
                        checked={isPublic}
                        onChange={toggle('isPublic')}
                        />
                    </div>
                  </div>

                  <div className='flex-row m-t-md'>
                    <p>{t('project.visibilityDescription')}</p>
                  </div>
                </Form.Field>
              </div>

            </Form>
          </Card.Content>
        </Card>


        <div className='w-100 flex-row flex-grow justify-content-space-between'>
          <Link className='ui button basic huge' to='/'>
            {t('common.cancel')}
          </Link>

          <button
            data-test-save
            className={submitClasses}
            onClick={this.onSubmit}>
            {t('common.save')}
          </button>
        </div>
      </div>
    );
  }
}
