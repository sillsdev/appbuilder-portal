import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { withTemplateHelpers, Mut } from 'react-action-decorators';


import { isEmpty } from '@lib/collection';
import { isValidEmail } from '@lib/validations';
import { ResourceObject } from 'jsonapi-typescript';
import { ProjectAttributes } from '@data/models/project';
import { PROJECTS_TYPE } from '@data';
import { withDataActions, IProvidedProps } from '@data/containers/resources/reviewer/with-data-actions';

interface Params {
  project: ResourceObject<PROJECTS_TYPE, ProjectAttributes>;
}

type IProps =
  & Params
  & i18nProps
  & IProvidedProps;

@withTemplateHelpers
class AddReviewerForm extends React.Component<IProps> {

  mut: Mut;

  state = {
    name: '',
    nameError: '',
    email: '',
    emailError: ''
  };

  resetForm = () => {
    this.setState({
      name: '',
      nameError: '',
      email: '',
      emailError: ''
    });
  }

  isValidForm = () => {
    const { name, email } = this.state;
    const { t } = this.props;

    if (isEmpty(name)) {
      this.setState({ nameError: t('project.side.reviewers.form.nameError') });
    }

    if (isEmpty(email)) {
      this.setState({ emailError: t('project.side.reviewers.form.emptyEmailError') });
    }

    if (!isValidEmail(email)) {
      this.setState({ emailError: t('project.side.reviewers.form.invalidEmailError') });
    }

    return !isEmpty(name) && !isEmpty(email) && isValidEmail(email);
  }

  addReviewer = () => {
    const { name, email } = this.state;
    const { createRecord, project } = this.props;

    try {

      if (this.isValidForm()) {

        const attributes = { name, email };
        const relationships = { project: { data: { type: 'project', id: project.id } } };

        createRecord(attributes, relationships);
        this.resetForm();

      }

    } catch (e) {
      console.error(e);
    }
  }

  render() {

    const { mut } = this;
    const { t } = this.props;
    const { name, nameError, email, emailError } = this.state;

    return (
      <form className='ui form add-form' onSubmit={this.addReviewer}>
        <div className='field'>
          <input
            type='text'
            placeholder={t('project.side.reviewers.form.name')}
            value={name}
            onChange={mut('name')}
          />
          {nameError && <span className='error'>{nameError}</span>}
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
    )
  }

}

export default compose(
  translate('translations'),
  withDataActions
)(AddReviewerForm);