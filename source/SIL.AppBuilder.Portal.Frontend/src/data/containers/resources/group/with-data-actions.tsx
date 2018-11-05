import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import { withData as withOrbit, WithDataProps } from 'react-orbitjs';

import { GroupAttributes, GroupResource } from '@data/models/group';
import { defaultOptions } from '@data';
import { requireProps } from '@lib/debug';
import { OrganizationResource } from '@data';

export interface IProvidedProps {
  createRecord: (attrs: GroupAttributes) => any;
  removeRecord: (group: GroupResource) => any;
}

interface IOwnProps {
  organization: OrganizationResource;
}

type IProps =
  & IOwnProps
  & WithDataProps;

export function withDataActions(InnerComponent) {

  class DataActionWrapper extends React.Component<IProps> {

    createRecord = async (payload: GroupAttributes) => {

      const { dataStore, organization } = this.props;

      try {
        await dataStore.update(
          q => q.addRecord({
            type: 'group',
            attributes: payload,
            relationships: {
              owner: { data: organization }
            }
          }),
          defaultOptions()
        );
        toast.success('group created');
      } catch (e) {
        toast.error(e);
      }
    }

    removeRecord = async (group: GroupResource) => {
      const { dataStore } = this.props;

      try {
        await dataStore.update(
          q => q.removeRecord(group),
          defaultOptions());
        toast.success('group deleted');
      } catch(e) {
        toast.error(e);
      }

    }

    render() {
      const dataProps = {
        createRecord: this.createRecord,
        removeRecord: this.removeRecord
      };

      return <InnerComponent {...this.props} {...dataProps} />;
    }
  }

  return compose(
    withOrbit({}),
    requireProps('organization')
  )(DataActionWrapper);
}