import * as React from 'react';
import { compose } from 'recompose';
import CaretDown from '@material-ui/icons/KeyboardArrowDown';
import { Dropdown, Popup } from 'semantic-ui-react';
import { NavLink, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { every } from 'lodash';

import * as toast from '@lib/toast';
import DebouncedSearch from '@ui/components/inputs/debounced-search-field';
import { withTranslations, i18nProps } from '@lib/i18n';
import { IRowProps } from '@ui/components/project-table';
import {
  withBulkActions,
  IProvidedProps as IBulkActions
} from '@data/containers/resources/project/with-bulk-actions';
import { withRole, IProvidedProps as IRoleProps } from '@data/containers/with-role';
import { ROLE } from '@data/models/role';

import { PROJECT_ROUTES } from './routes';

import './styles.scss';
import { attributesFor } from '~/data';
import { idFromRecordIdentity } from '~/data/store-helpers';

interface IOwnProps {
  filter: string;
  onSearch: (term: string) => any;
}

type IProps =
  & IOwnProps
  & IRowProps
  & IBulkActions
  & RouteComponentProps
  & i18nProps;

class Header extends React.Component<IProps> {

  onBulkArchive = async () => {
    const { selectedRows, bulkArchive } = this.props;

    try {
      await bulkArchive(selectedRows);
      toast.success('Selected projects archived');
    }catch(e) {
      toast.error(e);
    }
  }

  onBulkReactivate = async () => {
    const { selectedRows, bulkReactivate } = this.props;

    try {
      await bulkReactivate(selectedRows);
      toast.success('Selected projects reactivated');
    } catch (e) {
      toast.error(e);
    }
  }

  onBulkBuild = () => {
    toast.error("Not implemented yet");
  }

  get canArchiveOrReactivate() {
    const { selectedRows } = this.props;

    return every(selectedRows, (row) => {
      return row.currentUserCanArchive;
    });
  }

  get isInOwnProject(){
    return this.props.location.pathname.endsWith(PROJECT_ROUTES.OWN);
  }

  get isInOrganizastionProject(){
    return this.props.location.pathname.endsWith(PROJECT_ROUTES.ORGANIZATION);
  }

  get isInActiveProject(){
    return this.isInOrganizastionProject || this.isInOwnProject;
  }

  get isInArchivedProject() {
    return this.props.location.pathname.endsWith(PROJECT_ROUTES.ARCHIVED);
  }

  render() {
    const { t, filter, onSearch, location } = this.props;
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
      <div className='flex justify-content-space-between p-t-md-xs p-b-md-xs' data-test-project-action-header>
        <div>
          <Dropdown
            className='project-switcher'
            trigger={trigger}
            icon={null}
            inline
          >
            <Dropdown.Menu>
              <Dropdown.Item text={t('projects.switcher.dropdown.myProjects')} as={NavLink} to={PROJECT_ROUTES.OWN}/>
              <Dropdown.Item text={t('projects.switcher.dropdown.orgProjects')} as={NavLink} to={PROJECT_ROUTES.ORGANIZATION} />
              <Dropdown.Item text={t('projects.switcher.dropdown.archived')} as={NavLink} to={PROJECT_ROUTES.ARCHIVED} />
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className='flex align-items-center'>
          {
            this.isInActiveProject && this.canArchiveOrReactivate ?
              (<button
                data-test-archive-button
                className='ui button basic blue m-r-md'
                onClick={this.onBulkArchive}
              >
                {t('common.archive')}
              </button>) : null
          }
          {
            this.isInArchivedProject && this.canArchiveOrReactivate ?
              (<button
                data-test-reactivate-button
                className='ui button basic blue m-r-md'
                onClick={this.onBulkReactivate}
              >
                {t('common.reactivate')}
              </button>) : null
          }
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
  withTranslations,
  withRouter,
  withBulkActions
)(Header);
