import * as React from 'react';
import { compose } from 'recompose';
import CaretDown from '@material-ui/icons/KeyboardArrowDown';
import { Dropdown, Popup } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import DebouncedSearch from '@ui/components/inputs/debounced-search-field';
import { withTranslations, i18nProps } from '@lib/i18n';
import { IRowProps } from '@ui/components/project-table';

import './styles.scss';


interface IOwnProps {
  filter: string;
  onSearch: (term: string) => any;
}

type IProps =
& IOwnProps
& IRowProps
& i18nProps;

class Header extends React.Component<IProps> {

  onBulkArchive = () => {
    const { selectedRows } = this.props;
    console.log(selectedRows);
  }

  onBulkBuild = () => {
    const { selectedRows } = this.props;
    console.log(selectedRows);
  }

  render() {

    const { t, filter, onSearch } = this.props;

    const dropdownText = {
      'my-projects': t('projects.switcher.dropdown.myProjects'),
      'organization': t('projects.switcher.dropdown.orgProjects'),
      'archived': t('projects.switcher.dropdown.archived')
    };

    const trigger = (
      <>
        <div className='text'>{dropdownText[filter]}</div>
        <CaretDown />
      </>
    );

    return (
      <div className='flex justify-content-space-between p-t-md-xs p-b-md-xs'>
        <div>
          <Dropdown
            className='project-switcher'
            trigger={trigger}
            icon={null}
            inline
          >
            <Dropdown.Menu>
              <Dropdown.Item text={t('projects.switcher.dropdown.myProjects')} as={NavLink} to='/projects/own'/>
              <Dropdown.Item text={t('projects.switcher.dropdown.orgProjects')} as={NavLink} to='/projects/organization' />
              <Dropdown.Item text={t('projects.switcher.dropdown.archived')} as={NavLink} to='/projects/archived' />
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className='flex align-items-center'>
          <button
            className='ui button basic blue m-r-md'
            onClick={this.onBulkArchive}
          >
            {t('common.archive')}
          </button>
          <button
            className='ui button basic blue m-r-md'
            onClick={this.onBulkBuild}
          >
            {t('common.build')}
          </button>
          <div className='flex align-items-center'>

            <Popup
              basic
              hoverable
              trigger={<div>
                <DebouncedSearch
                  className='search-component'
                  placeholder={t('common.search')}
                  onSubmit={onSearch}
                />
              </div>}
              position='bottom center'>

              <div dangerouslySetInnerHTML={{ __html: t('directory.search-help') }} />

            </Popup>
          </div>
        </div>
      </div>
    );
  }

}

export default compose<IOwnProps, IOwnProps>(
  withTranslations
)(Header);
