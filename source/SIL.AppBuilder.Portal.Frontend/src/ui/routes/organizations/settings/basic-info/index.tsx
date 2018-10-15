import * as React from 'react';
import { match as Match } from 'react-router';
import { withTemplateHelpers, Mut } from 'react-action-decorators';
import { translate, InjectedTranslateProps as i18nProps } from 'react-i18next';
import { compose } from 'recompose';

import { OrganizationAttributes, OrganizationResource } from '@data/models/organization';

export const pathName = '/organizations/:orgId/settings';

export interface IState {
  name: string;
  logoUrl: string;
}

export interface Params {
  orgId: string;
}

export interface IProps {
  match: Match<Params>;
  update: (payload: OrganizationAttributes) => void;
  organization: OrganizationResource;
}

@withTemplateHelpers
class BasicInfoRoute extends React.Component<IProps & i18nProps, IState> {

  mut: Mut;
  state = { name: '', logoUrl: '' };

  componentDidMount() {
    const { organization } = this.props;
    const { attributes: { name, logoUrl } } = organization;

    this.setState({
      name: name || '',
      logoUrl: logoUrl || ''
    });
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { update } = this.props;

    update(this.state);
  }

  render() {
    const {
      mut,
      state: { name, logoUrl },
      props: { t }
    } = this;

    return (
      <form className='ui form sub-page-content' onSubmit={this.onSubmit}>
        <div className='flex-column-reverse-xs flex-row-sm justify-content-space-between m-b-md'>
          <div className='flex-grow'>
            <h2 className='d-xs-none bold m-b-xl'>{t('org.basicTitle')}</h2>
            <div className='ui field fm-b-md'>
              <label>{t('org.orgName')}</label>
              <input
                value={name}
                onChange={mut('name')}
                placeholder={t('org.orgName')}
              />
            </div>
            <div className='ui field fm-b-md'>
              <label>{t('org.logoUrl')}</label>
              <input
                value={logoUrl}
                onChange={mut('logoUrl')}
                placeholder={t('org.logoUrl')}
              />
              <span>{t('org.noteLogUrl')}</span>
            </div>
          </div>
          <div className='m-l-md-sm m-b-md'>
            <div className='flex-column'>
              <div className='m-b-md image-fill-container' style={{ width: '200px', height: '136px' }}>
                {!logoUrl && <div className='w-100 h-100 bg-lightest-gray' />}
                {logoUrl && (
                  <img src={logoUrl} width='200' height='136' />
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          className='
            m-t-md-xs-only w-100-xs-only
            p-md-xs-only m-b-md-xs-only
            ui button
          '
          type='submit' onClick={this.onSubmit}>
          {t('org.save')}
        </button>
      </form>
    );
  }
}

export default compose(
  translate('translations')
)( BasicInfoRoute );
