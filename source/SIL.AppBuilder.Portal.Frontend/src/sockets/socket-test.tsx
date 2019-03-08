import React, { useState } from 'react';
import { attributesFor, query, useOrbit, withOrbit } from 'react-orbitjs';
import { TransformBuilder, QueryBuilder } from '@orbit/data';
import { withValue } from 'react-state-helpers';

import { useLiveData } from '~/data/live';

import * as toast from '~/lib/toast';

import { buildOptions, buildFindRecord, withLoader } from '~/data';

import { compose } from 'recompose';

import { OperationsResponse } from './data-socket';

import { ProjectResource } from '~/data/models/project';

interface IProps {
  project: ProjectResource;
}

const ViewProject = compose<{}, IProps>(
  query<IProps>({
    project: [(q: QueryBuilder) => buildFindRecord(q, 'project', '1'), buildOptions()],
  }),
  withLoader(({ project }) => !project),
  withOrbit(({ project }: IProps) => ({
    project: (q) => q.findRecord(project),
  }))
)(function ViewProjectDisplay({ project }: IProps) {
  const attrs = attributesFor(project);

  return (
    <>
      Name: {attrs.name}
      <br />
      Language: {attrs.language}
      <br />
      Description: {attrs.description}
      <br />
      <br />
      <Form project={project} />
    </>
  );
});

export default ViewProject;

function Form({ project }: IProps) {
  const { pushData } = useLiveData('projects/1');
  const attrs = attributesFor(project);

  const [name, setName] = useState(attrs.name);
  const [description, setDescription] = useState(attrs.description);
  const [language, setLanguage] = useState(attrs.language);
  const [response, setResponse] = useState({});

  const didClickSubmit = (e) => {
    e.preventDefault();

    const _pushData = () => {
      return pushData((t: TransformBuilder) => [
        t.replaceRecord({
          ...project,
          attributes: {
            ...project.attributes,
            name,
            description,
            language,
          },
        }),
      ]);
    };

    _pushData().subscribe(
      (response: OperationsResponse) => {
        toast.success('yay');

        setResponse(response);
      },
      (error) => {
        toast.error('nay!');
        toast.error(error);
      }
    );
  };

  return (
    <fieldset>
      Name: <input value={name} onChange={withValue(setName)} />
      Description: <input value={description} onChange={withValue(setDescription)} />
      Language: <input value={language} onChange={withValue(setLanguage)} /> <br />
      <hr className='m-md' />
      <button className='m-b-lg' onClick={didClickSubmit}>
        Submit
      </button>
      Response: <br />
      <pre>{JSON.stringify(response, null, 4)}</pre>
    </fieldset>
  );
}
