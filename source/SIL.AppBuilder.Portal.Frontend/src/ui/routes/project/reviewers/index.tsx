import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { ResourceObject } from 'jsonapi-typescript';
import { Icon } from 'semantic-ui-react';

import { ProjectAttributes } from '@data/models/project';
import { ReviewerAttributes } from '@data/models/reviewer';

import { PROJECTS_TYPE, REVIEWERS_TYPE } from '@data';
import { withReviewers } from './with-reviewers';

import AddReviewerForm from './form';
import ReviewerItem from './item';

import './styles.scss';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
  reviewers: Array<ResourceObject<REVIEWERS_TYPE, ReviewerAttributes>>;
}

type IProps =
  & Params
  & i18nProps;


class Reviewers extends React.Component<IProps> {

  state = {
    isAddFormVisible: false
  };

  toggleAddForm = () => {
   this.setState({ isAddFormVisible: !this.state.isAddFormVisible });
  }

  render() {

    const { t, reviewers, project } = this.props;
    const { isAddFormVisible } = this.state;

    const text = isAddFormVisible ?
      t('project.side.reviewers.close') :
      t('project.side.reviewers.add')

    return (
      <div className='reviewers'>
        <div className='flex justify-content-space-around header align-items-center'>
          <h4 className='flex-grow'>{t('project.side.reviewers.title')}</h4>
          <a href='#' onClick={this.toggleAddForm}>{text}</a>
        </div>
        { isAddFormVisible && <AddReviewerForm project={project} /> }
        <div className='list'>
        {
          reviewers && reviewers.map((reviewer,index) => (
            <ReviewerItem key={index} reviewer={reviewer} />
          ))
        }
        </div>
      </div>
    );

  }

}

export default compose(
  translate('translations'),
  withReviewers
)(Reviewers);