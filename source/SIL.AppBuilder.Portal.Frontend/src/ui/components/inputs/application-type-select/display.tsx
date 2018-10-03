import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { IOwnProps as IDataProps } from '@data/containers/resources/application-type/list';
import { attributesFor } from '@data';

interface IOwnProps {
  selected: Id;
  onChange: (applicationTypeId: Id) => void;
}

type IProps =
  & IOwnProps
  & IDataProps;

export default class GroupSelectDisplay extends React.Component<IProps> {

  componentDidMount() {

    const { selected, applicationTypes, onChange } = this.props;

    if (!selected && applicationTypes && applicationTypes.length > 0) {
      const firstId = applicationTypes[0].id;

      onChange(firstId);
    }
  }

  onSelect = (e, { value }) => {
    e.preventDefault();
    const { onChange } = this.props;
    onChange(value);
  }

  render() {

    const { applicationTypes, selected } = this.props;

    const applicationTypeOptions = applicationTypes
      .filter(applicationType => attributesFor(applicationType).name)
      .map(applicationType => ({
        text: attributesFor(applicationType).description,
        value: applicationType.id
      }));

    return (
      <Dropdown
        data-test-application-type-select
        options={applicationTypeOptions}
        value={selected}
        onChange={this.onSelect}
      />
    );
  }

}