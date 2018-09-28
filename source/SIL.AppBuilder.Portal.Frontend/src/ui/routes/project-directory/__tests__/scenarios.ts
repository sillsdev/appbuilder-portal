export const threeProjects = {
  data: [{
    type: 'projects',
    id: '1',
    attributes: {
      'name': 'Dummy project',
      'date-archived': null,
      'language': 'English',
      'is-public': false
    },
    relationships: {
      organization: { data: { id: 1, type: 'organizations' } },
      group: { data: { id: 1, type: 'groups' } },
      owner: { data: { id: 1, type: 'users' } }
    }
  }, {
    type: 'projects',
    id: 2,
    attributes: {
      'name': 'project 2',
      'date-archived': null,
      'language': 'English',
      'is-public': true
    },
    relationships: {
      organization: { data: { id: 2, type: 'organizations' } },
      group: { data: { id: 2, type: 'groups' } },
      owner: { data: { id: 2, type: 'users' } }
    }
  }, {
    type: 'projects',
    id: 3,
    attributes: {
      'name': 'project 3',
      'date-archived': null,
      'language': 'English',
      'is-public': true
    },
    relationships: {
      organization: { data: { id: 1, type: 'organizations' } },
      group: { data: { id: 1, type: 'groups' } },
      owner: { data: { id: 3, type: 'users' } }
    }
  }],
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'DeveloperTown'} },
    { type: 'organizations', id: 2, attributes: { name: 'SIL'} },
    { type: 'groups', id: 1, attributes: { name: 'Group' } },
    { type: 'groups', id: 2, attributes: { name: 'Group' } },
    { type: 'groups', id: 3, attributes: { name: 'Group' } },
    { type: 'users', id: 2 },
    { type: 'users', id: 3 },
  ]
};

export const DTProjects = {
  data: [{
    type: 'projects',
    id: '1',
    attributes: {
      'name': 'Dummy project',
      'date-archived': null,
      'language': 'English',
      'is-public': false
    },
    relationships: {
      organization: { data: { id: 1, type: 'organizations' } },
      group: { data: { id: 1, type: 'groups' } },
      owner: { data: { id: 1, type: 'users' } }
    }
  }, {
    type: 'projects',
    id: 3,
    attributes: {
      'name': 'project 3',
      'date-archived': null,
      'language': 'English',
      'is-public': true
    },
    relationships: {
      organization: { data: { id: 1, type: 'organizations' } },
      group: { data: { id: 1, type: 'groups' } },
      owner: { data: { id: 3, type: 'users' } }
    }
  }],
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'DeveloperTown'} },
    { type: 'groups', id: 1, attributes: { name: 'Group' } },
    { type: 'groups', id: 3, attributes: { name: 'Group' } },
    { type: 'users', id: 2 },
    { type: 'users', id: 3 },
  ]
};
