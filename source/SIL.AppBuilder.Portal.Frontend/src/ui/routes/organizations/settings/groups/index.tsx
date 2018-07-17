import * as React from 'react';
import { match as Match } from 'react-router';
import { Button } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

export const pathName = '/organizations/:orgId/settings/groups';

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  organization: any;
}

class GroupsRoute extends React.Component<IProps & i18nProps> {
  render() {
    const { match, t } = this.props;
    const { params: { orgId } } = match;

    return (
      <div className='sub-page-content'>
        <h2 className='sub-page-heading'>{t('org.groupsTitle')}</h2>

        <p className='gray-text p-b-lg'>{t('org.noGroups')}</p>

        <Button className='tertiary uppercase large'>{t('org.addGroupButton')}</Button>
      </div>
    );
  }
}

export default compose(
  translate('translations')
)( GroupsRoute );
