import * as React from 'react';
import { compose } from 'recompose';
import { IAttributeProps } from '@lib/dom';
import { i18nProps, withTranslations } from '@lib/i18n';
interface IOwnProps {
  onSubmit: (email: string) => void;
}

interface IState {
  email: string;
}

type IProps = IOwnProps & IAttributeProps & i18nProps;
class UserInput extends React.Component<IProps, IState> {
  state = { email: '' };

  didType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    this.setState({ email });
  };
  onSubmit = (e: any) => {
    e.preventDefault();
    const { onSubmit, t } = this.props;
    const { email } = this.state;
    onSubmit(email);
    return false;
  };

  public render() {
    const { t } = this.props;
    const { email } = this.state;

    return (
      <div className='flex justify-content-space-between'>
        <form onSubmit={this.onSubmit}>
          <div className='large ui input'>
            <input
              data-test-email
              type='text'
              placeholder={t('organization-membership.invite.create.email-input-placeholder')}
              value={email}
              onChange={this.didType}
            />
          </div>
          <button data-test-invite className='large ui button' onClick={this.onSubmit}>
            {t('organization-membership.invite.create.send-invite-button')}
          </button>
        </form>
      </div>
    );
  }
}

export default compose(withTranslations)(UserInput) as React.ComponentClass<IProps>;
