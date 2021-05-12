import * as React from 'react';
import { compose } from 'recompose';
import CloseIcon from '@material-ui/icons/Close';
import { ResourceObject } from 'jsonapi-typescript';
import { AuthorAttributes } from '@data/models/author';

import { attributesFor, AUTHORS_TYPE } from '@data';

import {
  withDataActions,
  IProvidedProps,
} from '@data/containers/resources/author/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';
import { WithDataProps } from 'react-orbitjs';
import { retrieveRelation } from '~/data/containers/with-relationship';

interface Params {
  author: ResourceObject<AUTHORS_TYPE, AuthorAttributes>;
}

type IProps = Params & i18nProps & IProvidedProps & WithDataProps;

class AuthorItem extends React.Component<IProps> {
  removeAuthor = (e) => {
    e.preventDefault();

    const { removeRecord } = this.props;

    try {
      removeRecord();
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const { author, dataStore  } = this.props;
    const user = dataStore.cache.query((q) => q.findRelatedRecord(author, 'user'));
    const { name } = attributesFor(user);
    
    const itemText = name;

    return (
      <div
        data-test-project-reviewer-item
        className='flex justify-content-space-between align-items-center item'
      >
        <div data-test-project-reviewer-item-text>{itemText}</div>
        <div className='flex align-items-center'>
          <a data-test-project-reviewers-remove-item href='#' onClick={this.removeAuthor}>
            <CloseIcon />
          </a>
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations,
  withDataActions
)(AuthorItem);
