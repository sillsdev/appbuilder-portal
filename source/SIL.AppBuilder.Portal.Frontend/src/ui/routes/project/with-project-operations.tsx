import * as React from 'react';

import { withData, WithDataProps } from 'react-orbitjs';
import { TYPE_NAME as PROJECT, ProjectAttributes} from '@data/models/project';
import { attributesFor } from '@data';

export function withProjectOperations(WrappedComponent) {

  class DataWrapper extends React.Component<WithDataProps> {

    toggleArchiveProject = async (project: JSONAPI<ProjectAttributes>) => {

      const { updateStore } = this.props;
      const { dateArchived } = attributesFor(project);

      await updateStore(t => t.replaceAttribute(
        { type: PROJECT, id: project.id },
        'dateArchived', !dateArchived ? new Date() : null
      ));

    }

    render() {

      const actionProps = {
        toggleArchiveProject: this.toggleArchiveProject
      };

      return (
        <WrappedComponent {...actionProps} {...this.props}/>
      );
    }

  }

  return withData({})(DataWrapper);
}