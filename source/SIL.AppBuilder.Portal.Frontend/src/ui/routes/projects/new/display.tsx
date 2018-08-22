import * as React from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';

import { i18nProps } from '@lib/i18n';
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
  isPrivate?: boolean;
  disableSubmit: boolean
}

@withTemplateHelpers
export default class Display extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  state: IState = { disableSubmit: false };

  areAllRequiredFieldsPresent = () => {
    const { name, groupId, language } = this.state;

    return (
      !isEmpty(name)
      && !isEmpty(groupId)
      && !isEmpty(language)
    );
  }

  isSaveDisabled(): boolean {
    const { disableSubmit } = this.state;

    return disableSubmit || !this.areAllRequiredFieldsPresent();
  }

  onSubmit = async () => {
    const { create } = this.props;

    this.setState({ disableSubmit: true });

    const { name, groupId, language, isPrivate } = this.state;

    await create({ name, language, isPrivate }, groupId);

    this.setState({ disableSubmit: false });

  }

  render() {
    const { mut, toggle } = this;
    const { t } = this.props;
    const { name, groupId, language, isPrivate, disableSubmit } = this.state;

    const submitClasses = `
      ui button primary huge
      ${this.isSaveDisabled() ? 'disabled' : ''}
    `;

    return (
      <div className='p-t-xl flex-column align-items-center justify-content-center'>
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
                  <input required value={name || ''} onChange={mut('name')} />
                </Form.Field>

                <Form.Field className='flex-50 m-l-md'>
                  <label>{t('project.projectGroup')}</label>
                  <GroupSelect
                    selected={groupId}
                    onChange={mut('groupId')}
                  />
                </Form.Field>
              </div>

              <div className='flex justify-content-space-between'>
                <Form.Field className='flex-50 m-r-md'>
                  <label>{t('project.languageCode')}</label>
                  <input required value={language || ''} onChange={mut('language')} />
                </Form.Field>
                <span className='flex-50 m-r-md' />
              </div>

              <h2 className='form-title'>{t('project.type')}</h2>
              <Form.Field>
                <div className='flex-row'>
                  <div className='toggle-selector flex-row flex-50-sm flex-25-lg  justify-content-space-between'>
                    <span className='bold'>{t('project.visibilityLabel')}</span>
                    <Checkbox
                      toggle
                      checked={isPrivate}
                      onChange={toggle('isPrivate')}
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
          <button className='ui button basic huge'>
            {t('common.cancel')}
          </button>

          <button className={submitClasses}>
            {t('common.save')}
          </button>
        </div>
      </div>
    );
  }
}
