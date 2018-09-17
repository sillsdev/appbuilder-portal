import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { setColumnSelection as setColumnSelectionData, Column } from '@store/data';

export interface IProvidedProps {
  columns?: Column[];
  selectedColumns?: Column[];
  updateColumnSelection?: (column) => void;
  isInSelectedColumns?: (columnId) => boolean;
  columnWidth: (type?: string) => number;
}

interface IProps {
  tableName: string;
  defaultColumns: Column[];
}

interface IDataProps {
  setColumnSelection: (column) => void;
}

export function withTableColumns(props: IProps) {

  function mapStateToProps({ data }) {

    const { tableName, defaultColumns } = props;

    const selectedColumns = data
      && data.columnSelections
      && data.columnSelections[tableName] || defaultColumns;

    return {
      selectedColumns
    };
  }

  function mapDispatchToProps(dispatch) {

    const { tableName } = props;

    return {
      setColumnSelection: (column) => dispatch(setColumnSelectionData(tableName, column))
    };
  }

  return InnerComponent => {

    class WrapperComponent extends React.Component<IProvidedProps & IDataProps> {

      updateColumnSelection = (column) => {

        const { setColumnSelection, selectedColumns } = this.props;
        const isInSelection = (columns, id) => columns.find(c => c.id === id);

        let newSelection;

        if (isInSelection(selectedColumns, column.id)) {
          newSelection = selectedColumns.filter(c => c.id !== column.id);
        } else {
          newSelection = [...selectedColumns, column];
        }

        setColumnSelection(newSelection);

      }

      isInSelectedColumns = (columnId) => {
        const { selectedColumns } = this.props;
        return selectedColumns.find(c => c.id === columnId) !== undefined;
      }

      columnWidth = (type = 'header') => {
        const { selectedColumns } = this.props;
        const columnCount = selectedColumns.filter(c => c.type === type);
        return (100 / ( columnCount.length + 1) ); // +1 because it includes project column
      }

      render() {

        const columns = [
          { id: 'owner', type: 'header' },
          { id: 'organization', type: 'header'},
          { id: 'language', type: 'header'},
          { id: 'group', type: 'header'},
          { id: 'buildVersion', type: 'product'},
          { id: 'buildDate', type: 'product'},
          { id: 'createdOn', type: 'product'},
          { id: 'updatedOn', type: 'product'}
        ];

        const innerProps = {
          ...this.props,
          columns,
          updateColumnSelection: this.updateColumnSelection,
          isInSelectedColumns: this.isInSelectedColumns,
          columnWidth: this.columnWidth
        };

        return <InnerComponent {...innerProps} />;
      }

    }

    return compose(
      connect(mapStateToProps, mapDispatchToProps)
    )(WrapperComponent);
  };

}