import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox, Form, Button } from 'semantic-ui-react';
import { OrganizationAttributes } from '@data/models/organization';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';


export interface IProps {
  onChange: (payload: OrganizationAttributes) => void;
  organization: JSONAPI<OrganizationAttributes>;
}

@withTemplateHelpers
class InfrastructureDisplay extends React.Component<IProps & i18nProps> {
  mut: Mut;
  toggle: Toggle;

  constructor(props) {
    super(props);

    const { organization } = props;
    const {
      useSilBuildInfrastructure,
      buildEngineUrl, buildEngineApiAccessToken
    } = organization.attributes;

    this.state = {
      useSilBuildInfrastructure,
      buildEngineUrl,
      buildEngineApiAccessToken
    };
  }

  onSubmit = () => {
    const { onChange } = this.props;

    onChange(this.state);
  }

  render() {
    const { mut, toggle } = this;
    const { organization, t } = this.props;
    const {
      useSilBuildInfrastructure,
      buildEngineUrl, buildEngineApiAccessToken
    } = this.state;


    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.infrastructureTitle')}</h2>


      <Form className='sub-page-content' onSubmit={this.onSubmit}>

        <div className='flex-row align-items-center p-l-lg p-r-lg m-b-lg'>
          <div>
            <h3>{t('org.useSilInfrastructureTitle')}</h3>
          </div>
          <Checkbox toggle className='m-l-lg'
            checked={useSilBuildInfrastructure}
            onChange={toggle('useSilBuildInfrastructure')}
            />
        </div>

        { !useSilBuildInfrastructure && (<>

          <Form.Field className='m-b-md'>
            <label>{t('org.buildEngineUrl')}</label>
            <input
              value={buildEngineUrl}
              onChange={mut('buildEngineUrl')}
            />
          </Form.Field>

          <Form.Field className='m-b-md'>
            <label>{t('org.buildEngineApiAccessToken')}</label>
            <input
              value={buildEngineApiAccessToken}
              onChange={mut('buildEngineApiAccessToken')}
            />
          </Form.Field>

        </>) }

        <Button
          className='
            m-t-md-xs-only w-100-xs-only
            p-md-xs-only m-b-md-xs-only
          '
          type='submit' onClick={this.onSubmit}>
          {t('org.save')}
        </Button>

      </Form>
      </div>
    );
  }
}

export default compose(
  translate('translations'),
)( InfrastructureDisplay );
