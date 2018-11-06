import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';

import { withTemplateHelpers, Mut } from 'react-action-decorators';

import { withTranslations, i18nProps } from '@lib/i18n';
import {
  IProvidedProps as IDataActionsProps
} from '@data/containers/resources/group/with-data-actions';
import { isEmpty } from '@lib/collection';
import { GroupResource, attributesFor, update } from '@data';


interface IOwnProps {
  onFinish: () => void;
  groupToEdit: GroupResource;
}

interface IState {
  name: string;
  nameError: string;
  abbreviation: string;
  abbreviationError: string;
}

type IProps =
  & IOwnProps
  & IDataActionsProps
  & i18nProps;

const initialState = {
  name: '',
  nameError: '',
  abbreviation: '',
  abbreviationError: ''
};

@withTemplateHelpers
class Form extends React.Component<IProps, IState> {
  mut: Mut;

  state = initialState;

  resetForm = () => {
    this.setState(initialState);
  }

  isValidForm = () => {
    const { name, abbreviation } = this.state;
    const { t } = this.props;

    if (isEmpty(name)) {
      this.setState({ nameError: t('org.nameError') });
    }

    if (isEmpty(abbreviation)) {
      this.setState({ abbreviationError: t('org.abbreviationError') });
    }

    return !isEmpty(name) && !isEmpty(abbreviation);
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { createRecord, updateAttributes, onFinish, t, groupToEdit } = this.props;
    const data = this.state;

    if (this.isValidForm()) {
      if (groupToEdit) {
        updateAttributes(groupToEdit, data);
        toast.success(t('org.groupEdited'));
      } else {
        createRecord(data);
        toast.success(t('org.groupCreated'));
      }
      onFinish();
    }
  }

  close = (e) => {
    e.preventDefault();
    const { onFinish } = this.props;
    this.resetForm();
    onFinish();
  }

  componentDidMount() {
    const { groupToEdit } = this.props;

    if (groupToEdit) {
      this.setState({
        name: attributesFor(groupToEdit).name,
        abbreviation: attributesFor(groupToEdit).abbreviation
      });
    }
  }

  render() {
    const { mut } = this;
    const { t } = this.props;
    const { name, nameError, abbreviation, abbreviationError } = this.state;

    return (
      <div>
        <form className='ui form' onSubmit={this.onSubmit}>
          <div className='field'>
            <label>{t('common.name')}</label>
            <input className='ui input' type='text'
              value={name}
              onChange={mut('name')} />
            {nameError && <span className='error'>{nameError}</span>}
          </div>


          <div className='field'>
            <label>{t('common.abbreviation')}</label>
            <input className='ui input' type='text'
              value={abbreviation}
              onChange={mut('abbreviation')} />
            {abbreviationError && <span className='error'>{abbreviationError}</span>}
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