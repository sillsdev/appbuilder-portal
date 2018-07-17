import * as React from 'react';
import { match as Match } from 'react-router';
import { Checkbox } from 'semantic-ui-react';
import { OrganizationAttributes } from '@data/models/organization';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

export const pathName = '/organizations/:orgId/settings/infrastructure';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: JSONAPI<OrganizationAttributes>;
}

class InfrastructureRoute extends React.Component<IProps & i18nProps> {
  toggleUseSIL = () => {
    const { update, organization } = this.props;
    const { useSilBuildInfrastructure } = organization.attributes;

    update({ useSilBuildInfrastructure: !useSilBuildInfrastructure });
  }

  render() {
    const { organization, t } = this.props;
    const { useSilBuildInfrastructure } = organization.attributes;


    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.infrastructureTitle')}</h2>

        <div className='flex-row align-items-center p-l-lg p-r-lg m-b-lg'>
          <div>
            <h3>{t('org.useSilInfrastructureTitle')}</h3>
          </div>
          <Checkbox toggle className='m-l-lg'
            checked={useSilBuildInfrastructure}
            onChange={this.toggleUseSIL}
            />
        </div>
      </div>
    );
  }
}

export default compose(
  translate('translations')
)( InfrastructureRoute );
