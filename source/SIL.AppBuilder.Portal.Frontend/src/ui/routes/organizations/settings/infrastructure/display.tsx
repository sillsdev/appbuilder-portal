import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox, Form, Button } from 'semantic-ui-react';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { attributesFor, ORGANIZATIONS_TYPE } from '@data';

import { OrganizationAttributes } from '@data/models/organization';
import { ResourceObject } from 'jsonapi-typescript';

export interface IProps {
  onChange: (payload: OrganizationAttributes) => void;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

@withTemplateHelpers
class InfrastructureDisplay extends React.Component<IProps & i18nProps> {
  mut: Mut;
  toggle: Toggle;

  constructor(props) {
    super(props);

    const { organization } = props;
    const { useDefaultBuildEngine, buildEngineUrl, buildEngineApiAccessToken } = attributesFor(
      organization
    );

    this.state = {
      useDefaultBuildEngine,
      buildEngineUrl,
      buildEngineApiAccessToken,
    };
  }

  onSubmit = () => {
    const { onChange } = this.props;

    onChange(this.state);
  };

  render() {
    const { mut, toggle } = this;
    const { organization, t } = this.props;
    const { useDefaultBuildEngine, buildEngineUrl, buildEngineApiAccessToken } = this.state;

    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.infrastructureTitle')}</h2>

        <Form className='sub-page-content' onSubmit={this.onSubmit}>
          <div className='flex-row align-items-center p-l-lg p-r-lg m-b-lg'>
            <div>
              <h3>{t('org.useDefaultBuildEngineTitle')}</h3>
            </div>
            <Checkbox
              toggle
              className='m-l-lg'
              checked={useDefaultBuildEngine}
              onChange={toggle('useDefaultBuildEngine')}
            />
          </div>

          {!useDefaultBuildEngine && (
            <>
              <Form.Field className='m-b-md'>
                <label>{t('org.buildEngineUrl')}</label>
                <input value={buildEngineUrl} onChange={mut('buildEngineUrl')} />
              </Form.Field>

              <Form.Field className='m-b-md'>
                <label>{t('org.buildEngineApiAccessToken')}</label>
                <input
                  value={buildEngineApiAccessToken}
                  onChange={mut('buildEngineApiAccessToken')}
                />
              </Form.Field>
            </>
          )}

          <Button
            className='
            m-t-md-xs-only w-100-xs-only
            p-md-xs-only m-b-md-xs-only
          '
            type='submit'
            onClick={this.onSubmit}
          >
            {t('org.save')}
          </Button>
        </Form>
      </div>
    );
  }
}

export default compose(translate('translations'))(InfrastructureDisplay);
