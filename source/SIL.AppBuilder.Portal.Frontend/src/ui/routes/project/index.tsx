import * as React from 'react';

import * as moment from 'moment';
import { compose } from 'recompose';
import { match as Match } from 'react-router';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { Tab, Dropdown, Icon } from 'semantic-ui-react';

import { TYPE_NAME, ProjectAttributes } from '@data/models/project';
import { withCurrentUser } from '@data/containers/with-current-user';
import { withLayout } from '@ui/components/layout';
import { requireAuth } from '@lib/auth';

import Details from './details';
import Products from './products';
import Settings from './settings';
import Location from './location';
import Owners from './owners';
import Reviewers from './reviewers';
import { withData } from './with-data';
import { withProjectOperations } from './with-project-operations';
import { withAccessRestriction } from './with-access-restriction';


import './project.scss';
import { ResourceObject } from 'jsonapi-typescript';
import { PROJECTS_TYPE } from '@data';

export const pathName = '/project/:id';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
  timeAgo: any;
  toggleArchiveProject: (project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>) => void;
}

interface QueriedProps {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

export type IProps =
  & PassedProps
  & QueriedProps
  & i18nProps;

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
    const { project, t, timeAgo } = this.props;

    if (!project || !project.attributes) {
      return null;
    }

    const { name, dateCreated, dateArchived } = project.attributes;

    return (
      <div className='ui container project-details' data-test-project>
        <div className='page-heading page-heading-border-sm'>
          <div className='flex justify-content-space-around'>
            <div className='flex-grow'>
              <h1 className='title'>{name}</h1>
              <div className='subtitle'>
                <span>Public</span><span className='dot-space font-normal'>.</span>
                <span className='font-normal'>{t('project.createdOn')} </span>
                <span>{moment(dateCreated).fromNow()}</span>
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
                    text={!dateArchived ? t('project.dropdown.archive') : t('project.dropdown.reactivate')}
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
  requireAuth,
  withLayout,
  translate('translations'),
  withProjectOperations,
  withData,
  withCurrentUser(),
  withAccessRestriction
)(Project);
