import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { ProjectResource, idFromRecordIdentity } from '@data';
import {
  setRowSelection as setRowSelectionData,
  setAllCheckboxState as setAllCheckboxStateData
} from '@store/data';

import { ALL_CHECKBOX_STATE } from './all-checkbox-state';

export interface IProvidedProps {
  selectedRows?: IRow[];
  allCheckboxState?: string;
  toggleRowSelection: (row: IRow) => void;
  toggleAllRowSelection: (rows: IRow) => void;
}

interface IOwnProps {
  rowCount: number;
}

type IRow =
  | ProjectResource;

interface IReduxProps {
  setRowSelection: (row: IRow) => void;
  setAllCheckboxState: (newState:string) => void;
}

type IProps =
  & IProvidedProps
  & IOwnProps
  & IReduxProps;

interface IOptions {
  tableName: string;
}

const ROWS_DEFAULT_VALUE = [];
const TOGGLE_DEFAULT_VALUE = ALL_CHECKBOX_STATE.NONE;

export function withTableRows(options: IOptions) {

  function mapStateToProps({ data }) {
    const { tableName } = options;

    const selectedRows = data
      && data.rowSelections
      && data.rowSelections[tableName]
      && data.rowSelections[tableName].rows || ROWS_DEFAULT_VALUE;

    const allCheckboxState = data
      && data.rowSelections
      && data.rowSelections[tableName]
      && data.rowSelections[tableName].allCheckboxState || TOGGLE_DEFAULT_VALUE;

    return {
      selectedRows,
      allCheckboxState
    };
  }

  function mapDispatchToProps(dispatch) {
    const { tableName } = options;

    return {
      setRowSelection: (row) =>
        dispatch(setRowSelectionData(tableName, row)),
      setAllCheckboxState: (newState) =>
        dispatch(setAllCheckboxStateData(tableName, newState))
    };
  }

  const equalIds = (a, b) => idFromRecordIdentity(a) === idFromRecordIdentity(b);

  return InnerComponent => {

    class WrapperComponent extends React.Component<IProps> {

      toggleRowSelection = (row: IRow) => {
        const {
          setRowSelection,
          selectedRows,
          rowCount,
          setAllCheckboxState
        } = this.props;

        let newSelection;

        const isRowInSelection = selectedRows.find(r => equalIds(r, row));

        if (isRowInSelection) {
          newSelection = selectedRows.filter((r) => equalIds(r,row));
        } else {
          newSelection = [...selectedRows, row];
        }

        setRowSelection(newSelection);

        if (newSelection.length === 0) {
          setAllCheckboxState(ALL_CHECKBOX_STATE.NONE);
        } else if (newSelection.length < rowCount) {
          setAllCheckboxState(ALL_CHECKBOX_STATE.INDETERMINATE);
        } else {
          setAllCheckboxState(ALL_CHECKBOX_STATE.ALL);
        }
      }

      toggleAllRowSelection = (rows) => {
        const {
          setRowSelection,
          allCheckboxState,
          setAllCheckboxState
        } = this.props;

        let newSelection;

        if (allCheckboxState === ALL_CHECKBOX_STATE.NONE) {
          newSelection = rows;
          setAllCheckboxState(ALL_CHECKBOX_STATE.ALL);
        }
        if (allCheckboxState === ALL_CHECKBOX_STATE.ALL ||
            allCheckboxState === ALL_CHECKBOX_STATE.INDETERMINATE) {
          newSelection = [];
          setAllCheckboxState(ALL_CHECKBOX_STATE.NONE);
        }

        setRowSelection(newSelection);
      }

      render() {
        const innerProps = {
          ...this.props,
          toggleRowSelection: this.toggleRowSelection,
          toggleAllRowSelection: this.toggleAllRowSelection,
          selectedRows: this.props.selectedRows,
          allCheckboxState: this.props.allCheckboxState
        };

        return <InnerComponent {...innerProps} />;
      }
    }

    return compose(
      connect(mapStateToProps, mapDispatchToProps)
    )(WrapperComponent);
  };

}