import * as React from 'react';
import { compose } from 'recompose';

import { ProjectResource, AuthorResource } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import { WithDataProps } from 'react-orbitjs';

import { withAuthors } from './with-authors';
import AddAuthorForm from './form';
import AuthorItem from './item';

import './styles.scss';

interface INeededProps {
  project: ProjectResource;
}

interface IDataProps {
  authors: AuthorResource[];
}

type IProps = IDataProps & INeededProps & i18nProps & WithDataProps;

class Authors extends React.Component<IProps> {
  state = {
    isAddFormVisible: false,
  };

  toggleAddForm = (e) => {
    e.preventDefault();
    this.setState({ isAddFormVisible: !this.state.isAddFormVisible });
  };

  render() {
    const { t, authors, project, dataStore } = this.props;
    const { isAddFormVisible } = this.state;

    const group = dataStore.cache.query((q) => q.findRelatedRecord(project, 'group'));
    const organization = dataStore.cache.query((q) => q.findRelatedRecord(project, 'organization'));

    const text = isAddFormVisible ? t('project.side.authors.close') : t('project.side.authors.add');

    return (
      <div data-test-project-authors className='authors'>
        <div className='flex justify-content-space-around thin-bottom-border align-items-center p-md'>
          <h4 className='flex-grow m-none'>{t('project.side.authors.title')}</h4>
          <a data-test-project-reviewers-toggler href='#' onClick={this.toggleAddForm}>
            {text}
          </a>
        </div>
        {isAddFormVisible && (
          <AddAuthorForm project={project} organization={organization} group={group} />
        )}
        <div className='list'>
          {authors && authors.map((author) => <AuthorItem key={author.id} author={author} />)}
        </div>
      </div>
    );
  }
}

export default compose<IProps, INeededProps>(
  withTranslations,
  withAuthors
)(Authors);
