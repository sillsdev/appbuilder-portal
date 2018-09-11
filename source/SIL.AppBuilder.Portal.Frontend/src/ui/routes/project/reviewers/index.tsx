import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { ResourceObject } from 'jsonapi-typescript';
import { Icon } from 'semantic-ui-react'

import { ProjectAttributes } from '@data/models/project';
import { ReviewerAttributes } from '@data/models/reviewer';
import { attributesFor } from '@data';
import { PROJECTS_TYPE, REVIEWERS_TYPE } from '@data';
import { withReviewers } from './with-reviewers';
import { withDataActions, IProvidedProps } from '@data/containers/resources/reviewer/with-data-actions';
import { withTemplateHelpers, Mut } from 'react-action-decorators';
import { isEmpty } from '@lib/collection';
import { isValidEmail } from '@lib/validations';

import './styles.scss';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
  reviewers: Array<ResourceObject<REVIEWERS_TYPE, ReviewerAttributes>>;
}

type IProps =
  & Params
  & i18nProps
  & IProvidedProps;

@withTemplateHelpers
class Reviewers extends React.Component<IProps> {

  mut: Mut;

  state = {
    isAddFormVisible: false,
    name: '',
    nameError: '',
    email: '',
    emailError: ''
  }

  toggleAddForm = () => {
   this.setState({ isAddFormVisible: !this.state.isAddFormVisible });
  }

  resetForm = () => {
    this.setState({
      name: '',
      nameError: '',
      email: '',
      emailError: ''
    })
  }

  isValidForm = () => {
    const { name, email } = this.state;

    isEmpty(name) && this.setState({ nameError: 'Name cannot be empty' });
    isEmpty(email) && this.setState({ emailError: 'Email cannot be empty' });
    !isValidEmail(email) && this.setState({ emailError: 'Invalid email address' });

    return !isEmpty(name) && !isEmpty(email) && isValidEmail(email);
  }

  addReviewer = () => {
    const { name, email } = this.state;
    const { createRecord, project } = this.props;

    try {

      if (this.isValidForm()) {

        const attributes = { name, email };
        const relationships = { project: { data: { type: 'project', id: project.id } } }

        createRecord(attributes, relationships);
        this.resetForm();

      }

    } catch(e) {
      console.error(e);
    }
  }

  removeReviewer = (reviewer) => () => {

    const { removeRecord } = this.props;

    try {
      removeRecord(reviewer);
    } catch (e) {
      console.error(e);
    }

  }

  render() {

    const { mut } = this;
    const { t, reviewers } = this.props;
    const { isAddFormVisible, name, nameError, email, emailError } = this.state;

    return (
      <div className='reviewers'>
        <div className='flex justify-content-space-around header align-items-center'>
          <h4 className='flex-grow'>{t('project.side.reviewers.title')}</h4>
          <a href='#' onClick={this.toggleAddForm}>
            { isAddFormVisible ?
              t('project.side.reviewers.close') :
              t('project.side.reviewers.add')
            }
          </a>
        </div>
        {
          isAddFormVisible &&
          <form className='ui form add-form' onSubmit={this.addReviewer}>
            <div className='field'>
              <input
                type='text'
                placeholder={t('project.side.reviewers.form.name')}
                value={name}
                onChange={mut('name')}
              />
              { nameError && <span className='error'>{nameError}</span> }
            </div>
            <div className='field'>
              <input
                type='text'
                placeholder={t('project.side.reviewers.form.email')}
                value={email}
                onChange={mut('email')}
              />
              {emailError && <span className='error'>{emailError}</span>}
            </div>
            <button className='ui button'>{t('project.side.reviewers.form.submit')}</button>
          </form>
        }
        <div className='list'>
        {
          reviewers && reviewers.map((reviewer,index) => {

            const { name, email } = attributesFor(reviewer);
            const itemText = `${name} (${email})`;
            return (
              <div key={index} className='flex justify-content-space-between item'>
                <div>{itemText}</div>
                <div>
                  <a href='#' onClick={this.removeReviewer(reviewer)}>
                    <Icon name='close'/>
                  </a>
                </div>
              </div>
            )
          })
        }
        </div>
      </div>
    );

  }

}

export default compose(
  translate('translations'),
  withReviewers,
  withDataActions
)(Reviewers);