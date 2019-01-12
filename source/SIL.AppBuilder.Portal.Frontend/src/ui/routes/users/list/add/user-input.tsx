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
  }

  onSubmit = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { onSubmit, t } = this.props;
    const { email } = this.state;
    onSubmit(email);
  }

  public render() {
    const { t } = this.props;
    const { email } = this.state;
    return (
      <form onSubmit={this.onSubmit} className="flex justify-content-space-between">
        <div className="large ui input">
          <input
            data-test-email
            type="text"
            placeholder={t('users.addUser.placeholder')}
            value={email}
            onChange={this.didType}
          />
        </div>
        <button data-test-add type="submit" className="large ui button" onClick={this.onSubmit}>
          {t('users.addUser.modalAddButton')}
        </button>
      </form>
    );
  }
}

export default compose(withTranslations)(UserInput) as React.ComponentClass<IOwnProps>;
