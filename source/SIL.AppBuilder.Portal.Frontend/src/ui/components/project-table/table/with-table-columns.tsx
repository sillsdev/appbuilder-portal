import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { setColumnSelection as setColumnSelectionData } from '@store/data';

import { possibleColumns, possibleColumnsByType, COLUMN_KEY } from './column-data';

export interface IColumn {
  id: COLUMN_KEY;
  i18nKey: string;
  sortable?: boolean;
  propertyPath: string;
  value?: any;
}

export interface IProvidedProps {
  columns?: COLUMN_KEY[];
  selectedColumns?: COLUMN_KEY[];
  toggleColumnSelection?: (column) => void;
  activeProjectColumns: IColumn[];
  activeProductColumns: IColumn[];
  possibleColumns;
}

interface IOptions {
  tableName: string;
  defaultColumns: COLUMN_KEY[];
}

interface IDataProps {
  setColumnSelection: (column) => void;
}

export function withTableColumns(options: IOptions) {
  function mapStateToProps({ data }) {
    const { tableName, defaultColumns } = options;

    const selectedColumns =
      (data && data.columnSelections && data.columnSelections[tableName]) || defaultColumns;

    return {
      selectedColumns,
    };
  }

  function mapDispatchToProps(dispatch) {
    const { tableName } = options;

    return {
      setColumnSelection: (column) => dispatch(setColumnSelectionData(tableName, column)),
    };
  }

  return (InnerComponent) => {
    class WrapperComponent extends React.Component<IProvidedProps & IDataProps> {
      toggleColumnSelection = (column) => {
        const { setColumnSelection, selectedColumns } = this.props;

        let newSelection;

        if (selectedColumns.includes(column)) {
          newSelection = selectedColumns.filter((c) => c !== column);
        } else {
          newSelection = [...selectedColumns, column];
        }

        setColumnSelection(newSelection);
      };

      activeProjectColumns = () => {
        const { selectedColumns } = this.props;
        const allProjectColumns = possibleColumnsByType.project;
        const columnKeys = Object.keys(allProjectColumns) as COLUMN_KEY[];

        const active = columnKeys.reduce((acc, columnKey) => {
          if (selectedColumns.includes(columnKey)) {
            const column = allProjectColumns[columnKey];
            acc.push(column);
          }

          return acc;
        }, []);

        return active;
      };

      activeProductColumns = () => {
        const { selectedColumns } = this.props;
        const allProductColumns = possibleColumnsByType.product;
        const columnKeys = Object.keys(allProductColumns) as COLUMN_KEY[];

        const active = columnKeys.reduce((acc, columnKey) => {
          if (selectedColumns.includes(columnKey)) {
            const column = allProductColumns[columnKey];
            acc.push(column);
          }

          return acc;
        }, []);

        return active;
      };

      render() {
        const innerProps = {
          ...this.props,
          possibleColumns,
          toggleColumnSelection: this.toggleColumnSelection,
          activeProjectColumns: this.activeProjectColumns(),
          activeProductColumns: this.activeProductColumns(),
        };

        return <InnerComponent {...innerProps} />;
      }
    }

    return compose(
      connect(
        mapStateToProps,
        mapDispatchToProps
      )
    )(WrapperComponent);
  };
}
