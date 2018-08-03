import * as React from 'react'; import { InjectedTranslateProps as i18nProps } from 'react-i18next';
import { withTemplateHelpers, Mut } from 'react-action-decorators';

interface IOwnProps {
  onFinish: () => void;
}

interface IState {
  name: string;
  abbreviation: string;
}

type IProps =
  & IOwnProps
  & i18nProps;

@withTemplateHelpers
export default class AddGroupFormDisplay extends React.Component<IProps, IState> {
  mut: Mut;

  state = { name: '', abbreviation: '' };

  onSubmit = async (e) => {
    e.preventDefault();

    const { onSubmit, onFinish } = this.props;
    const data = this.state;

    await onSubmit(data);
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

          <button className='ui button'>
            {t('common.save')}
          </button>
        </form>
      </div>
    );
  }
}
