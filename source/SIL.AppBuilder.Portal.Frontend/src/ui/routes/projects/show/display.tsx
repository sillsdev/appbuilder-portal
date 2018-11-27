import * as React from 'react';
import { match as Match } from 'react-router';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Tab, Dropdown, Menu } from 'semantic-ui-react';

import { attributesFor, ProjectResource } from '@data';
import { i18nProps } from '@lib/i18n';
import TimezoneLabel from '@ui/components/labels/timezone';

import Details from './details';
import Products from './products';
import Owners from './owners';
import Reviewers from './reviewers';
import Settings from './settings';
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

type IProps =
  & PassedProps
  & QueriedProps
  & i18nProps;

class Display extends React.Component<IProps> {

  renderTabPanes = () => {
    const { t, project } = this.props;

    const tabPanes = [{
      menuItem: (
        <Menu.Item
          key={1}
          className='bold p-b-sm p-l-md p-r-md uppercase'
          data-test-project-files-tab
          name={t('project.overview')}
        />
      ),
      render: () =>
        <Tab.Pane attached={false}>
          <div className='flex-lg p-b-xxl-lg'>
            <div className='flex-grow p-r-lg-lg'>
              <Details project={project} />
              <Products project={project} />
              <Settings project={project} />
            </div>
            <div className='thin-border w-50-lg m-t-lg-xs-only m-t-lg-sm-only'>
              <Owners project={project} />
              <Reviewers project={project} />
            </div>
          </div>
        </Tab.Pane>

    }, {
      menuItem: (
        <Menu.Item
          key={2}
          className='bold p-d-sm  p-l-md p-r-md uppercase'
          data-test-project-files-tab
          name={t('project.productFiles')}
        />
      ),
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
    const { project, t } = this.props;
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

    return (
      <div className='project-details' data-test-project>
        <div className='page-heading page-heading-border-sm'>
          <div className='flex justify-content-space-around'>
            <div className='flex-grow'>
              <h1 data-test-project-name className='fs-24 m-b-sm'>
                {name}
              </h1>
              <div>
                <span data-test-project-visibility-label>
                  {visibility}
                </span>
                <span className='font-normal m-l-md m-r-md'>.</span>
                <span className='font-normal'>{t('project.createdOn')} </span>
                <TimezoneLabel dateTime={dateCreated} />
              </div>
            </div>
            <div className='flex-shrink'>
              <Dropdown
                pointing='top right'
                icon={null}
                trigger={
                  <MoreVerticalIcon />
                }
              >
                <Dropdown.Menu>
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

        <Tab menu={{ text: true }} panes={this.renderTabPanes()} className='tabs' />
      </div>
    );
  }

}

export default Display;
