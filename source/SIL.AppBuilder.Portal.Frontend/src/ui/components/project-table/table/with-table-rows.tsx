import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { ProjectResource, idFromRecordIdentity } from '@data';

import { rowSelectionsFor, allCheckboxStateFor } from '~/redux-store/data/selectors';

import {
  setRowSelection as setRowSelectionData,
  setAllCheckboxState as setAllCheckboxStateData,
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

type IRow = ProjectResource;

interface IReduxProps {
  setRowSelection: (row: IRow) => void;
  setAllCheckboxState: (newState: string) => void;
}

type IProps = IProvidedProps & IOwnProps & IReduxProps;

interface IOptions {
  tableName: string;
}

export function withTableRows(options: IOptions) {
  function mapStateToProps(state) {
    const { tableName } = options;

    return {
      selectedRows: rowSelectionsFor(state, tableName),
      allCheckboxState: allCheckboxStateFor(state, tableName),
    };
  }

  function mapDispatchToProps(dispatch) {
    const { tableName } = options;

    return {
      setRowSelection: (row) => dispatch(setRowSelectionData(tableName, row)),
      setAllCheckboxState: (newState) => dispatch(setAllCheckboxStateData(tableName, newState)),
    };
  }

  const equalIds = (a, b) => idFromRecordIdentity(a) === idFromRecordIdentity(b);
  const notEqualIds = (a, b) => idFromRecordIdentity(a) !== idFromRecordIdentity(b);

  return (InnerComponent) => {
    class WrapperComponent extends React.Component<IProps> {
      toggleRowSelection = (row: IRow) => {
        const { setRowSelection, selectedRows, rowCount, setAllCheckboxState } = this.props;

        let newSelection;

        const isRowInSelection = selectedRows.find((r) => equalIds(r, row));

        if (isRowInSelection) {
          newSelection = selectedRows.filter((r) => notEqualIds(r, row));
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
      };

      toggleAllRowSelection = (rows) => {
        const { setRowSelection, allCheckboxState, setAllCheckboxState } = this.props;

        let newSelection;

        if (allCheckboxState === ALL_CHECKBOX_STATE.NONE) {
          newSelection = rows;
          setAllCheckboxState(ALL_CHECKBOX_STATE.ALL);
        }
        if (
          allCheckboxState === ALL_CHECKBOX_STATE.ALL ||
          allCheckboxState === ALL_CHECKBOX_STATE.INDETERMINATE
        ) {
          newSelection = [];
          setAllCheckboxState(ALL_CHECKBOX_STATE.NONE);
        }

        setRowSelection(newSelection);
      };

      render() {
        const innerProps = {
          ...this.props,
          toggleRowSelection: this.toggleRowSelection,
          toggleAllRowSelection: this.toggleAllRowSelection,
          selectedRows: this.props.selectedRows,
          allCheckboxState: this.props.allCheckboxState,
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
