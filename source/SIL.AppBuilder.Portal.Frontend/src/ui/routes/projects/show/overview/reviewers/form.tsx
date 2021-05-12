import * as React from 'react';
import { compose } from 'recompose';
import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import { isEmpty } from '@lib/collection';
import { isValidEmail } from '@lib/validations';
import { ResourceObject } from 'jsonapi-typescript';
import { attributesFor } from '@data/helpers';
import { ProjectAttributes, ProjectResource } from '@data/models/project';
import { UserAttributes } from '@data/models/user';

import { USERS_TYPE } from '@data';

import {
  withDataActions,
  IProvidedProps,
} from '@data/containers/resources/reviewer/with-data-actions';
import { mutCreator, Mut } from 'react-state-helpers';

import { withTranslations } from '~/lib/i18n';

import { withCurrentUserContext } from '@data/containers/with-current-user';
import LocaleSelect from '@ui/components/inputs/locale-select';

interface Params {
  project: ProjectResource;
}
interface IOwnProps {
  currentUser: ResourceObject<USERS_TYPE, UserAttributes>;
}
type IProps = Params & i18nProps & IProvidedProps & IOwnProps;

class AddReviewerForm extends React.Component<IProps> {
  mut: Mut;

  state = {
    name: '',
    nameError: '',
    email: '',
    emailError: '',
    locale: '',
  };

  constructor(props) {
    super(props);

    this.mut = mutCreator(this);
  }

  resetForm = () => {
    this.setState({
      name: '',
      nameError: '',
      email: '',
      emailError: '',
    });
  };

  getLocale = () => {
    const { currentUser, i18n } = this.props;
    let { locale: defaultLocale } = this.state;
    if (isEmpty(defaultLocale)) {
      const attributes = attributesFor(currentUser) as UserAttributes;
      const userLocale = attributes.locale;
      defaultLocale = userLocale || i18n.language;
    }
    return defaultLocale;
  };

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
  };

  addReviewer = (e) => {
    e.preventDefault();

    const { name, email } = this.state;
    const { createRecord, project } = this.props;

    try {
      let locale = this.getLocale();
      if (this.isValidForm()) {
        const attributes = { name, email, locale };
        const relationships = { project: { data: { type: 'project', id: project.id } } };

        createRecord(attributes, relationships);
        this.resetForm();
      }
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const { mut } = this;
    const { t } = this.props;
    const { name, nameError, email, emailError, locale } = this.state;

    return (
      <form
        data-test-project-reviewers-add-form
        className='ui form add-form'
        onSubmit={this.addReviewer}
      >
        <div className='field'>
          <input
            data-test-project-reviewers-add-form-name
            type='text'
            placeholder={t('project.side.reviewers.form.name')}
            value={name}
            onChange={mut('name')}
          />
          {nameError && <span className='error'>{nameError}</span>}
        </div>
        <div className='field'>
          <input
            data-test-project-reviewers-add-form-email
            type='text'
            placeholder={t('project.side.reviewers.form.email')}
            value={email}
            onChange={mut('email')}
          />
          {emailError && <span className='error'>{emailError}</span>}
        </div>
        <div className='field'>
          <LocaleSelect selected={locale} onChange={mut('locale')} />
        </div>
        <button data-test-project-reviewers-add-form-submit className='ui button'>
          {t('project.side.reviewers.form.submit')}
        </button>
      </form>
    );
  }
}

export default compose(
  withTranslations,
  withDataActions,
  withCurrentUserContext
)(AddReviewerForm);
