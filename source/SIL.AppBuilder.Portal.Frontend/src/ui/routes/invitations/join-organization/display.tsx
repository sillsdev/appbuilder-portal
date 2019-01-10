import * as React from 'react';
import { compose } from 'recompose';

import { withTranslations, i18nProps } from '@lib/i18n';

import {RectLoader} from '@ui/components/loaders';
import FocusPanel from '@ui/components/focus-panel';


export interface IProps {
  error: Error;
}

type IOwnProps = IProps & i18nProps;


class OrganizationMembershipInvitation extends React.Component<IOwnProps> {

  render() {
    const { t, error } = this.props;
    return (<FocusPanel title={t('organization-membership.invite.redemptionTitle')}>
        { error ? <div>{t(error.message, error.meta)}</div> : <RectLoader/>}
      </FocusPanel>);
  }
}

export default compose(withTranslations)(OrganizationMembershipInvitation) as React.ComponentClass<IProps>;
