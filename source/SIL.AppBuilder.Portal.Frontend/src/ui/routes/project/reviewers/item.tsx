import * as React from 'react';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { ResourceObject } from 'jsonapi-typescript';
import { Icon } from 'semantic-ui-react';

import { ReviewerAttributes } from '@data/models/reviewer';
import { attributesFor } from '@data';
import { REVIEWERS_TYPE } from '@data';
import { withDataActions, IProvidedProps } from '@data/containers/resources/reviewer/with-data-actions';

interface Params {
  reviewer: ResourceObject<REVIEWERS_TYPE, ReviewerAttributes>;
}

type IProps =
  & Params
  & i18nProps
  & IProvidedProps;

class ReviewerItem extends React.Component<IProps> {

  removeReviewer = (reviewer) => () => {

    const { removeRecord } = this.props;

    try {
      removeRecord(reviewer);
    } catch (e) {
      console.error(e);
    }

  }

  render() {

    const { reviewer } = this.props;
    const { name, email } = attributesFor(reviewer);
    const itemText = `${name} (${email})`;

    return (
      <div className='flex justify-content-space-between item'>
        <div>{itemText}</div>
        <div>
          <a href='#' onClick={this.removeReviewer(reviewer)}>
            <Icon name='close' />
          </a>
        </div>
      </div>
    );
  }

}

export default compose(
  translate('translations'),
  withDataActions
)(ReviewerItem);