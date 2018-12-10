import * as React from 'react';
import { compose } from 'recompose';
import { requireProps } from '@lib/debug';
import { ProjectResource } from '@data';

export interface IProvidedProps {
  selectItem: (project: ProjectResource) => void;
  toggleSelectAll: () => void;
  getSelection: () => ProjectResource[];
  inSelection: (project: ProjectResource) => boolean;
  selection: ProjectResource[];
  allSelected: boolean;
}

interface IState {
  selection: ProjectResource[];
  allSelected: boolean;
}

interface IOwnProps {
  projects: ProjectResource[];
}

export function withTableSelection(WrappedComponent) {

  class DataWrapper extends React.Component<IOwnProps, IState> {

    constructor(props) {
      super(props);
      this.state = {
        selection: [],
        allSelected: false
      };
    }

    selectItem = (project: ProjectResource) => {
      const { selection } = this.state;

      const projectInSelection = selection.find(p => {
        return p.id === project.id;
      });

      if (projectInSelection) {
        this.setState({
          selection: selection.filter((p:ProjectResource) => {
            return p.id !== project.id;
          })
        });
      } else {
        this.setState({
          selection: [...selection, project]
        });
      }
    }

    toggleSelectAll = () => {
      this.setState({
        allSelected: !this.state.allSelected
      });
    }

    inSelection = (project) => {
      const { selection } = this.state;
      const selectedProject = selection.find(p => {
        return p.id === project.id;
      });
      return !!selectedProject;
    }

    getSelection = () => {

    }

    render() {

      const actionsProps = {
        ...this.props,
        selectItem: this.selectItem,
        toggleSelectAll: this.toggleSelectAll,
        inSelection: this.inSelection,
        selection: this.state.selection, // only to trigger a reRender in Row component
        allSelected: this.state.allSelected
      };

      return (
        <WrappedComponent {...actionsProps} />
      );
    }
  }

  return compose(
    requireProps('projects')
  )(DataWrapper);
}