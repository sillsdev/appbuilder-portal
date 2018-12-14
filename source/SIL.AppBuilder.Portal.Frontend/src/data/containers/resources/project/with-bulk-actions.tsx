import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { defaultOptions, ProjectResource, firstError, pushPayload } from '@data';
import { patch as authenticatedPatch, tryParseJson } from '@lib/fetch';

import { idFromRecordIdentity } from '@data/store-helpers';
import { ServerError } from '@data/errors/server-error';
import { withTranslations, i18nProps } from '@lib/i18n';
import {
  withMomentTimezone,
  IProvidedProps as TimezoneProps
} from '@lib/with-moment-timezone';

export interface IProvidedProps {
  bulkArchive: (projects: ProjectResource[]) => any;
  bulkReactivate: (projects: ProjectResource[]) => any;
}

type IProps =
  & WithDataProps
  & i18nProps
  & TimezoneProps;

export function withBulkActions(WrappedComponent) {

  class DataWrapper extends React.Component<IProps> {

    bulkArchive = async (projects: ProjectResource[]) => {
      const { dataStore, updateStore, moment, t } = this.props;

      const data = {
        operations: projects.map(p => ({
          op: 'update',
          data: {
            id: idFromRecordIdentity(p),
            type: 'projects',
            attributes: {
              "date-archived": moment().format('YYYY-MM-DD HH:mm:ss')
            }
          }
        }))
      };

      const response = await authenticatedPatch(
        '/api/operations',
        {
          data,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // TODO: refactor this into a function
      const status = response.status;
      const unauthorized = status === 401;

      if (status === 403 || status === 401) {

        let errorJson = {};
        try {
          errorJson = await tryParseJson(response);
        } catch (e) {
          // body is not json
          console.error('response body is not json', e);
        }
        const errorTitle = firstError(errorJson).title;
        const defaultMessage = unauthorized ?
          t('errors.notAuthorized') :
          t('errors.userForbidden');

        throw new Error(errorTitle || defaultMessage);
      }

      if (status >= 500) {
        const text = await response.text();
        throw new ServerError(status, text);
      }

      const { operations } = await tryParseJson(response);

      console.log(operations);

      const promises = operations &&
        operations.forEach(({op, data}) => {
        return pushPayload(updateStore, {data}, 'replaceRecord');
        });

      await Promise.all(promises);
    }



    bulkReactivate = (projects: ProjectResource[]) => {
      const { dataStore } = this.props;

      return dataStore.update(q =>
        projects.map(p =>
          q.replaceAttribute(p, 'dateArchived', null)
        ),
        defaultOptions()
      );
    }

    render() {
      const props = {
        ...this.props,
        bulkArchive: this.bulkArchive,
        bulkReactivate: this.bulkReactivate
      };

      return <WrappedComponent {...props} />;
    }
  }

  return compose(
    withTranslations,
    withOrbit({}),
    withMomentTimezone
  )(DataWrapper);
}