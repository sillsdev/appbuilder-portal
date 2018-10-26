
import * as React from 'react';
import { match as Match } from 'react-router';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Tab, Dropdown, Menu } from 'semantic-ui-react';


import { attributesFor, ProjectResource } from '@data';
import Details from './details';
import Products from './products';
import Owners from './owners';
import Reviewers from './reviewers';
import Settings from './settings';
import { IProvidedProps as ITimeProps } from '@lib/with-moment-timezone';
import { i18nProps } from '@lib/i18n';

import './project.scss';

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

export type IProps =
  & PassedProps
  & QueriedProps
  & i18nProps
  & ITimeProps;

class Display extends React.Component<IProps> {

  renderTabPanes = () => {
    const { t, project } = this.props;

    const tabPanes = [{
      menuItem: <Menu.Item key={1} data-test-project-files-tab name={t('project.overview')} />,
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

    },{
      menuItem: <Menu.Item key={2} data-test-project-files-tab name={t('project.productFiles')} />,
      render: () =>
        <Tab.Pane attached={false}>
          <Files project={project} />
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

    const { name, dateCreated, dateArchived, isPublic } = attributesFor(project);

    const toggleText = !dateArchived ?
      t('project.dropdown.archive') :
      t('project.dropdown.reactivate');

    const visibility = isPublic ?
      t('project.public') :
      t('project.private');

    const createdFromNow = moment(dateCreated + "Z").tz(timezone).fromNow();

    return (
      <div className='ui container project-details' data-test-project>
        <div className='page-heading page-heading-border-sm'>
          <div className='flex justify-content-space-around'>
            <div className='flex-grow'>
              <h1 className='title'>{name}</h1>
              <div className='subtitle'>
                <span data-test-project-visibility-label>{visibility}</span><span className='dot-space font-normal'>.</span>
                <span className='font-normal'>{t('project.createdOn')} </span>
                <span>{createdFromNow}</span>
              </div>
            </div>
            <div className='flex-shrink' style={{ paddingTop: '20px'}}>
              <Dropdown
                pointing='top right'
                icon={null}
                trigger={
                  <MoreVerticalIcon />
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

export default Display;
