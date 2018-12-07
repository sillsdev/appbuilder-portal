import * as React from 'react';
import { Dropdown } from 'semantic-ui-react';
import { titleize } from 'inflected';
import { ResourceObject } from "jsonapi-typescript";

import { attributesFor } from '@data';

interface IProps<T> {
  items: T[];
  labelField: MaybeFunction<string, T>;
  value: T;
  onChange: (selected: T) => void;

  // dom / props for semantic
  className?: string;
}

export default class ResourceSelect<T extends ResourceObject> extends React.Component<IProps<T>> {
  onChange = (e, dropdownEvent) => {
    e.preventDefault();

    const { onChange, items } = this.props;
    const selected = items.find(i => i.id === dropdownEvent.value);

    onChange(selected);
  }

  render() {
    const { items, labelField, value, onChange, ...other } = this.props;

    const options = items.map(i => {
      let label;
      const attributes = attributesFor(i);

      if (typeof labelField === 'string') {
        label = attributes[labelField];
      } else {
        label = labelField(i);
      }

      const text = titleize(label);

      return { text, value: i.id };
    });

    const dropdownProps = {
      options,
      defaultValue: value.id,
      onChange: this.onChange
    };

    return (
      <Dropdown
        data-test-resource-select
        { ...dropdownProps }
        { ...other }
      />
    );
  }
}
