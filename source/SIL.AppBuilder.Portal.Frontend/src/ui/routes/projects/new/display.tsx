import * as React from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';

import { idFromRecordIdentity } from '@data';
import { i18nProps } from '@lib/i18n';
import * as toast from '@lib/toast';
import { isEmpty } from '@lib/collection';
import GroupSelect from '@ui/components/inputs/group-select';

import { IProvidedProps as IDataProps } from './with-data';

type IProps =
& i18nProps
& IDataProps;

interface IState {
  name?: string;
  groupId?: Id;
  language?: string;
  isPublic?: boolean;
  disableSubmit: boolean;
  type?: string;
}

@withTemplateHelpers
export default class Display extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  state: IState = { disableSubmit: false, isPublic: true };

  areAllRequiredFieldsPresent = () => {
    const { name, groupId, language, type } = this.state;

    return (
      !isEmpty(name)
      && !isEmpty(groupId)
      && !isEmpty(language)
      && !isEmpty(type)
    );
  }

  isSaveDisabled(): boolean {
    const { disableSubmit } = this.state;

    return disableSubmit || !this.areAllRequiredFieldsPresent();
  }

  onSubmit = async () => {
    const { create, t, history } = this.props;

    this.setState({ disableSubmit: true });

    const { name, groupId, language, isPublic, type } = this.state;

    try {
      const project = await create({ name, language, isPublic, type }, groupId);

      const id = idFromRecordIdentity(project);

      history.push(`/project/${id}`);
    } catch (e) {
      toast.error(t('errors.generic', { errorMessage: e.message }));
    }

    this.setState({ disableSubmit: false });

  }

  render() {
    const { mut, toggle } = this;
    const { t, currentOrganization } = this.props;
    const { name, groupId, language, isPublic, disableSubmit, type } = this.state;

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

                <Form.Field className='flex-50 m-l-md'>
                  <label>{t('project.type')}</label>
                  <input required
                    data-test-type
                    value={type || ''}
                    onChange={mut('type')} />
                </Form.Field>
              </div>

              <Form.Field className='m-t-xl'>
                <div className='flex-row'>
                  <div className='toggle-selector flex-row flex-50-sm flex-25-lg  justify-content-space-between'>
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
                  <p className='flex-50-sm flex-25-lg'>{t('project.visibilityDescription')}</p>
                </div>
              </Form.Field>

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
