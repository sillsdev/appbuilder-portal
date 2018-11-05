import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';

import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { withTranslations, i18nProps } from '@lib/i18n';
import {
  IProvidedProps as IDataActionsProps
} from '@data/containers/resources/group/with-data-actions';


interface IOwnProps {
  onFinish: () => void;
}

interface IState {
  name: string;
  abbreviation: string;
}

type IProps =
  & IOwnProps
  & IDataActionsProps
  & i18nProps;

@withTemplateHelpers
class Form extends React.Component<IProps, IState> {
  mut: Mut;

  state = {
    name: '',
    abbreviation: ''
  };

  onSubmit = (e) => {
    e.preventDefault();

    const { createRecord, onFinish, t } = this.props;
    const data = this.state;

    createRecord(data);
    toast.success('Record created');
    onFinish();
  }

  close = (e) => {
    e.preventDefault();
    const { onFinish } = this.props;
    onFinish();
  }

  render() {
    const { mut } = this;
    const { t } = this.props;
    const { name, abbreviation } = this.state;

    return (
      <div>
        <form className='ui form' onSubmit={this.onSubmit}>
          <div className='field'>
            <label>{t('common.name')}</label>
            <input className='ui input' type='text'
              value={name}
              onChange={mut('name')} />
          </div>


          <div className='field'>
            <label>{t('common.abbreviation')}</label>
            <input className='ui input' type='text'
              value={abbreviation}
              onChange={mut('abbreviation')} />
          </div>

          <div className='flex'>
            <button className='ui button'>
              {t('common.save')}
            </button>
            <a className='ui button' onClick={this.close}>
              {t('common.cancel')}
            </a>
          </div>
        </form>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(Form);