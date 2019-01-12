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

        publicByDefault: { type: 'boolean' },
        useDefaultBuildEngine: { type: 'boolean' },

        // note, that the Build Engine API access token probably should
        // never be *received* from the Scriptura API
        buildEngineApiAccessToken: { type: 'string' },

        // unpresisted, send-only attribute for when a user accepts an
        // invite to create an organization
        token: { type: 'string' },

        // filter-keys - throw-away
        scopeToCurrentUser: { type: 'string' },
      },
      relationships: {
        owner: { type: 'hasOne', model: 'user', inverse: 'ownedOrganizations' },
        users: { type: 'hasMany', model: 'user', inverse: 'organizations' },
        projects: { type: 'hasMany', model: 'user', inverse: 'organization'},
        userMemberships: { type: 'hasMany', model: 'organization-membership', inverse: 'organization' },
        groups: { type: 'hasMany', model: 'group', inverse: 'owner' },
        organizationProductDefinitions: { type: 'hasMany', model: 'organizationProductDefinition', inverse: 'organization'},
        organizationStores: { type: 'hasMany', model: 'organizationStore', inverse: 'organization' },
        userRoles: { type: 'hasMany', model: 'userRole', inverse: 'organization' },
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
    organizationMembershipInvite: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        invitedBy: { type: 'hasOne', model: 'user'},
        organization: { type: 'hasOne', model: 'organization' },
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
    organizationProductDefinition: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        organization: { type: 'hasOne', model: 'organization', inverse: 'organizationProductDefinitions'},
        productDefinition: { type: 'hasOne', model: 'productDefinition', inverse: 'organizationProductDefinitions'},
      }
    },
    organizationStore: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        organization: { type: 'hasOne', model: 'organization', inverse: 'organizationStores' },
        store: { type: 'hasOne', model: 'store', inverse: 'organizationStores'}
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
        automaticBuilds: { type: 'boolean' },
        allowDownloads: { type: 'boolean' },
        location: { type: 'string' },
        isPublic: { type: 'boolean' },
        workflowProjectUrl: { type: 'string'},
        // filter keys
        ownerId: { type: 'string' }
      },
      relationships: {
        products: { type: 'hasMany', model: 'product', inverse: 'project' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'projects'},
        owner: { type: 'hasOne', model: 'user', inverse: 'projects' },
        group: { type: 'hasOne', model: 'group', inverse: 'projects' },
        reviewers: { type: 'hasMany', model: 'reviewer', inverse: 'project' },
        type: { type: 'hasOne', model: 'applicationType', inverse: 'projects'}
      }
    },
    applicationType: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        projects: { type: 'hasMany', model: 'project', inverse: 'type' },
        productDefinitions: { type: 'hasMany', model: 'productDefinition', inverse: 'type' }
      }
    },
    product: {
      keys: { remoteId: {} },
      attributes: {
        dateCreated: { type: 'string'},
        dateUpdated: { type: 'string'},
        datePublished: { type: 'string'},
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'products' },
        productDefinition: { type: 'hasOne', model: 'productDefinition', inverse: 'products' },
        store: { type: 'hasOne', model: 'store', inverse: 'products' },
        storeLanguage: { type: 'hasOne', model: 'storeLanguage', inverse: 'products' },
        productBuilds: { type: 'hasMany', model: 'productBuild', inverse: 'product'},
        productArtifacts: { type: 'hasMany', model: 'productArtifact', inverse: 'product' },
        tasks: { type: 'hasMany', model: 'userTask', inverse: 'product' },
      }
    },
    productBuild: {
      keys: { remoteId: {} },
      attributes: {
        version: {type: 'string' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' }
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'productBuilds' },
        productArtifacts: { type: 'hasMany', model: 'productArtifact', inverse: 'productBuild' }
      }
    },
    productArtifact: {
      keys: { remoteId: {} },
      attributes: {
        artifactType: { type: 'string' },
        url: { type: 'string' },
        fileSize: { type: 'number' },
        contentType: { type: 'string' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' }
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'productArtifacts' },
        productBuild: { type: 'hasOne', model: 'productBuild', inverse: 'productArtifacts' }
      }
    },
    productDefinition: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      relationships: {
        products: { type: 'hasMany', model: 'product', inverse: 'productDefinition' },
        organizationProductDefinitions: { type: 'hasMany', model: 'organizationProductDefinition', inverse: 'productDefinition'},
        type: { type: 'hasOne', model: 'applicationType', inverse: 'productDefinitions' },
        workflow: { type: 'hasOne', model: 'workflowDefinition', inverse: 'productDefinitions' },
      }
    },
    store: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        organizationStores: { type: 'hasMany', model: 'organizationStore', inverse: 'store' },
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'stores' },
        products: { type: 'hasMany', model: 'product', inverse: 'store'}
      }
    },
    storeLanguage: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'storeTypes' },
        products: { type: 'hasMany', model: 'product', inverse: 'storeLanguage' },
      }
    },
    storeType: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' }
      },
      relationships: {
        stores: { type: 'hasMany', model: 'store', inverse: 'storeType'},
        storeLanguages: { type: 'hasMany', model: 'storeLanguage', inverse: 'storeType' },
        workflowDefinitions: { type: 'hasMany', model: 'workflowDefinition', inverse: 'storeType'}

      }
    },
    userTask: {
      keys: { remoteId: {} },
      attributes: {
        activityName: { type: 'string' },
        comment: { type: 'string' },
        status: { type: 'string' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' },

        // Not yet implemented -- post MVP
        waitTime: { type: 'number' }
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'tasks'},
        assigned: { type: 'hasOne', model: 'user', inverse: 'assignedTasks' }
      }
    },
    role: {
      keys: { remoteId: {} },
      attributes: {
        roleName: { type: 'string'}
      },
      relationships: {
        userRoles: { type: 'hasMany', model: 'userRole', inverse: 'role' }
      }
    },
    userRole: {
      keys: { remoteId: {} },
      attributes: {
        roleName: { type: 'string' },
      },
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'userRoles' },
        role: { type: 'hasOne', model: 'role', inverse: 'userRoles' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'userRoles' }
      }
    },
    group: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        abbreviation: { type: 'string' }
      },
      relationships: {
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'group' },
        projects: { type: 'hasMany', model: 'project', inverse: 'group' },
        owner: { type: 'hasOne', model: 'organization', inverse: 'groups' },
      }
    },
    reviewer: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        email: { type: 'string' }
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'reviewers' }
      }
    },
    user: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        auth0Id: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string'},
        isLocked: { type: 'boolean' },
        profileVisibility: { type: 'number' },
        emailNotification: { type: 'boolean'},
        publishingKey: { type: 'string'},
        timezone: { type: 'string' },
        localization: { type: 'string' },
        decimalSeparator: { type: 'string' },
      },
      relationships: {
        ownedOrganizations: { type: 'hasMany', model: 'organization', inverse: 'owner' },
        organizationMemberships: { type: 'hasMany', model: 'organizationMembership', inverse: 'user' },
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'user' },
        organizations: { type: 'hasMany', model: 'organization', inverse: 'users' },
        assignedTasks: { type: 'hasMany', model: 'userTask', inverse: 'assigned' },
        projects: { type: 'hasMany', model: 'project', inverse: 'owner' },
        userRoles: { type: 'hasMany', model: 'userRole', inverse: 'user'},
        groups: { type: 'hasMany', model: 'group', inverse: 'users'},
        notifications: { type: 'hasMany', model: 'notification', inverse: 'user'},
      }
    },
    workflowDefinition: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
        enabled: { type: 'boolean' },
        workflowBusinessFlow: { type: 'string' },
        workflowScheme: { type: 'string' }
      },
      relationships: {
        productDefinitions: { type: 'hasMany', model: 'productDefinition', inverse: 'workflow' },
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'workflowDefinitions' },
      }
    },
    notification: {
      keys: { remoteId: {} },
      attributes: {
        message: { type: 'string' },
        dateRead: { type: 'date' },
        dateEmailSent: { type: 'date' },
        dateCreated: { type: 'date' },
        dateUpdated: { type: 'date' },
        sendEmail: { type: 'boolean' },
      },
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'notifications' }
      }
    }
  }
};

export const schema = new Schema(schemaDefinition);
