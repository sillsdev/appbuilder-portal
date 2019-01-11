import * as React from 'react';
import { compose } from 'recompose';
import CloseIcon from '@material-ui/icons/Close';
import { ResourceObject } from 'jsonapi-typescript';

import { ReviewerAttributes } from '@data/models/reviewer';
import { attributesFor } from '@data';
import { REVIEWERS_TYPE } from '@data';
import { withDataActions, IProvidedProps } from '@data/containers/resources/reviewer/with-data-actions';
import { withTranslations, i18nProps } from '@lib/i18n';


interface Params {
  reviewer: ResourceObject<REVIEWERS_TYPE, ReviewerAttributes>;
}

type IProps =
  & Params
  & i18nProps
  & IProvidedProps;

class ReviewerItem extends React.Component<IProps> {

  removeReviewer = (e) => {
    e.preventDefault();

    const { removeRecord } = this.props;

    try {
      removeRecord();
    } catch (e) {
      console.error(e);
    }

  }

  render() {

    const { reviewer } = this.props;
    const { name, email } = attributesFor(reviewer);
    const itemText = `${name} (${email})`;

    return (
      <div
        data-test-project-reviewer-item
        className='flex justify-content-space-between align-items-center item'
      >
        <div data-test-project-reviewer-item-text>
          {itemText}
        </div>
        <div className='flex align-items-center'>
          <a data-test-project-reviewers-remove-item href='#' onClick={this.removeReviewer}>
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
)(ReviewerItem);