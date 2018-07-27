import * as React from 'react';

import { match as Match } from 'react-router';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';
import { TYPE_NAME, ProjectAttributes } from '@data/models/project';
import { withStubbedDevData } from '@data/with-stubbed-dev-data';
import { withData, WithDataProps } from 'react-orbitjs';
import { withLayout } from '@ui/components/layout';
import { withTimeAgo } from '@lib/with-time-ago';
import { Tab, Dropdown, Icon } from 'semantic-ui-react';
import Details from './details';
import Products from './products';
import Settings from './settings';
import Location from './location';
import Owners from './owners';
import Reviewers from './reviewers';

import './project.scss';

export const pathName = '/project/:id';

export interface Params {
  id: string;
}

interface PassedProps {
  match: Match<Params>;
  timeAgo: any;
}

interface QueriedProps {
  project: JSONAPI<ProjectAttributes>;
}

const mapRecordsToProps = (ownProps: PassedProps) => {
  const { match } = ownProps;
  const { params: { id } } = match;

  return {
    project: q => q.findRecord({ id: id, type: TYPE_NAME }),
  };
};

export type IProps =
  & PassedProps
  & WithDataProps
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
              <Location project={project} />
              <Owners project={project} />
              <Reviewers project={project} />
            </div>
          </div>
        </Tab.Pane>

    }]

    return tabPanes;
  }

  render() {

    const { project, t, timeAgo } = this.props;
    const { name, createdOn } = project.attributes;

    return (
      <div className='ui container project-details'>
        <div className='page-heading page-heading-border-sm'>
          <div className='flex justify-content-space-around'>
            <div className='flex-grow'>
              <h1 className='title'>{name}</h1>
              <div className='subtitle'>
                <span>Public</span><span className='dot-space font-normal'>.</span><span className='font-normal'>{`${t('project.createdOn')}`} </span><span>{timeAgo && timeAgo.format(createdOn)}</span>
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
                  <Dropdown.Item text={t('project.dropdown.archive')} />
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
  withLayout,
  withStubbedDevData(TYPE_NAME, 'some-project-id', {
    name: 'Sogdian Bible public domain',
    status: 'public',
    createdOn: (Date.now() - 2 * 24 * 60 * 60 * 1000),
    language: 'Sogdian',
    type: 'Scripture App Builder',
    description: 'The Sogdian Bible was translated by Mike Davis and his team that has been working in Central Asia since 1986. The full New Testament translation was completed in 2018 and has been made open source for all to use and enjoy. ',
    automaticRebuild: false,
    allowOtherToDownload: false,
    location: 'ssh://APKAJUBOR7RPL25QO5JA@git-codecommit.us-east-1.amazonaws.com/v1/repos/SIL-sog-Sogdian-Bible-Public-Domain'
  }),
  withData(mapRecordsToProps),
  withTimeAgo,
  translate('translations')
)(Project);
