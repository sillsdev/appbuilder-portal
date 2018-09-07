import * as React from 'react';
import { compose } from 'recompose';
import { withData, WithDataProps } from 'react-orbitjs';
import { withTranslations, i18nProps } from '@lib/i18n';
import * as toast from '@lib/toast';

import { TYPE_NAME as PROJECT } from '@data/models/project';
import { defaultOptions } from '@data';


export function withSettings(WrappedComponent) {

  class DataWrapper extends React.Component<WithDataProps & i18nProps> {

    getMessage = (fieldName, type = 'on') => {

      const { t } = this.props;

      return t(`users.operations.${fieldName}.${type}`);

    }

    toggleField = async (projectId, fieldName, newToggleState) => {

      const { updateStore } = this.props;

      try {

        updateStore(t => t.replaceAttribute(
          { type: PROJECT, id: projectId },
          fieldName,
          newToggleState
        ), defaultOptions());
        toast.success(this.getMessage(fieldName, newToggleState ? 'on': 'off'));
      } catch (e) {
        console.log(e);
        toast.error(this.getMessage(fieldName,'error'));
      }

    }

    render() {

      const actionProps = {
        toggleField: this.toggleField
      };

      return (
        <WrappedComponent {...actionProps} {...this.props} />
      );
    }
  }

  return compose(
    withData({}),
    withTranslations
  )(DataWrapper);

}