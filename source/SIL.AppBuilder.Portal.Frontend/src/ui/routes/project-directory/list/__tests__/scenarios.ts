export const threeProjects = {
  meta: { ['total-records']: 3 },
  data: [
    {
      type: 'projects',
      id: '1',
      attributes: {
        name: 'Dummy project',
        'date-archived': null,
        language: 'English',
        'is-public': false,
      },
      relationships: {
        organization: { data: { id: 1, type: 'organizations' } },
        group: { data: { id: 1, type: 'groups' } },
        owner: { data: { id: 1, type: 'users' } },
      },
    },
    {
      type: 'projects',
      id: 2,
      attributes: {
        name: 'project 2',
        'date-archived': null,
        language: 'English',
        'is-public': true,
      },
      relationships: {
        organization: { data: { id: 2, type: 'organizations' } },
        group: { data: { id: 2, type: 'groups' } },
        owner: { data: { id: 2, type: 'users' } },
      },
    },
    {
      type: 'projects',
      id: 3,
      attributes: {
        name: 'project 3',
        'date-archived': null,
        language: 'English',
        'is-public': true,
      },
      relationships: {
        organization: { data: { id: 1, type: 'organizations' } },
        group: { data: { id: 1, type: 'groups' } },
        owner: { data: { id: 3, type: 'users' } },
      },
    },
  ],
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'DeveloperTown' } },
    { type: 'organizations', id: 2, attributes: { name: 'SIL' } },
    { type: 'groups', id: 1, attributes: { name: 'Group' } },
    { type: 'groups', id: 2, attributes: { name: 'Group' } },
    { type: 'groups', id: 3, attributes: { name: 'Group' } },
    { type: 'users', id: 2 },
    { type: 'users', id: 3 },
  ],
};

export const DTProjects = {
  meta: { ['total-records']: 2 },
  data: [
    {
      type: 'projects',
      id: '1',
      attributes: {
        name: 'Dummy project',
        'date-archived': null,
        language: 'English',
        'is-public': false,
      },
      relationships: {
        organization: { data: { id: 1, type: 'organizations' } },
        group: { data: { id: 1, type: 'groups' } },
        owner: { data: { id: 1, type: 'users' } },
      },
    },
    {
      type: 'projects',
      id: 3,
      attributes: {
        name: 'project 3',
        'date-archived': null,
        language: 'English',
        'is-public': true,
      },
      relationships: {
        organization: { data: { id: 1, type: 'organizations' } },
        group: { data: { id: 1, type: 'groups' } },
        owner: { data: { id: 3, type: 'users' } },
      },
    },
  ],
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'DeveloperTown' } },
    { type: 'groups', id: 1, attributes: { name: 'Group' } },
    { type: 'groups', id: 3, attributes: { name: 'Group' } },
    { type: 'users', id: 2 },
    { type: 'users', id: 3 },
  ],
};

export const zeroProjects = {
  meta: { ['total-records']: 0 },
  data: [],
};

export const fullPageOfProjects = {
  meta: { ['total-records']: 20 },
  data: Array.from({ length: 20 }, (v, i) => ({
    type: 'projects',
    id: `${i}`,
    attributes: {
      name: `Project ${i}`,
      'date-archived': null,
      language: 'English',
      'is-public': true,
    },
    relationships: {
      organization: { data: { id: 1, type: 'organizations' } },
      group: { data: { id: 1, type: 'groups' } },
      owner: { data: { id: 1, type: 'users' } },
    },
  })),
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'DeveloperTown' } },
    { type: 'groups', id: 1, attributes: { name: 'Group' } },
  ],
};

export const moreThanOnePageOfProjects = {
  ...fullPageOfProjects,
  meta: { ['total-records']: 20 },
};
