import * as React from 'react';
import { compose } from 'recompose';
import { Link } from 'react-router-dom';
import { withTranslations, i18nProps } from '@lib/i18n';
import { RectLoader } from '@ui/components/loaders';
import FocusPanel from '@ui/components/focus-panel';
import { RedeemOrganizationMembershipInviteError } from '@data/errors/redeem-organization-membership-invite-error';

export interface IProps {
  error: RedeemOrganizationMembershipInviteError;
}

type IOwnProps = IProps & i18nProps;

const ErrorMessage = (props: { error: string; homeLinkText: string }) => {
  return (
    <div>
      <div data-test-error>{props.error}</div>
      <div>
        <Link data-test-home-link to='/'>
          {props.homeLinkText}
        </Link>
      </div>
    </div>
  );
};

class OrganizationMembershipInvitation extends React.Component<IOwnProps> {
  render() {
    const { t, error } = this.props;

    return (
      <FocusPanel title={t('organization-membership.invite.redemptionTitle')}>
        <div data-test-organization-membership-invite>
          {error ? (
            <ErrorMessage error={t(error.message, error.meta)} homeLinkText={t('home')} />
          ) : (
            <RectLoader />
          )}
        </div>
      </FocusPanel>
    );
  }
}

export default compose(withTranslations)(OrganizationMembershipInvitation) as React.ComponentClass<
  IProps
>;
