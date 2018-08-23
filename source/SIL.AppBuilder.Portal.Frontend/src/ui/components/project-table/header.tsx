import * as React from 'react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { Icon } from 'semantic-ui-react';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps;

class Header extends React.Component<IProps> {
  render() {

    const { t } = this.props;

    return (
      <div className='flex header grid'>
        <div className='col'>Project</div>
        <div className='col d-xs-none d-md-block'>Organization</div>
        <div className='col d-xs-none d-md-block'>Language</div>
        <div className='action d-xs-none d-md-block'><Icon name='dropdown' /></div>
      </div>
    );
  }
}

export default compose(
  translate('translations'),
)(Header);
