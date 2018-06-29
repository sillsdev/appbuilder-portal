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

        // note, that the Build Engine API access token probably should
        // never be *received* from the Scriptura API
        buildEngineApiAccessToken: { type: 'string' }
      },
      relationships: {
        owner: { type: 'hasOne', model: 'user', inverse: 'ownedOrganizations' },
        users: { type: 'hasMany', model: 'user', inverse: 'organizations' }
      }
    },
    user: {
      attributes: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        auth0Id: { type: 'string' },
        email: { type: 'string' },
        isLocked: { type: 'boolean' },

        timezone: { type: 'string' },
        localization: { type: 'string' },
        decimalSeparator: { type: 'string' },
      },
      relationships: {
        ownedOrganizations: { type: 'hasMany', model: 'organization', inverse: 'owner' },
        organizations: { type: 'hasMany', model: 'organization', inverse: 'users' }
      }
    }
  }
};

export const schema = new Schema(schemaDefinition);
