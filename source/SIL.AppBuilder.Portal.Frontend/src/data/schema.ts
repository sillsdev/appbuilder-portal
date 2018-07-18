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
        users: { type: 'hasMany', model: 'user', inverse: 'organizations' }
      }
    },
    project: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project'}
      }
    },
    product: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project' }
      }
    },
    task: {
      keys: { remoteId: {} },
      attributes: {
        project: { type: 'string' },
        product: { type: 'string' },
        status: { type: 'string' },
        waitTime: { type: 'string' }
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
        isViewed: { type: 'boolean' }
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
        users: { type: 'hasMany', model: 'user', inverse: 'groups'}
      }
    },
    user: {
      keys: { remoteId: {} },
      attributes: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        auth0Id: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string'},
        isLocked: { type: 'boolean' },

        timezone: { type: 'string' },
        localization: { type: 'string' },
        decimalSeparator: { type: 'string' },
      },
      relationships: {
        ownedOrganizations: { type: 'hasMany', model: 'organization', inverse: 'owner' },
        organizations: { type: 'hasMany', model: 'organization', inverse: 'users' },
        assignedTasks: { type: 'hasMany', model: 'task', inverse: 'assigned' },
        role: { type: 'hasOne', model: 'role', inverse: 'users'},
        groups: { type: 'hasMany', model: 'group', inverse: 'users'}
      }
    }
  }
};

export const schema = new Schema(schemaDefinition);
