import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';

import { TYPE_NAME } from '@data/models/project';

const mapRecordsToProps = (props: IProps) => {
  const {
    sortProperty, defaultSort,
    filterOptions, pageOptions
  } = props;

  return {
    projects: q => q
      .findRecords(TYPE_NAME)
      .sort(sortProperty || defaultSort)
      .filter(filterOptions || [])
      .page(pageOptions || {})

  };
}

export default class Data extends React.Component {
  render() {
    return null;
  }
}
