
export const project = {
  type: 'projects',
  id: '1',
  attributes: {
    'name': 'Dummy project',
    'date-archived': null,
    'language': 'English',
    'owner-id': 1
  },
  relationships: {
    organization: { data: { id: 1, type: 'organizations' } },
    group: { data: { id: 1, type: 'groups' } },
    owner: { data: { id: 1, type: 'users' } }
  }
};

export const projectsResponse = {
  data: [{...project}],
  included: [
    { type: 'organizations', id: 1, attributes: { name: 'Dummy organization' } },
    { type: 'groups', id: 1, attributes: { name: 'Some Group' } }
  ]
};
