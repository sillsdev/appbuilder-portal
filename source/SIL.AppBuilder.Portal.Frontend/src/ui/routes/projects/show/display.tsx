import * as React from 'react';
import { match as Match } from 'react-router';
import { Tab, Menu } from 'semantic-ui-react';

import { ProjectResource } from '@data';

import { useCurrentUser } from '@data/containers/with-current-user';
import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import { useTranslations } from '@lib/i18n';

import Overview from './overview';
import Header from './header';
import Files from './files';

export const pathName = '/projects/:id';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
  toggleArchiveProject: (project: ProjectResource) => void;
}

interface QueriedProps {
  project: ProjectResource;
}

type IProps = PassedProps & QueriedProps;

export default function ProjectShowDisplay({ project, toggleArchiveProject }: IProps) {
  const { t } = useTranslations();
  const { currentUser } = useCurrentUser();
  const { updateOwner } = useDataActions(project);

  const toggleArchive = (e) => {
    e.preventDefault();

    toggleArchiveProject(project);
  };

  const claimOwnership = (e) => {
    e.preventDefault();

    updateOwner(currentUser);
  };

  if (!project || !project.attributes) {
    return null;
  }

  return (
    <div className='project-details' data-test-project>
      <Header
        {...{
          t,
          project,
          toggleArchive,
          claimOwnership,
        }}
      />

      <Tab
        menu={{ text: true }}
        className='tabs'
        panes={[
          {
            menuItem: (
              <Menu.Item
                key={1}
                className='bold p-b-sm p-l-md p-r-md uppercase'
                data-test-project-overview-tab
                name={t('project.overview')}
              />
            ),
            render: () => (
              <Tab.Pane attached={false}>
                <Overview project={project} />
              </Tab.Pane>
            ),
          },
          {
            menuItem: (
              <Menu.Item
                key={2}
                className='bold p-d-sm  p-l-md p-r-md uppercase'
                data-test-project-files-tab
                name={t('project.productFiles')}
              />
            ),
            render: () => (
              <Tab.Pane attached={false}>
                <Files project={project} />
              </Tab.Pane>
            ),
          },
        ]}
      />
    </div>
  );
}
