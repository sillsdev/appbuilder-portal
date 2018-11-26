import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';
import { query, buildOptions, withLoader, attributesFor } from '@data';
import { OrganizationResource } from '@data/models/organization';

interface IOwnProps {
  organizations: OrganizationResource[];
}

type IProps =
  & i18nProps
  & IOwnProps;

class List extends React.Component<IProps> {

  render() {

    const { t, organizations } = this.props;

    return (
      organizations.map(org => (
        <div>{ attributesFor(org).name }</div>
      ))
    );
  }
}

export default compose(
  withTranslations,
  query(() => ({
    organizations: [
      q => q.findRecords('organization'), buildOptions()
    ],
  })),
  withLoader(({organizations}) => !organizations)
)(List);