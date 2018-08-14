import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { withData } from '../edit/with-data';
import { UserAttributes } from '@data/models/user';
import { getPictureUrl } from '@lib/auth0';

export const pathName = '/users/:id';

export interface IOwnProps {
  user: JSONAPI<UserAttributes>;
}

export type IProps =
  & IOwnProps
  & i18nProps;

class User extends React.Component<IProps> {

  render() {

    const { user } = this.props;

    return (
      <div className='ui container flex-column'>
        <div >
          <img className='round' src={getPictureUrl()} />
        </div>
      </div>
    );
  }
}

export default compose(
  withData,
  withTranslations
)(User);