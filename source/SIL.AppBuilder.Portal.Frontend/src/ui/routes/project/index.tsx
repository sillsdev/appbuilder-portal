import * as React from 'react';

import { compose } from 'recompose';
import { match as Match } from 'react-router';

import { Tab, Dropdown, Icon } from 'semantic-ui-react';

import { ProjectAttributes } from '@data/models/project';
import { withCurrentUser, IProvidedProps } from '@data/containers/with-current-user';
import { withLayout } from '@ui/components/layout';

import Details from './details';
import Products from './products';
import Settings from './settings';
import Owners from './owners';
import Reviewers from './reviewers';
import { withData } from './with-data';
import { withProjectOperations } from './with-project-operations';
import { withAccessRestriction } from './with-access-restriction';


import './project.scss';
import { ResourceObject } from 'jsonapi-typescript';
import { PROJECTS_TYPE } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';
import { attributesFor } from '@data/helpers';
import { withMomentTimezone, IProvidedProps as ITimeProps } from '@lib/with-moment-timezone';

export const pathName = '/project/:id';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
  toggleArchiveProject: (project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>) => void;
}

interface QueriedProps {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

export type IProps =
  & PassedProps
  & QueriedProps
  & i18nProps
  & ITimeProps;

class Project extends React.Component<IProps> {

  renderTabPanes = () => {
    const { t, project } = this.props;

    const tabPanes = [{
      menuItem: t('project.overview'),
      render: () =>
        <Tab.Pane attached={false}>
          <div className='flex'>
            <div className='flex-grow' style={{marginRight: '33px'}}>
              <Details project={project} />
              <Products project={project} />
              <Settings project={project} />
            </div>
            <div className='project-aside'>
              <Owners project={project} />
              <Reviewers project={project} />
            </div>
          </div>
        </Tab.Pane>

    }];

    return tabPanes;
  }

  toggleArchivedProject = (e) => {
    e.preventDefault();

    const { project, toggleArchiveProject } = this.props;

    toggleArchiveProject(project);
  }

  render() {
    const { project, t, moment, timezone } = this.props;

    if (!project || !project.attributes) {
      return null;
    }

    const { name, dateCreated, dateArchived } = attributesFor(project);

    const toggleText = !dateArchived ?
      t('project.dropdown.archive') :
      t('project.dropdown.reactivate');


    return (
      <div className='ui container project-details' data-test-project>
        <div className='page-heading page-heading-border-sm'>
          <div className='flex justify-content-space-around'>
            <div className='flex-grow'>
              <h1 className='title'>{name}</h1>
              <div className='subtitle'>
                <span>Public</span><span className='dot-space font-normal'>.</span>
                <span className='font-normal'>{t('project.createdOn')} </span>
                <span>{moment.tz(dateCreated, timezone).fromNow()}</span>
              </div>
            </div>
            <div className='flex-shrink' style={{ paddingTop: '20px'}}>
              <Dropdown
                pointing='top right'
                icon={null}
                trigger={
                  <Icon name='ellipsis vertical' size='large' />
                }
              >
                <Dropdown.Menu>
                  <Dropdown.Item text={t('project.dropdown.transfer')} />
                  <Dropdown.Item
                    data-test-archive
                    text={toggleText}
                    onClick={this.toggleArchivedProject}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>

        <Tab menu={{ text: true }} panes={this.renderTabPanes()} className='project-tabs' />
      </div>
    );
  }

}

export default compose(
  withTranslations,
  // requireAuth,
  withLayout,
  withMomentTimezone,
  withData,
  withProjectOperations,
  withAccessRestriction
)(Project);
