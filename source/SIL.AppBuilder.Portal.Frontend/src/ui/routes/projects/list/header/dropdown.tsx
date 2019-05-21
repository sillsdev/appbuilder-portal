import React from 'react';
import CaretDown from '@material-ui/icons/KeyboardArrowDown';
import { Dropdown } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

import { useTranslations } from '~/lib/i18n';

import { PROJECT_ROUTES } from './routes';

export function ProjectFilterDropdown({ filter }) {
  const { t } = useTranslations();

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
  );
}
