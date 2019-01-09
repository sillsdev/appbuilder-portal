export const projectOne = {
  data: {
    attributes: {
      name: 'World English Bible (Local SAB Project)',
      'type-id': 1,
      description: 'weeeeeeee',
      'owner-id': 7,
      'organization-id': 2,
      language: 'English',
      'is-public': true,
      'date-created': '2018-12-03T21:30:20.723125',
      'date-updated': '2018-12-03T21:32:00.362535',
      'date-archived': null,
      'allow-downloads': true,
      'automatic-builds': true,
      'workflow-project-id': 60,
      'workflow-project-url': ''
    },
    relationships: {
      type: { data: { type: 'application-types', id: '1' } },
      owner: { data: { type: 'users', id: '7' } },
      group: { data: { type: 'groups', id: '14' } },
      organization: { data: { type: 'organizations', id: '1' } },
      reviewers: {},
      products: {
        data: [
          { type: 'products', id: 'bccb8128-2721-4fad-b138-d4137c5e34bf' }
        ]
      }
    },
    type: 'projects',
    id: '685'
  },
  included: [
    {
      attributes: {
        name: 'DeveloperTown',
        'website-url': 'https://developertown.com',
        'build-engine-url': 'https://buildengine.gtis.guru:8443',
        'build-engine-api-access-token': 'NS7kCjCRNFPmCGMCs3cQ',
        'logo-url': 'https://www.developertown.com/wp-content/uploads/2018/01/DT-PoundHouse-Blue.png',
        'use-default-build-engine': true,
        'public-by-default': true
      },
      relationships: {
        owner: { data: { type: 'users', id: '3' } },
        'organization-memberships': {
          data: [
            { type: 'organization-memberships', id: '6' }
          ]
        },
        groups: {
          data: [
            { type: 'groups', id: '14' }
          ]
        },
        'organization-product-definitions': {},
        'organization-stores': {},
        'user-roles': {
          data: [
            { type: 'user-roles', id: '9' }
          ]
        }
      },
      type: 'organizations',
      id: '1'
    },
    {
      attributes: {
        name: 'Development',
        abbreviation: 'DEV'
      },
      relationships: {
        owner: { data: { type: 'organizations', id: '1' } }
      },
      type: 'groups',
      id: '14'
    },
    {
      attributes: {
        name: 'Preston Sego (org owner)',
      },
      relationships: {},
      type: 'users',
      id: '3'
    },
    {
      attributes: {
        name: 'Preston Sego (dt)',
        'given-name': 'Preston',
        'family-name': 'Sego (dt)',
        email: 'psego@developertown.com',
        phone: null,
        timezone: null,
        locale: null,
        'is-locked': false,
        auth0Id: 'google-oauth2|111802484969448690930',
        'profile-visibility': 1,
        'email-notification': true,
        'publishing-key': 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCHSzEF6dEIiukeBeusI9qdQ3E8f/wCdtKOv5NItePwfXE3LLEOw5Kx7rZquhO9z6/58lTBK8flFpefOXsL2sYHHaAF40lcAJ6FBUsycehN12NThFDcGT+DbauARToXx/ypz4zJcdWJ8R0qQRm4vJgJL5xIKWR2cK8T7jA1FC0ZcltQdXw1yiSYiV7j1QIfNDTLtMIBg0M+HNVDPYDAC05h6Dnz9XDCA9sgCYt8CMey0wjqbzX+Qn3KxPmz000dRCtgiHYMj+oClZMVPPqltQuDJUiDpztNCAWpL1U6rF7vCC6xl2cXUwK8kT82CesCuKafOd336KZkUphkqP2bYRrz lprestonsegoiii@Tyche',
        'workflow-user-id': '079d6e50-769c-4607-b66f-e668b6171a19',
        'date-created': null,
        'date-updated': '2018-12-03T21:29:37.254778'
      },
      relationships: {
        'organization-memberships': {},
        'group-memberships': {},
        'user-roles': {}
      },
      type: 'users',
      id: '7'
    },
    {
      attributes: {
        'date-created': '2018-12-03T21:32:09.758',
        'date-updated': '2018-12-03T21:36:48.135652',
        'workflow-job-id': 23,
        'workflow-build-id': 34,
        'date-built': null,
        'workflow-publish-id': 0,
        'workflow-comment': '',
        'date-published': null
      },
      relationships: {
        project: { data: { type: 'projects', id: '685' } },
        'product-definition': { data: { type: 'product-definitions', id: '1' } },
        store: { data: { type: 'stores', id: '1' } },
        'store-language': { data: { type: 'store-languages', id: '20' } },
        'product-builds': {
          data: [
            { type: 'product-builds', id: '1' },
          ]
        },
        'product-artifacts': {
          data: [
            { type: 'product-artifacts', id: '48' },
          ]
        }
      },
      type: 'products',
      id: 'bccb8128-2721-4fad-b138-d4137c5e34bf'
    },
    {
      type: 'product-builds',
      id: '1',
      attributes: {
        version: '1.0.1',
      },
      relationships: {
        product: { data: { type: 'products', id: 'bccb8128-2721-4fad-b138-d4137c5e34bf' } },
        'product-artifacts': {
          data: [
            { type: 'product-artifacts', id: '48' },
          ]
        },
      },
    },
    {
      attributes: {
        name: 'android_google_play',
        description: 'Android App to Google Play'
      },
      relationships: {
        type: { data: { type: 'application-types', id: '1' } },
        workflow: { data: { type: 'workflow-definitions', id: '1' } }
      },
      type: 'product-definitions',
      id: '1'
    },
    {
      attributes: {
        name: 'scriptureappbuilder',
        description: 'Scripture App Builder'
      },
      type: 'application-types',
      id: '1'
    },
    {
      attributes: {
        'artifact-type': 'package_name',
        url: 'https://sil-stg-aps-artifacts.s3.amazonaws.com/stg/jobs/build_scriptureappbuilder_23/34/package_name.txt',
        'file-size': 18,
        'content-type': 'text/plain',
        'date-created': '2018-12-03T22:27:06.201276',
        'date-updated': '2018-12-03T22:27:06.201276'
      },
      relationships: {
        product: { data: { type: 'products', id: 'bccb8128-2721-4fad-b138-d4137c5e34bf' } },
        'product-build': {
          data: { type: 'product-builds', id: '1' },
        },
      },
      type: 'product-artifacts',
      id: '48'
    },
  ],
  meta: {
    'total-records': 685
  }
};
