import * as React from 'react';
import { compose } from 'recompose';
import { withTemplateHelpers, Mut, Toggle } from 'react-action-decorators';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';
import * as toast from '@lib/toast';
import { StoreTypeAttributes } from '@data/models/store-type';

import { attributesFor, StoreTypeResource } from '@data';

interface IOwnProps {
  storeType?: StoreTypeResource;
  onSubmit: (attributes: StoreTypeAttributes, relationships: any) => void;
  onCancel: () => void;
}

interface IState {
  name?: string;
  nameError?: string;
  description?: string;
}

type IProps = i18nProps & IOwnProps;

@withTemplateHelpers
class StoreTypeForm extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  constructor(props: IProps) {
    super(props);

    const { storeType } = props;

    const { name, description } = attributesFor(storeType);

    this.state = {
      name: (name as string) || '',
      description: (description as string) || '',
    };
  }

  isValidForm = () => {
    const { name } = this.state;
    const { t } = this.props;

    const nameError = isEmpty(name) ? t('admin.settings.storeTypes.emptyName') : '';
    this.setState({ nameError });

    return !isEmpty(name);
  };

  submit = async (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const { name, description } = this.state;

    if (this.isValidForm()) {
      try {
        await onSubmit({
          name,
          description,
        });
      } catch (e) {
        toast.error(e);
      }
    }
  };

  cancel = (e) => {
    e.preventDefault();
    const { onCancel } = this.props;
    onCancel();
  };

  render() {
    const { mut } = this;

    const { name, nameError, description } = this.state;

    const { t, storeType } = this.props;

    return (
      <>
        <h2>{t(storeType ? 'admin.settings.storeTypes.edit' : 'admin.settings.storeTypes.add')}</h2>
        <div className='flex w-60'>
          <form data-test-st-form className='ui form flex-grow'>
            <div className='field m-b-xl'>
              <label>{t('admin.settings.storeTypes.name')}</label>
              <input data-test-st-name type='text' value={name || ''} onChange={mut('name')} />
              <div className='error'>{nameError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.storeTypes.description')}</label>
              <input
                data-test-st-description
                type='text'
                value={description || ''}
                onChange={mut('description')}
              />
            </div>

            <div className='m-b-xl'>
              <button
                data-test-submit
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.submit}
              >
                {storeType
                  ? t('admin.settings.storeTypes.edit')
                  : t('admin.settings.storeTypes.add')}
              </button>

              <button
                data-test-cancel
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.cancel}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }
}

export default compose(withTranslations)(StoreTypeForm);
