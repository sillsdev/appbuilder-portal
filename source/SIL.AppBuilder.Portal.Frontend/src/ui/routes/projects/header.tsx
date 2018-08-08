import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';


class Header extends React.Component<i18nProps> {

  render() {

    const { t } = this.props;

    return (
      <div className='flex justify-content-space-between'>
        <Dropdown
          className='switcher'
          icon='chevron down'
          inline
          pointing
          text={t('projects.switcher.myProjects', { numProjects: 0 })}
        >
          <Dropdown.Menu>
            <Dropdown.Item text={t('projects.switcher.dropdown.myProjects')} />
            <Dropdown.Item text={t('projects.switcher.dropdown.archived')} />
          </Dropdown.Menu>
        </Dropdown>
        <div className='flex align-items-center'>
          <div className='ui left icon input search-component'>
            <input type="text" placeholder={`${t('common.search')}...`} />
            <i className='search icon' />
          </div>
        </div>
      </div>
    )
  }

}

export default compose(
  translate('translations'),
)(Header);