import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import * as toast from '@lib/toast';
import {
  withDataActions,
  IProvidedProps,
} from '@data/containers/resources/project/with-data-actions';

export function withSettings(WrappedComponent) {
  class DataWrapper extends React.Component<i18nProps & IProvidedProps> {
    getMessage = (fieldName, type = 'on') => {
      const { t } = this.props;

      return t(`project.operations.${fieldName}.${type}`);
    };

    toggleField = async (fieldName, newToggleState) => {
      const { updateAttribute } = this.props;

      try {
        await updateAttribute(fieldName, newToggleState);
        toast.success(this.getMessage(fieldName, newToggleState ? 'on' : 'off'));
      } catch (e) {
        console.log(e);
        toast.error(this.getMessage(fieldName, 'error'));
      }
    };

    render() {
      const actionProps = {
        toggleField: this.toggleField,
      };

      return <WrappedComponent {...actionProps} {...this.props} />;
    }
  }

  return compose(withDataActions, withTranslations)(DataWrapper);
}
