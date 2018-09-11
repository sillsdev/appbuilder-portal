import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import * as toast from '@lib/toast';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { buildFindRelatedRecords } from '@data';

import { withDataActions, IProvidedProps } from '@data/containers/resources/project/with-data-actions';

import { withLoader } from '@data/containers/with-loader';
import { withError } from '@data/containers/with-error';

type IProps =
  i18nProps &
  IProvidedProps &
  WithDataProps;

export function withReviewers(WrappedComponent) {

  function mapRecordsToProps(passedProps) {

    const { project } = passedProps;

    return {
      reviewers: q => buildFindRelatedRecords(q, project, 'reviewers')
    };
  }

  class DataWrapper extends React.Component<IProps> {

    addReviewer = (name, email) => {



    }

    removeReviewer = () => {

    }

    render() {

      const actionProps = {
        addReviewer: this.addReviewer,
        removeReviewer: this.addReviewer
      };

      return (
        <WrappedComponent {...actionProps} {...this.props} />
      );
    }

  }

  return compose(
    withDataActions,
    withTranslations,
    withError('error', ({ error }) => error),
    withOrbit(mapRecordsToProps),
  )(DataWrapper);

}