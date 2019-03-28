import * as React from 'react';
import { compose } from 'recompose';
import CaretDown from '@material-ui/icons/KeyboardArrowDown';
import { Dropdown, Popup } from 'semantic-ui-react';
import { NavLink, withRouter, Link } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { every } from 'lodash';
import * as toast from '@lib/toast';
import DebouncedSearch from '@ui/components/inputs/debounced-search-field';
import { withTranslations, i18nProps } from '@lib/i18n';
import { IRowProps } from '@ui/components/project-table';
import { RequireOrganization } from '@ui/components/authorization';
import {
  withBulkActions,
  IProvidedProps as IBulkActions,
} from '@data/containers/resources/project/with-bulk-actions';

import { PROJECT_ROUTES } from './routes';

import './styles.scss';
import { connect } from 'react-redux';

import { rowSelectionsFor, allCheckboxStateFor } from '~/redux-store/data/selectors';

interface IOwnProps {
  filter: string;
  onSearch: (term: string) => any;
  onBulkActionComplete: () => void;
}

type IProps = IOwnProps & IRowProps & IBulkActions & RouteComponentProps & i18nProps;

class Header extends React.Component<IProps> {
  onBulkArchive = async () => {
    const { selectedRows, bulkArchive } = this.props;

    try {
      await bulkArchive(selectedRows);
      toast.success('Selected projects archived');
    } catch (e) {
      toast.error(e);
    }
    this.afterBulkAction();
  };

  onBulkReactivate = async () => {
    const { selectedRows, bulkReactivate } = this.props;

    try {
      await bulkReactivate(selectedRows);
      toast.success('Selected projects reactivated');
    } catch (e) {
      toast.error(e);
    }
    this.afterBulkAction();
  };

  afterBulkAction = () => {
    if (this.props.onBulkActionComplete) {
      this.props.onBulkActionComplete();
    }
  };

  onBulkBuild = () => {
    toast.error('Not implemented yet');
  };

  get canArchiveOrReactivate() {
    const { selectedRows } = this.props;

    return every(selectedRows, (row) => {
      return row.currentUserCanArchive;
    });
  }

  get isInOwnProject() {
    return this.props.location.pathname.endsWith(PROJECT_ROUTES.OWN);
  }

  get isInOrganizationProject() {
    return this.props.location.pathname.endsWith(PROJECT_ROUTES.ORGANIZATION);
  }

  get isInActiveProject() {
    return this.isInOrganizationProject || this.isInOwnProject;
  }

  get isInArchivedProject() {
    return this.props.location.pathname.endsWith(PROJECT_ROUTES.ARCHIVED);
  }

  render() {
    const { t, filter, onSearch, selectedRows } = this.props;
    const dropdownText = {
      'all-projects': t('projects.switcher.dropdown.all'),
      'my-projects': t('projects.switcher.dropdown.myProjects'),
      organization: t('projects.switcher.dropdown.orgProjects'),
      archived: t('projects.switcher.dropdown.archived'),
    };

    const trigger = (
      <>
        <div className='text'>{dropdownText[filter]}</div>
        <CaretDown />
      </>
    );

    return (
      <div className='flex-col p-t-md-xs' data-test-project-action-header>
        <div className='flex justify-content-space-between p-b-md-xs'>
          <div>
            <Dropdown className='project-switcher' trigger={trigger} icon={null} inline>
              <Dropdown.Menu>
                <Dropdown.Item
                  text={t('projects.switcher.dropdown.all')}
                  as={NavLink}
                  to={PROJECT_ROUTES.ALL}
                />
                <Dropdown.Item
                  text={t('projects.switcher.dropdown.myProjects')}
                  className='m-l-md'
                  as={NavLink}
                  to={PROJECT_ROUTES.OWN}
                />
                <Dropdown.Item
                  text={t('projects.switcher.dropdown.orgProjects')}
                  className='m-l-md'
                  as={NavLink}
                  to={PROJECT_ROUTES.ORGANIZATION}
                />
                <Dropdown.Item
                  text={t('projects.switcher.dropdown.archived')}
                  className='m-l-lg'
                  as={NavLink}
                  to={PROJECT_ROUTES.ARCHIVED}
                />
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className='flex align-items-center'>
            <div className='flex align-items-center'>
              <Popup
                basic
                hoverable
                trigger={
                  <div>
                    <DebouncedSearch
                      className='search-component'
                      placeholder={t('common.search')}
                      onSubmit={onSearch}
                    />
                  </div>
                }
                position='bottom center'
              >
                <div dangerouslySetInnerHTML={{ __html: t('directory.search-help') }} />
              </Popup>
            </div>
          </div>
        </div>

        <div className='flex justify-content-space-between p-b-md-xs'>
          <div>
            {this.isInActiveProject && this.canArchiveOrReactivate ? (
              <button
                disabled={selectedRows.length === 0}
                data-test-archive-button
                className='ui button basic blue m-r-md'
                onClick={this.onBulkArchive}
              >
                {t('common.archive')}
              </button>
            ) : null}
            {this.isInArchivedProject && this.canArchiveOrReactivate ? (
              <button
                data-test-reactivate-button
                disabled={selectedRows.length === 0}
                className='ui button basic blue m-r-md'
                onClick={this.onBulkReactivate}
              >
                {t('common.reactivate')}
              </button>
            ) : null}
            <button
              disabled={selectedRows.length === 0}
              className='ui button basic blue m-r-md'
              onClick={this.onBulkBuild}
            >
              {t('common.build')}
            </button>
          </div>

          <RequireOrganization
            WithOrganization={() => (
              <Link className='ui button basic blue m-r-md' to={'/projects/new'}>
                {t('sidebar.addProject')}
              </Link>
            )}
            Fallback={() => (
              <button className='ui button disabled basic blue m-r-md' disabled>
                {t('sidebar.addProject')}
              </button>
            )}
          />
        </div>
      </div>
    );
  }
}

export default compose<IOwnProps, IOwnProps>(
  withTranslations,
  withRouter,
  withBulkActions,
  connect(function mapStateToProps(state, { filter: tableName }) {
    return {
      selectedRows: rowSelectionsFor(state, tableName),
      allCheckboxState: allCheckboxStateFor(state, tableName),
    };
  })
)(Header);
