import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import './project-switcher.scss';
import { NavLink } from 'react-router-dom';

interface IOwnProps {
  filter: string;
}

class Header extends React.Component<IOwnProps & i18nProps> {

  render() {

    const { t, filter } = this.props;

    const dropdownText = {
      'own': t('projects.switcher.dropdown.myProjects'),
      'organization': t('projects.switcher.dropdown.orgProjects'),
      'archived': t('projects.switcher.dropdown.archived')
    };

    return (
      <div className='flex justify-content-space-between p-t-md-xs p-b-md-xs'>
        <Dropdown
          className='project-switcher'
          icon='chevron down'
          inline
          text={dropdownText[filter]}
        >
          <Dropdown.Menu>
            <Dropdown.Item text={t('projects.switcher.dropdown.myProjects')} as={NavLink} to='/projects/own'/>
            <Dropdown.Item text={t('projects.switcher.dropdown.orgProjects')} as={NavLink} to='/projects/organization' />
            <Dropdown.Item text={t('projects.switcher.dropdown.archived')} as={NavLink} to='/projects/archived' />
          </Dropdown.Menu>
        </Dropdown>
        <div className='flex align-items-center'>
          <div className='ui left icon input search-component'>
            <input type="text" placeholder={`${t('common.search')}...`} />
            <i className='search icon' />
          </div>
        </div>
      </div>
    );
  }

}

export default compose(
  translate('translations'),
)(Header);
