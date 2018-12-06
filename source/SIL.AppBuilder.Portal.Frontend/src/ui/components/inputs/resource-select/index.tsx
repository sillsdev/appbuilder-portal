import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { titleize } from 'inflected';
import { ResourceObject } from "jsonapi-typescript";

interface IProps<T> {
  items: T[];
  labelField: string;
  value: T;
  onChange: (selected: T) => void;
}

export default class ResourceSelect<T extends ResourceObject> extends React.Component<IProps<T>> {
  onChange = (e, dropdownEvent) => {
    e.preventDefault();

    const { onChange, items } = this.props;

    const selected = items.find(i => i.id === dropdownEvent.value);

    onChange(selected);
  }

  render() {
    const { items, labelField, value, onChange } = this.props;

    const options = items.map(i => {
      const label = attributesFor(i)[labelField];
      const text = titleize(label);

      return { text, value: i.id };
    });

    const dropdownProps = {
      options,
      defaultValue: value,
      onChange: this.onChange
    };

    return (
      <Dropdown
        data-test-resource-select
        { ...dropdownProps }
      />
    );
  }
}
