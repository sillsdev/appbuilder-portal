import * as React from 'react';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';
import { ProjectResource, firstError, pushPayload, PUSH_PAYLOAD_OPERATION } from '@data';
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

    doOperation = async (operationData) => {
      const { updateStore, t } = this.props;

      const response = await authenticatedPatch(
        '/api/operations',
        {
          data: operationData,
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
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

      const promises = operations.map(({ op, data }) => {
        return pushPayload(
          updateStore,
          { data },
          PUSH_PAYLOAD_OPERATION.REPLACE_RECORD
        );
      });

      try {
        await Promise.all(promises);
      } catch (e) {
        console.log(e);
      }
    }

    bulkArchive = async (projects: ProjectResource[]) => {

      const { moment } = this.props;

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

      this.doOperation(data);
    }

    bulkReactivate = (projects: ProjectResource[]) => {
      const data = {
        operations: projects.map(p => ({
          op: 'update',
          data: {
            id: idFromRecordIdentity(p),
            type: 'projects',
            attributes: {
              "date-archived": null
            }
          }
        }))
      };

      this.doOperation(data);
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
