import * as React from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '@lib/i18n';
import { ROLE } from '@data/models/role';
import { RequireOrganization, RequireRole } from '@ui/components/authorization';

import './styles.scss';

import { ProjectFilterDropdown } from './dropdown';
import { HeaderSearch } from './search';
import { BulkButtons } from './bulk-buttons';

import Sidebar from '~/ui/components/sidebar';

interface IOwnProps {
  filter: string;
  onSearch: (term: string) => any;
  onBulkActionComplete?: () => void;
}

export default function Header({ filter, onSearch }: IOwnProps) {
  const { t } = useTranslations();
  const afterBulkAction = () => {
    if (this.props.onBulkActionComplete) {
      this.props.onBulkActionComplete();
    }
  };

  return (
    <div className='flex-col p-t-md-xs' data-test-project-action-header>
      <div className='flex justify-content-space-between p-b-md-xs'>
        <div>
          <ProjectFilterDropdown filter={filter} />
        </div>
        <div className='flex align-items-center'>
          <div className='flex align-items-center'>
            <HeaderSearch onSearch={onSearch} />
          </div>
        </div>
      </div>

      <div className='flex justify-content-space-between p-b-md-xs'>
        <div>
          <BulkButtons afterBulkAction={afterBulkAction} tableName={filter} />
        </div>

        <div className='flex justify-content-space-between p-b-md-xs'>
          <RequireRole roleName={ROLE.OrganizationAdmin}>
            <RequireOrganization
              WithOrganization={() => (
                <Link className='ui button basic blue m-r-md' to={'/projects/import'}>
                  {t('sidebar.importProjects')}
                </Link>
              )}
              Fallback={() => (
                <button className='ui button disabled basic blue m-r-md' disabled>
                  {t('sidebar.importProjects')}
                </button>
              )}
            />
          </RequireRole>

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
    </div>
  );
}
