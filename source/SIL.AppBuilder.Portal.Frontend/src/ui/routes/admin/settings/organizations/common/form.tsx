import * as React from 'react';
import { compose } from 'recompose';
import { Checkbox, Dropdown } from 'semantic-ui-react';
import { Mut, Toggle, mutCreator, toggleCreator } from 'react-state-helpers';
import { withTranslations, i18nProps } from '@lib/i18n';
import { isEmpty } from '@lib/collection';
import * as toast from '@lib/toast';
import { OrganizationAttributes } from '@data/models/organization';

import {
  query,
  buildOptions,
  withLoader,
  attributesFor,
  UserResource,
  OrganizationResource,
} from '@data';

interface IOwnProps {
  organization: OrganizationResource;
  owner: UserResource;
  users: UserResource[];
  onSubmit: (attributes: OrganizationAttributes, relationships: any) => void;
  onCancel: () => void;
}

interface IState {
  name?: string;
  websiteUrl?: string;
  owner?: UserResource;
  ownerError?: string;
  buildEngineUrl?: string;
  buildEngineApiAccessToken?: string;
  logoUrl?: string;
  publicByDefault?: boolean;
}

type IProps = i18nProps & IOwnProps;

class OrganizationForm extends React.Component<IProps, IState> {
  mut: Mut;
  toggle: Toggle;

  constructor(props: IProps) {
    super(props);

    const { organization, owner } = props;

    const {
      name,
      websiteUrl,
      logoUrl,
      buildEngineUrl,
      buildEngineApiAccessToken,
      publicByDefault,
    } = attributesFor(organization);

    this.mut = mutCreator(this);
    this.toggle = toggleCreator(this);

    this.state = {
      name: name || '',
      websiteUrl: websiteUrl || '',
      buildEngineUrl: buildEngineUrl || '',
      buildEngineApiAccessToken: buildEngineApiAccessToken || '',
      logoUrl: logoUrl || '',
      publicByDefault: publicByDefault !== undefined ? publicByDefault : true,
      owner: owner || null,
      ownerError: '',
    };
  }

  isValidForm = () => {
    const { owner } = this.state;
    const { t } = this.props;

    const ownerError = isEmpty(owner) ? t('admin.settings.organizations.emptyOwner') : '';
    this.setState({ ownerError });

    return !isEmpty(owner);
  };

  submit = async (e) => {
    e.preventDefault();

    const { onSubmit } = this.props;
    const {
      name,
      websiteUrl,
      buildEngineUrl,
      buildEngineApiAccessToken,
      logoUrl,
      publicByDefault,
      owner,
    } = this.state;

    if (this.isValidForm()) {
      try {
        await onSubmit(
          {
            name,
            websiteUrl,
            buildEngineUrl,
            buildEngineApiAccessToken,
            logoUrl,
            publicByDefault,
          },
          {
            owner,
          }
        );
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

  ownerSelection = (user) => (e) => {
    this.setState({
      owner: user,
    });
  };

  render() {
    const { mut, toggle } = this;

    const {
      name,
      websiteUrl,
      buildEngineUrl,
      buildEngineApiAccessToken,
      logoUrl,
      publicByDefault,
      owner,
      ownerError,
    } = this.state;

    const { t, users, organization } = this.props;

    const { name: ownerName } = attributesFor(owner);

    return (
      <>
        <h2>
          {t(
            organization ? 'admin.settings.organizations.edit' : 'admin.settings.organizations.add'
          )}
        </h2>
        <div className='flex w-60'>
          <form data-test-form className='ui form flex-grow'>
            <div className='field m-b-xl'>
              <label>{t('admin.settings.organizations.name')}</label>
              <input data-test-org-name type='text' value={name || ''} onChange={mut('name')} />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.organizations.owner')}</label>
              <div className='w-100 thin-bottom-border'>
                <Dropdown
                  className='custom w-100 no-borders p-sm'
                  data-test-org-owner
                  text={ownerName}
                >
                  <Dropdown.Menu>
                    {users.map((u) => {
                      const { name: fullName } = attributesFor(u);

                      return (
                        <Dropdown.Item
                          key={u.id}
                          text={fullName}
                          onClick={this.ownerSelection(u)}
                        />
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className='error'>{ownerError}</div>
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.organizations.websiteURL')}</label>
              <input
                data-test-org-url
                type='text'
                value={websiteUrl || ''}
                onChange={mut('websiteUrl')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.organizations.buildEngineURL')}</label>
              <input
                data-test-build-engine-url
                type='text'
                value={buildEngineUrl || ''}
                onChange={mut('buildEngineUrl')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.organizations.accessToken')}</label>
              <input
                data-test-build-engine-access-token
                type='text'
                value={buildEngineApiAccessToken || ''}
                onChange={mut('buildEngineApiAccessToken')}
              />
            </div>

            <div className='field m-b-xl'>
              <label>{t('admin.settings.organizations.logoURL')}</label>
              <input
                data-test-logo-url
                type='text'
                value={logoUrl || ''}
                onChange={mut('logoUrl')}
              />
            </div>
            <div className='flex m-b-xl'>
              <div className='flex-row align-items-center'>
                <div className='p-r-lg'>
                  <h3>{t('admin.settings.organizations.publicByDefault')}</h3>
                  <p className='input-info'>
                    {t('admin.settings.organizations.publicByDefaultDescription')}
                  </p>
                </div>
                <div>
                  <Checkbox
                    data-test-build-engine-public-by-default
                    toggle
                    name='publicByDefault'
                    defaultChecked={publicByDefault}
                    onChange={toggle('publicByDefault')}
                  />
                </div>
              </div>
            </div>

            <div className='m-b-xl'>
              <button
                data-test-submit
                className='ui button p-t-md p-b-md p-l-lg p-r-lg'
                onClick={this.submit}
              >
                {organization
                  ? t('admin.settings.organizations.edit')
                  : t('admin.settings.organizations.add')}
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

export default compose(
  withTranslations,
  query(() => ({
    users: [(q) => q.findRecords('user'), buildOptions()],
  })),
  withLoader(({ users }) => !users)
)(OrganizationForm);
