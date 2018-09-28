import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';

import { OrganizationResource } from '@data';
import { attributesFor, ORGANIZATIONS_TYPE, idFromRecordIdentity } from '@data';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  className?: string;
  organizations: OrganizationResource[];
  onChange: (value: string) => void;
}

export type IProps =
  & IOwnProps
  & i18nProps;

class Display extends React.Component<IProps> {
  onChange = (e, dropdownEvent) => {
    e.preventDefault();

    this.props.onChange(dropdownEvent.value);
  }

  render() {
    const { t, organizations, ...otherProps } = this.props;
    const organizationOptions = [{ text: t('org.allOrganizations'), value: 'all'}].concat(
      organizations.map(o => ({
        text: attributesFor(o).name || '',
        value: o.id
      }))
    );

    const dropdownProps = {
      options: organizationOptions,
      ...otherProps,
      onChange: this.onChange
    };

    return (
      <Dropdown data-test-organization-select { ...dropdownProps } />
    );
  }
}

export default withTranslations(Display);

