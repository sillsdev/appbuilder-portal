export default {
  appName: 'Scriptoria',
  welcome: 'Welcome to Scriptoria',
  search: 'Search',

  contactUs: 'Contact Us',
  exampleForm: 'Example Form',

  updated: 'Updated!',

  common: {
    search: 'Search',
    change: 'Change',
    save: 'Save'
  },

  auth: {
    title: 'Scriptoria',
    signup: 'Sign Up',
    login: 'Log In',
  },

  directory: {
    title: `Project Directory ({numProjects})`,
    filters: {
      dateRange: 'Date Range Between'
    }
  },

  header: {
    myProfile: 'My Profile',
    help: 'Help',
    signOut: 'Sign out',
    clearAll: 'Clear All',
    emptyNotifications: 'You have no notifications.'
  },

  sidebar: {
    myTasks: 'My Tasks',
    ourProjects: 'Our Projects',
    users: 'Users',
    organizationSettings: 'Organization Settings',
    projectDirectory: 'Project Directory',
    addProject: 'Add Project'
  },

  invitations: {
    orgPrompt: 'Would you like to sign up your organization?',
    missingTokenTitle: 'Your invitation token is missing',
    missingTokenPrompt: 'Please check the link and try again',
    orgInviteTitle: 'You have been invited to create an organization!',
    orgName: 'Organization Name',
    orgUrl: 'Organization Website URL',
    orgSubmit: 'Add Organization',
  },

  org: {
    allOrganizations: 'All Organizations',
    createSuccess: 'Organization created successfully!',
    settingsTitle: 'Organization Settings',
    selectLogo: 'Select Logo',
    productsTitle: 'Products and Publishing',
    makePrivateTitle: 'Make Projects Private by Default',
    makePrivateDescription: `
      When a new project is created, it will be defaulted to Private.
      (Private projects cannot be viewed by anyone outside of your organization)`,
    productSelectTitle: 'Select all the products you would like to make available to your organization',
    navBasic: 'Basic Info',
    navProducts: 'Products',
    navGroups: 'Groups',
    navInfrastructure: 'Infrastructure',
    infrastructureTitle: 'Infrastructure',
    useSilInfrastructureTitle: `Use SIL International's AWS Build Infrastructure`,
    groupsTitle: 'Groups',
    noGroups: 'Your organization has no groups',
    addGroupButton: 'Add Group',
    basicTitle: 'Basic Info',
    orgName: 'Organization Name',
    save: 'Save',
  },

  products: {
  },

  profile: {
    title: 'Profile',
    pictureTitle: 'Profile Picture',
    general: 'General',
    updated: 'User updated successfully!',
    updatePicture: 'Update your picture at Gravatar.com',
    uploadPicture: 'Upload new picture',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    timezone: 'Timezone',
    locale: 'Locale',
    timezonePlaceholder: 'Select your timezone...',
    notificationSettingsTitle: 'Notification Settings',
    optOutOfEmailOption: 'I want to receive email notifications',
    sshSettingsTitle: 'Manage Personal SSH Keys',
    sshKeyLabel: 'SSH Key'
  },

  errors: {
    notFoundTitle: 'Not Found!',
    notFoundDescription: 'Something went wrong and the page or resource could not be found!'
  },

  tasks: {
    title: 'My Tasks',
    project: 'Project',
    product: 'Product',
    assignedTo: 'Assigned To',
    status: 'Status',
    waitTime: 'Wait Time',
    unclaimed: '[unclaimed]',
    noTasksTitle: 'No tasks are assigned to you.',
    noTasksDescription: 'Tasks that require your attention will appear here.',
    reassign: 'Reassign',
  },

  project: {
    createdOn: 'Created',
    overview: 'Overview',
    dropdown: {
      transfer: 'Transfer Ownership',
      archive: 'Archive'
    },
    details: {
      title: 'Details',
      language: 'Language',
      type: 'Project Type'
    },
    products: {
      title: 'Products',
      empty: 'You have no products for this project.',
      add: 'add product'
    },
    settings: {
      title: 'Settings',
      automaticRebuild: {
        title: 'Automatic Rebuilds',
        description: 'When automatic rebuilds are on, Scriptoria will automatically rebuild your products when the input source is updated'
      },
      organizationDownloads: {
        title: 'Allow Other Organizations to download',
        description: 'When this setting is on, any Scriptoria User this is able to view your project in the Directory will be able to download your Products and their Artifacts'
      }
    },
    side: {
      repositoryLocation: 'Repository Location',
      organization: 'Organization',
      projectOwner: 'Project Owner',
      projectGroup: 'Project Group',
      reviewers: {
        title: 'Reviewers',
        add: 'add reviewer'
      }
    }
  },

  users: {
    title: 'Manage Users',
    table: {
      columns: {
        name: 'Name',
        role: 'Role',
        groups: 'Groups',
        disabled: 'Disabled'
      }
    }
  }


};
