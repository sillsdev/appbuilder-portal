import * as React from 'react';
import { withData } from 'react-orbitjs';
import { connect } from 'react-redux';
import { compose, branch } from 'recompose';
import { ResourceObject } from 'jsonapi-typescript';
import { Redirect } from 'react-router';

import { OrganizationAttributes, TYPE_NAME } from '../models/organization';
import { ORGANIZATIONS_TYPE } from '@data';

import { buildFindRecord } from '@data/store-helpers';
import * as toast from '@lib/toast';
import { withTranslations } from '@lib/i18n';
import { setCurrentOrganization } from '@store/data';

export interface IProvidedProps {
  currentOrganizationId: string | number;
  currentOrganization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
}

export interface IProps {
  currentOrganizationId: string | number;
  organization: ResourceObject<ORGANIZATIONS_TYPE, OrganizationAttributes>;
  setCurrentOrganizationId: (id: string) => void;
}

function mapStateToProps({ data }) {
  return {
    currentOrganizationId: data.currentOrganizationId
  };
}

function mapRecordsToProps(passedProps) {
  const { currentOrganizationId: id } = passedProps;

  if (!id || id === '') { return {}; }

  return {
    organization: q => buildFindRecord(q, TYPE_NAME, id)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentOrganizationId: (id: string) => dispatch(setCurrentOrganization(id))
  };
}

// all organizations the user can select have already been loaded from
// the with-current-user HOC
export function withCurrentOrganization(InnerComponent) {
  class WrapperClass extends React.Component<IProps> {
    render() {
      const { currentOrganizationId, organization, setCurrentOrganizationId } = this.props;

      if (!organization) {
        setCurrentOrganizationId('');
      }

      const dataProps = {
        currentOrganization: organization || null,
        currentOrganizationId: currentOrganizationId || '',
      };

      return <InnerComponent { ...this.props } { ...dataProps } />;
    }
  }

  return compose(
    connect(mapStateToProps, mapDispatchToProps),
    branch(
      ({ currentOrganizationId: id }) => id && `${id}`.length > 0,
      withData(mapRecordsToProps)
    )
  )(WrapperClass);
}

export function requireOrganizationToBeSelected(InnerComponent) {
  return compose(
    withTranslations,
    branch(
      (props: IProvidedProps) => props.currentOrganizationId === '',
      () => ({ t }: any) => {

        toast.warning(t('errors.orgMustBeSelected'));

        return <Redirect to={'/'} push={true} />;
      }
    )
  )(InnerComponent);
}