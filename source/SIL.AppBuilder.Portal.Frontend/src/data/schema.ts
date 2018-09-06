import { KeyMap, Schema, SchemaSettings } from '@orbit/data';

export const keyMap = new KeyMap();

const schemaDefinition: SchemaSettings = {
  models: {
    organizationInvite: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        ownerEmail: { type: 'string' },

        // The Scriptura API should not allow setting of the token
        // it should be backend-generated only
        token: { type: 'string' },
        expiresAt: { type: 'date' }
      }
    },
    organization: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        websiteUrl: { type: 'string' },
        buildEngineUrl: { type: 'string' },
        logoUrl: { type: 'string' },

        makePrivateByDefault: { type: 'boolean' },
        useSilBuildInfrastructure: { type: 'boolean' },

        // note, that the Build Engine API access token probably should
        // never be *received* from the Scriptura API
        buildEngineApiAccessToken: { type: 'string' },

        // unpresisted, send-only attribute for when a user accepts an
        // invite to create an organization
        token: { type: 'string' },
      },
      relationships: {
        owner: { type: 'hasOne', model: 'user', inverse: 'ownedOrganizations' },
        users: { type: 'hasMany', model: 'user', inverse: 'organizations' },
        projects: { type: 'hasMany', model: 'user', inverse: 'organization'},
        userMemberships: { type: 'hasMany', model: 'organization-membership', inverse: 'organization' },
        groups: { type: 'hasMany', model: 'group', inverse: 'owner' }
      }
    },
    organizationMembership: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'organizationMemberships' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'userMemberships' },
      }
    },
    groupMembership: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'groupMemberships' },
        group: { type: 'hasOne', model: 'group', inverse: 'groupMemberships' }
      }
    },
    project: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        status: { type: 'string' },
        dateCreated: { type: 'date'},
        dateArchived: { type: 'date'},
        language: { type: 'string' },
        type: { type: 'string'},
        description: { type: 'string' },
        automaticRebuild: { type: 'boolean' },
        allowOtherToDownload: { type: 'boolean' },
        location: { type: 'string' }
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project'},
        products: { type: 'hasMany', model: 'product', inverse: 'project' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'projects'},
        owner: { type: 'hasOne', model: 'user', inverse: 'projects' },
        group: { type: 'hasOne', model: 'group', inverse: 'projects' }
      }
    },
    product: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        dateCreated: { type: 'date'},
        dateUpdated: { type: 'date'},
        datePublished: { type: 'date'},
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project' },
        project: { type: 'hasMany', model: 'project', inverse: 'products' }
      }
    },
    productDefinition: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {

      }
    },
    task: {
      keys: { remoteId: {} },
      attributes: {
        status: { type: 'string' },
        waitTime: { type: 'number' }
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'tasks'},
        product: { type: 'hasOne', model: 'product', inverse: 'tasks'},
        assigned: { type: 'hasOne', model: 'user', inverse: 'assignedTasks' }
      }
    },
    notification: {
      keys: { remoteId: {} },
      attributes: {
        title: { type: 'string' },
        description: { type: 'string' },
        time: { type: 'date' },
        link: { type: 'string' },
        isViewed: { type: 'boolean' },
        show: { type: 'boolean' }
      }
    },
    role: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string'}
      },
      relationships: {
        users: { type: 'hasMany', model: 'user', inverse: 'role'}
      }
    },
    group: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        users: { type: 'hasMany', model: 'user', inverse: 'groups' },
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'group' },
        projects: { type: 'hasMany', model: 'project', inverse: 'group' },
        owner: { type: 'hasOne', model: 'organization', inverse: 'groups'}
      }
    },
    user: {
      keys: { remoteId: {} },
      attributes: {
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        auth0Id: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string'},
        isLocked: { type: 'boolean' },
        profileVisibility: { type: 'number' },
        emailNotification: { type: 'boolean'},
        timezone: { type: 'string' },
        localization: { type: 'string' },
        decimalSeparator: { type: 'string' },
      },
      relationships: {
        ownedOrganizations: { type: 'hasMany', model: 'organization', inverse: 'owner' },
        organizationMemberships: { type: 'hasMany', model: 'organizationMembership', inverse: 'user' },
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'user' },
        organizations: { type: 'hasMany', model: 'organization', inverse: 'users' },
        assignedTasks: { type: 'hasMany', model: 'task', inverse: 'assigned' },
        projects: { type: 'hasMany', model: 'project', inverse: 'owner' },
        role: { type: 'hasOne', model: 'role', inverse: 'users'},
        groups: { type: 'hasMany', model: 'group', inverse: 'users'}
      }
    }
  }
};

export const schema = new Schema(schemaDefinition);
