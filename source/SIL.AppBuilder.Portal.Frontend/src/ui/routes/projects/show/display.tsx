import React from 'react';
import { match as Match } from 'react-router';
import { idFromRecordIdentity, useOrbit } from 'react-orbitjs';

import { ProjectResource } from '@data';

import { useCurrentUser } from '@data/containers/with-current-user';
import { useDataActions } from '@data/containers/resources/project/with-data-actions';
import { useTranslations } from '@lib/i18n';
import * as toast from '@lib/toast';

import Overview from './overview';
import Header from './header';

import { useLiveData } from '~/data/live';

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

export default function ProjectShowDisplay({ project }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();
  const { updateOwner, toggleArchiveProject } = useDataActions(project);
  const url = `projects/${idFromRecordIdentity(dataStore, project)}`;
  useLiveData(url);

  const claimOwnership = async () => {
    try {
      await updateOwner(currentUser);

      toast.success(t('project.claimSuccess'));
    } catch (e) {
      toast.error(e);
    }
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
          claimOwnership,
          toggleArchive: toggleArchiveProject,
        }}
      />

      <Overview project={project} />
    </div>
  );
}
