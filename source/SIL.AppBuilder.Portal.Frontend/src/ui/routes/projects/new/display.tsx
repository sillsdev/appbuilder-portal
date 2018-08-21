import * as React from 'react';
import { Card, Form, Checkbox } from 'semantic-ui-react';

import { i18nProps } from '@lib/i18n';


type IProps =
& i18nProps;

export default class Display extends React.Component<IProps> {
  render() {
    const { t } = this.props;

    return (
      <div className='p-t-xl flex justify-content-center'>
        <Card className='w-100'>
          <Card.Header>
            <h1 className='ui header p-l-md p-r-md m-t-md m-b-md'>{t('project.newProject')}</h1>
          </Card.Header>

          <Card.Content className='p-lg'>
            <Form data-test-new-project-form>
              <h2 className='form-title'>{t('project.title')}</h2>

              <div className='flex justify-content-space-between'>
                <Form.Field className='flex-50'>
                  <label>{t('project.projectName')}</label>
                  <input />
                </Form.Field>

                <Form.Field className='flex-50'>
                  <label>{t('project.projectGroup')}</label>
                  <input />
                </Form.Field>
              </div>

              <Form.Field>
                <label>{t('project.languageCode')}</label>
                <input />
              </Form.Field>

              <h2 className='form-title'>{t('project.type')}</h2>
              <Form.Field>
                <div className='toggle-selector'>
                  <span>{t('project.visibilityLabel')}</span>
                  <Checkbox
                    data-test-profile-email-notification
                    toggle
                    />
                </div>
                {t('project.visibilityDescription')}
              </Form.Field>

            </Form>
          </Card.Content>
        </Card>
      </div>
    );
  }
}
