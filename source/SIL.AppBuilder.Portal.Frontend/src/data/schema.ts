import { KeyMap, Schema, SchemaSettings } from '@orbit/data';

export const keyMap = new KeyMap();

const schemaDefinition: SchemaSettings = {
  // The no-var-requires rule lint check is turned off in config but doesn't seem to work
  // and is still flagging the error here.
  // Cancelling it out manually here since the plug in requires it and the babel
  // doesn't support the import inflection = require('inflection) suggested alternative
  /* eslint-disable @typescript-eslint/no-var-requires */
  pluralize: (word) => {
    var inflection = require('inflection');
    return inflection.pluralize(word);
  },
  singularize: (word) => {
    var inflection = require('inflection');
    return inflection.singularize(word);
  },
  /* eslint-enable @typescript-eslint/no-var-requires */
  models: {
    organizationInvite: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        ownerEmail: { type: 'string' },

        // The Scriptura API should not allow setting of the token
        // it should be backend-generated only
        token: { type: 'string' },
        expiresAt: { type: 'date' },
      },
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
        projects: { type: 'hasMany', model: 'user', inverse: 'organization' },
        projectImports: { type: 'hasMany', model: 'projectImport', inverse: 'organization' },
        userMemberships: {
          type: 'hasMany',
          model: 'organization-membership',
          inverse: 'organization',
        },
        groups: { type: 'hasMany', model: 'group', inverse: 'owner' },
        organizationProductDefinitions: {
          type: 'hasMany',
          model: 'organizationProductDefinition',
          inverse: 'organization',
        },
        organizationStores: {
          type: 'hasMany',
          model: 'organizationStore',
          inverse: 'organization',
        },
        userRoles: { type: 'hasMany', model: 'userRole', inverse: 'organization' },
      },
    },
    organizationMembership: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'organizationMemberships' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'userMemberships' },
      },
    },
    organizationMembershipInvite: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        invitedBy: { type: 'hasOne', model: 'user' },
        organization: { type: 'hasOne', model: 'organization' },
      },
    },
    groupMembership: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'groupMemberships' },
        group: { type: 'hasOne', model: 'group', inverse: 'groupMemberships' },
      },
    },
    organizationProductDefinition: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        organization: {
          type: 'hasOne',
          model: 'organization',
          inverse: 'organizationProductDefinitions',
        },
        productDefinition: {
          type: 'hasOne',
          model: 'productDefinition',
          inverse: 'organizationProductDefinitions',
        },
      },
    },
    organizationStore: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        organization: { type: 'hasOne', model: 'organization', inverse: 'organizationStores' },
        store: { type: 'hasOne', model: 'store', inverse: 'organizationStores' },
      },
    },
    project: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        status: { type: 'string' },
        dateCreated: { type: 'date' },
        dateUpdated: { type: 'date' },
        dateArchived: { type: 'date' },
        language: { type: 'string' },
        type: { type: 'string' },
        description: { type: 'string' },
        automaticBuilds: { type: 'boolean' },
        allowDownloads: { type: 'boolean' },
        location: { type: 'string' },
        isPublic: { type: 'boolean' },
        workflowProjectUrl: { type: 'string' },
        dateActive: { type: 'date' },
        // filter keys
        ownerId: { type: 'string' },
      },
      relationships: {
        products: { type: 'hasMany', model: 'product', inverse: 'project' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'projects' },
        owner: { type: 'hasOne', model: 'user', inverse: 'projects' },
        group: { type: 'hasOne', model: 'group', inverse: 'projects' },
        reviewers: { type: 'hasMany', model: 'reviewer', inverse: 'project' },
        authors: { type: 'hasMany', model: 'author', inverse: 'project' },
        type: { type: 'hasOne', model: 'applicationType', inverse: 'projects' },
      },
    },
    projectImport: {
      keys: { remoteId: {} },
      attributes: {
        importData: { type: 'string' },
        dateCreated: { type: 'date' },
        dateUpdated: { type: 'date' },
      },
      relationships: {
        organization: { type: 'hasOne', model: 'organization', inverse: 'projectImports' },
        owner: { type: 'hasOne', model: 'user', inverse: 'projectImports' },
        group: { type: 'hasOne', model: 'group', inverse: 'projectImports' },
        type: { type: 'hasOne', model: 'applicationType', inverse: 'projectImports' },
      },
    },
    applicationType: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      relationships: {
        projects: { type: 'hasMany', model: 'project', inverse: 'type' },
        projectImports: { type: 'hasMany', model: 'projectImport', inverse: 'type' },
        productDefinitions: { type: 'hasMany', model: 'productDefinition', inverse: 'type' },
      },
    },
    product: {
      keys: { remoteId: {} },
      attributes: {
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' },
        datePublished: { type: 'string' },
        dateBuilt: { type: 'string' },
        versionBuilt: { type: 'string' },
        publishLink: { type: 'string' },
        properties: { type: 'string' },
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'products' },
        productDefinition: { type: 'hasOne', model: 'productDefinition', inverse: 'products' },
        store: { type: 'hasOne', model: 'store', inverse: 'products' },
        storeLanguage: { type: 'hasOne', model: 'storeLanguage', inverse: 'products' },
        productBuilds: { type: 'hasMany', model: 'productBuild', inverse: 'product' },
        productArtifacts: { type: 'hasMany', model: 'productArtifact', inverse: 'product' },
        tasks: { type: 'hasMany', model: 'userTask', inverse: 'product' },
        productActions: { type: 'hasOne', model: 'productAction', inverse: 'products' },
        productWorkflow: { type: 'hasOne', model: 'productWorkflow', inverse: 'products' },
        productPublications: { type: 'hasMany', model: 'productPublication', inverse: 'product' },
        productTransitions: { type: 'hasMany', model: 'productTransition', inverse: 'product' },
      },
    },
    productTransition: {
      keys: { remoteId: {} },
      attributes: {
        allowedUserNames: { type: 'string' },
        command: { type: 'string' },
        comment: { type: 'string' },
        dateStarted: { type: 'string' },
        dateTransition: { type: 'string' },
        destinationState: { type: 'string' },
        initialState: { type: 'string' },
        transitionType: { type: 'number' },
        workflowType: { type: 'string' },
        workflowUserId: { type: 'string' },
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'productTransitions' },
      },
    },
    productAction: {
      keys: { remoteId: {} },
      attributes: {
        types: { type: 'array' },
      },
      relationships: {
        products: { type: 'hasMany', model: 'product', inverse: 'productActions' },
      },
    },
    productBuild: {
      keys: { remoteId: {} },
      attributes: {
        version: { type: 'string' },
        buildId: { type: 'number' },
        success: { type: 'boolean' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' },
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'productBuilds' },
        productArtifacts: { type: 'hasMany', model: 'productArtifact', inverse: 'productBuild' },
        productPublications: {
          type: 'hasMany',
          model: 'productPublication',
          inverse: 'productBuild',
        },
      },
    },
    productPublication: {
      keys: { remoteId: {} },
      attributes: {
        releaseId: { type: 'number' },
        channel: { type: 'string' },
        logUrl: { type: 'string' },
        success: { type: 'boolean' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' },
      },
      relationships: {
        productBuild: { type: 'hasOne', model: 'productBuild', inverse: 'productPublications' },
        product: { type: 'hasOne', model: 'product', inverse: 'productPublications' },
      },
    },
    productArtifact: {
      keys: { remoteId: {} },
      attributes: {
        artifactType: { type: 'string' },
        url: { type: 'string' },
        fileSize: { type: 'number' },
        contentType: { type: 'string' },
        dateCreated: { type: 'string' },
        dateUpdated: { type: 'string' },
      },
      relationships: {
        product: { type: 'hasOne', model: 'product', inverse: 'productArtifacts' },
        productBuild: { type: 'hasOne', model: 'productBuild', inverse: 'productArtifacts' },
      },
    },
    productDefinition: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
        properties: { type: 'string' },
      },
      relationships: {
        products: { type: 'hasMany', model: 'product', inverse: 'productDefinition' },
        organizationProductDefinitions: {
          type: 'hasMany',
          model: 'organizationProductDefinition',
          inverse: 'productDefinition',
        },
        type: { type: 'hasOne', model: 'applicationType', inverse: 'productDefinitions' },
        workflow: { type: 'hasOne', model: 'workflowDefinition', inverse: 'productDefinitions' },
        rebuildWorkflow: {
          type: 'hasOne',
          model: 'workflowDefinition',
          inverse: 'productsForRebuild',
        },
        republishWorkflow: {
          type: 'hasOne',
          model: 'workflowDefinition',
          inverse: 'productsForRepublish',
        },
      },
    },
    store: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      relationships: {
        organizationStores: { type: 'hasMany', model: 'organizationStore', inverse: 'store' },
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'stores' },
        products: { type: 'hasMany', model: 'product', inverse: 'store' },
      },
    },
    storeLanguage: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      relationships: {
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'storeTypes' },
        products: { type: 'hasMany', model: 'product', inverse: 'storeLanguage' },
      },
    },
    storeType: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      relationships: {
        stores: { type: 'hasMany', model: 'store', inverse: 'storeType' },
        storeLanguages: { type: 'hasMany', model: 'storeLanguage', inverse: 'storeType' },
        workflowDefinitions: { type: 'hasMany', model: 'workflowDefinition', inverse: 'storeType' },
      },
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
        waitTime: { type: 'number' },
      },
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'assignedTasks' },
        product: { type: 'hasOne', model: 'product', inverse: 'tasks' },
        assigned: { type: 'hasOne', model: 'user', inverse: 'assignedTasks' },
      },
    },
    role: {
      keys: { remoteId: {} },
      attributes: {
        roleName: { type: 'string' },
      },
      relationships: {
        userRoles: { type: 'hasMany', model: 'userRole', inverse: 'role' },
      },
    },
    userRole: {
      keys: { remoteId: {} },
      attributes: {
        roleName: { type: 'string' },
      },
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'userRoles' },
        role: { type: 'hasOne', model: 'role', inverse: 'userRoles' },
        organization: { type: 'hasOne', model: 'organization', inverse: 'userRoles' },
      },
    },
    group: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        abbreviation: { type: 'string' },
      },
      relationships: {
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'group' },
        projects: { type: 'hasMany', model: 'project', inverse: 'group' },
        projectImports: { type: 'hasMany', model: 'projectImport', inverse: 'group' },
        owner: { type: 'hasOne', model: 'organization', inverse: 'groups' },
      },
    },
    reviewer: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        email: { type: 'string' },
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'reviewers' },
      },
    },
    user: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        givenName: { type: 'string' },
        familyName: { type: 'string' },
        auth0Id: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        isLocked: { type: 'boolean' },
        profileVisibility: { type: 'number' },
        emailNotification: { type: 'boolean' },
        timezone: { type: 'string' },
        localization: { type: 'string' },
        decimalSeparator: { type: 'string' },
        workflowUserId: { type: 'string' },
      },
      relationships: {
        ownedOrganizations: { type: 'hasMany', model: 'organization', inverse: 'owner' },
        organizationMemberships: {
          type: 'hasMany',
          model: 'organizationMembership',
          inverse: 'user',
        },
        groupMemberships: { type: 'hasMany', model: 'groupMembership', inverse: 'user' },
        organizations: { type: 'hasMany', model: 'organization', inverse: 'users' },
        assignedTasks: { type: 'hasMany', model: 'userTask', inverse: 'assigned' },
        projects: { type: 'hasMany', model: 'project', inverse: 'owner' },
        projectImports: { type: 'hasMany', model: 'projectImport', inverse: 'owner' },
        userRoles: { type: 'hasMany', model: 'userRole', inverse: 'user' },
        groups: { type: 'hasMany', model: 'group', inverse: 'users' },
        notifications: { type: 'hasMany', model: 'notification', inverse: 'user' },
        authors: { type: 'hasMany', model: 'author', inverse: 'user' },
      },
    },
    author: {
      keys: { remoteId: {} },
      attributes: {},
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'authors' },
        user: { type: 'hasOne', model: 'user', inverse: 'authors' },
      },
    },
    workflowDefinition: {
      keys: { remoteId: {} },
      attributes: {
        name: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'number' },
        enabled: { type: 'boolean' },
        workflowBusinessFlow: { type: 'string' },
        workflowScheme: { type: 'string' },
        properties: { type: 'string' },
      },
      relationships: {
        productDefinitions: { type: 'hasMany', model: 'productDefinition', inverse: 'workflow' },
        storeType: { type: 'hasOne', model: 'storeType', inverse: 'workflowDefinitions' },
        productsForRebuild: {
          type: 'hasMany',
          model: 'productDefinition',
          inverse: 'rebuildWorkflow',
        },
        productsForRepublish: {
          type: 'hasMany',
          model: 'productDefinition',
          inverse: 'republishWorkflow',
        },
      },
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
        user: { type: 'hasOne', model: 'user', inverse: 'notifications' },
      },
    },
    systemStatus: {
      keys: { remoteId: {} },
      attributes: {
        buildEngineUrl: { type: 'string' },
        buildEngineApiAccessToken: { type: 'string' },
        systemAvailable: { type: 'boolean' },
        dateCreated: { type: 'date' },
        dateUpdated: { type: 'date' },
      },
    },
  },
};

export const schema = new Schema(schemaDefinition);
