import { Schema, SchemaSettings } from '@orbit/data';

const schemaDefinition: SchemaSettings = {
  models: {
    organizationInvite: {
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
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project'}
      }
    },
    product: {
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        tasks: { type: 'hasMany', model: 'task', inverse: 'project' }
      }
    },
    task: {
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
    user: {
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
        assignedTasks: { type: 'hasMany', model: 'task', inverse: 'assigned' }
      }
    }
  }
};

export const schema = new Schema(schemaDefinition);
