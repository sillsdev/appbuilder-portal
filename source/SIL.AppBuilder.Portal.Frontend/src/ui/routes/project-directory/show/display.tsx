import * as React from 'react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Tab, Dropdown, Menu } from 'semantic-ui-react';


import { ProjectResource, attributesFor } from '@data';
import { i18nProps } from '@lib/i18n';
import TimezoneLabel from '@ui/components/labels/timezone';



import { IExpectedPropsForRoute } from './types';

interface IExpectedProps {
  project: ProjectResource;
}

type IProps =
  & IExpectedPropsForRoute
  & IExpectedProps
  & i18nProps;

export default class Display extends React.Component<IProps> {
  render() {
    const { project, t } = this.props;
    const { name, dateCreated, isPublic } = attributesFor(project);

    console.log(project);
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
            {/* <div className='flex-shrink'>
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
            </div> */}
          </div>
        </div>

        {/* <Tab menu={{ text: true }} panes={this.renderTabPanes()} className='tabs' /> */}
      </div>
    );
  }
}