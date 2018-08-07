import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps;

class Header extends React.Component<IProps> {
  render() {
    const { t } = this.props;

    return (
      <thead>
        <tr className='bold'>
          <th>Project</th>
          <th>Organization</th>
          <th>Language</th>
          <th>Status</th>
          <th>Last Updated</th>
          <th />
        </tr>
      </thead>
    );
  }
}

export default compose(
  translate('translations'),
)(Header);
