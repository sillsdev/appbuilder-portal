import { setup, assign, and } from 'xstate';
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowStateMeta,
  WorkflowTransitionMeta,
  UserRoleFeature,
  ProductType,
  ActionType,
  StateName,
  WorkflowEvent
} from '../public/workflow.js';
import { RoleId } from '../public/prisma.js';

/**
 * IMPORTANT: READ THIS BEFORE EDITING A STATE MACHINE!
 *
 * Conventions:
 *  - Each state must have a `meta` with the appropriate properties if it should be included only under certain conditions
 *  - Each state must have an `entry` in which:
 *    - All relevant context variables are `assign`ed (e.g. `instructions`, `includeFields`)
 *      - If `includeReviewers` or `includeFields` is set in `entry`, there must be a corresponding `exit` that `assign`s them to `false`
 *    - the `snapAndTasks` action is called with the appropriate parameters
 *  - Each transition must use the `transit` action with the appropriate parameters
 *  - Each transition must have a `meta` that specifies who can initiate the transition
 *    - The `meta` may also specify filtering criteria like in a state meta
 *  - The first transition in a state will be the "happy" path, assuming the state is in the "happy" path
 */
export const DefaultWorkflow = setup({
  types: {
    context: {} as WorkflowContext,
    input: {} as WorkflowInput,
    meta: {} as WorkflowStateMeta | WorkflowTransitionMeta,
    events: {} as WorkflowEvent
  },
  guards: {
    canJump: (
      { context },
      params: {
        target: StateName | string;
        products?: ProductType[];
        URFeatures?: UserRoleFeature[];
      }
    ) => {
      return (
        context.start === params.target &&
        (params.products ? params.products.includes(context.productType) : true) &&
        (params.URFeatures ? context.URFeatures.filter((urf) => params.URFeatures.includes(urf)).length > 0 : true)
      );
    },
    hasAuthors: ({ context }) => {
      return context.hasAuthors;
    },
    hasReviewers: ({ context }) => {
      return context.hasReviewers;
    }
  }
}).createMachine({
  id: 'DefaultWorkflow',
  initial: 'Start',
  context: ({ input }) => ({
    instructions: null,
    /** projectName and projectDescription are always included */
    includeFields: [],
    /** Reset to false on exit */
    includeReviewers: false,
    /** Reset to false on exit */
    includeArtifacts: false,
    environment: {},
    productType: input.productType,
    URFeatures: input.URFeatures,
    productId: input.productId,
    hasAuthors: input.hasAuthors,
    hasReviewers: input.hasReviewers
  }),
  states: {
    Start: {
      always: [
        {
          guard: {
            type: 'canJump',
            params: { target: 'Readiness Check', URFeatures: [UserRoleFeature.RequireApprovalProcess] }
          },
          target: 'Readiness Check'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Approval', URFeatures: [UserRoleFeature.RequireApprovalProcess] }
          },
          target: 'Approval'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Approval Pending', URFeatures: [UserRoleFeature.RequireApprovalProcess] }
          },
          target: 'Approval Pending'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Terminated', URFeatures: [UserRoleFeature.RequireApprovalProcess] }
          },
          target: 'Terminated'
        },
        {
          guard: { type: 'canJump', params: { target: 'Product Creation' } },
          target: 'Product Creation'
        },
        {
          guard: { type: 'canJump', params: { target: 'App Builder Configuration' } },
          target: 'App Builder Configuration'
        },
        {
          guard: and([
            { type: 'canJump', params: { target: 'Author Configuration' } },
            { type: 'hasAuthors' }
          ]),
          target: 'Author Configuration'
        },
        {
          guard: { type: 'canJump', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        },
        {
          guard: and([
            { type: 'canJump', params: { target: 'Author Download' } },
            { type: 'hasAuthors' }
          ]),
          target: 'Author Download'
        },
        {
          //note: authors can upload at any time, this state is just to prompt an upload
          guard: and([
            { type: 'canJump', params: { target: 'Author Upload' } },
            { type: 'hasAuthors' }
          ]),
          target: 'Author Upload'
        },
        {
          guard: { type: 'canJump', params: { target: 'Product Build' } },
          target: 'Product Build'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'App Store Preview', products: [ProductType.Android_GooglePlay] }
          },
          target: 'App Store Preview'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Create App Store Entry', products: [ProductType.Android_GooglePlay] }
          },
          target: 'Create App Store Entry'
        },
        {
          guard: { type: 'canJump', params: { target: 'Verify and Publish' } },
          target: 'Verify and Publish'
        },
        {
          guard: { type: 'canJump', params: { target: 'Product Publish' } },
          target: 'Product Publish'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Make It Live', products: [ProductType.Android_GooglePlay] }
          },
          target: 'Make It Live'
        },
        {
          guard: { type: 'canJump', params: { target: 'Published' } },
          target: 'Published'
        },
        {
          guard: ({ context }) => context.URFeatures.includes(UserRoleFeature.RequireApprovalProcess),
          target: 'Readiness Check'
        },
        {
          target: 'Product Creation'
        }
      ],
      on: {
        // this is here just so the default start transition shows up in the visualization
        // don't actually use this transition
        Default: [
          {
            meta: {
              type: ActionType.Auto,
              URFeatures: [UserRoleFeature.RequireApprovalProcess]
            },
            target: 'Readiness Check'
          },
          {
            meta: { type: ActionType.Auto },
            target: 'Product Creation'
          }
        ]
      }
    },
    'Readiness Check': {
      meta: {
        URFeatures: [UserRoleFeature.RequireApprovalProcess]
      },
      entry: assign({
        instructions: 'readiness_check',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'Approval'
        }
      }
    },
    Approval: {
      meta: {
        URFeatures: [UserRoleFeature.RequireApprovalProcess]
      },
      entry: assign({
        instructions: null,
        includeFields: [
          'ownerName',
          'ownerEmail',
          'storeDescription',
          'listingLanguageCode',
          'productDescription',
          'appType',
          'projectLanguageCode'
        ]
      }),
      on: {
        Approve: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: 'Product Creation'
        },
        Hold: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: 'Approval Pending'
        },
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: 'Terminated'
        }
      }
    },
    'Approval Pending': {
      meta: {
        URFeatures: [UserRoleFeature.RequireApprovalProcess]
      },
      entry: [
        assign({
          instructions: 'approval_pending',
          includeFields: ['storeDescription', 'listingLanguageCode']
        })
      ],
      on: {
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: 'Terminated'
        },
        Hold: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          }
        },
        Approve: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: 'Product Creation'
        }
      }
    },
    Terminated: {
      meta: {
        URFeatures: [UserRoleFeature.RequireApprovalProcess]
      },
      entry: assign({
        instructions: null,
        includeFields: []
      }),
      type: 'final'
    },
    'Product Creation': {
      entry: [
        assign({ instructions: 'waiting' }),
        () => {
          // TODO: hook into build engine
          console.log('Creating Product');
        }
      ],
      on: {
        'Product Created': {
          meta: { type: ActionType.Auto },
          target: 'App Builder Configuration'
        }
      }
    },
    'App Builder Configuration': {
      entry: assign({
        instructions: ({ context }) =>
          context.productType === ProductType.Android_GooglePlay
            ? 'googleplay_configuration'
            : 'app_configuration',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        'New App': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            productTypes: [ProductType.Android_GooglePlay]
          },
          target: 'Product Build'
        },
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            productTypes: [ProductType.Android_S3, ProductType.AssetPackage, ProductType.Web]
          },
          target: 'Product Build'
        },
        'Existing App': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            productTypes: [ProductType.Android_GooglePlay]
          },
          actions: assign({
            environment: ({ context }) => {
              context.environment.googlePlayExisting = true;
              return context.environment;
            }
          }),
          target: 'Product Build'
        },
        'Transfer to Authors': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasAuthors' },
          target: 'Author Configuration'
        }
      }
    },
    'Author Configuration': {
      entry: assign({
        instructions: 'app_configuration',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          target: 'App Builder Configuration'
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'App Builder Configuration'
        }
      }
    },
    'Synchronize Data': {
      entry: assign({
        instructions: 'synchronize_data',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'Product Build'
        },
        'Transfer to Authors': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasAuthors' },
          target: 'Author Download'
        }
      }
    },
    'Author Download': {
      entry: assign({
        instructions: 'authors_download',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          target: 'Author Upload'
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'Synchronize Data'
        }
      }
    },
    'Author Upload': {
      entry: assign({
        instructions: 'authors_upload',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          target: 'Synchronize Data'
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'Synchronize Data'
        }
      }
    },
    'Product Build': {
      entry: [
        assign({
          instructions: 'waiting'
        }),
        () => {
          // TODO: hook into build engine
          console.log('Building Product');
        }
      ],
      on: {
        'Build Successful': [
          {
            meta: {
              type: ActionType.Auto,
              productTypes: [ProductType.Android_GooglePlay]
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment.googlePlayUploaded,
            target: 'App Store Preview'
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting ||
              context.environment.googlePlayUploaded,
            target: 'Verify and Publish'
          }
        ],
        'Build Failed': {
          meta: { type: ActionType.Auto },
          target: 'Synchronize Data'
        }
      }
    },
    'App Store Preview': {
      meta: {
        productTypes: [ProductType.Android_GooglePlay]
      },
      entry: assign({
        instructions: null,
        includeFields: [
          'ownerName',
          'ownerEmail',
          'storeDescription',
          'listingLanguageCode',
          'productDescription',
          'appType',
          'projectLanguageCode'
        ],
        includeArtifacts: true
      }),
      exit: assign({ includeArtifacts: false }),
      on: {
        Approve: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              URFeatures: [UserRoleFeature.RequireApprovalProcess, UserRoleFeature.RequireAdminConfiguration]
            },
            target: 'Create App Store Entry'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              URFeatures: [UserRoleFeature.None]
            },
            target: 'Create App Store Entry'
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              URFeatures: [UserRoleFeature.RequireApprovalProcess, UserRoleFeature.RequireAdminConfiguration]
            },
            target: 'Synchronize Data'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              URFeatures: [UserRoleFeature.None]
            },
            target: 'Synchronize Data'
          }
        ]
      }
    },
    'Create App Store Entry': {
      meta: {
        productTypes: [ProductType.Android_GooglePlay]
      },
      entry: assign({
        instructions: 'create_app_entry',
        includeFields: ['storeDescription', 'listingLanguageCode'],
        includeArtifacts: true,
        environment: ({ context }) => {
          context.environment.googlePlayDraft = true;
          return context.environment;
        }
      }),
      exit: assign({ includeArtifacts: false }),
      on: {
        Continue: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              URFeatures: [UserRoleFeature.RequireApprovalProcess, UserRoleFeature.RequireAdminConfiguration]
            },
            actions: assign({
              environment: ({ context }) => {
                context.environment.googlePlayUploaded = true;
                return context.environment;
              }
            }),
            target: 'Verify and Publish'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              URFeatures: [UserRoleFeature.None]
            },
            actions: assign({
              environment: ({ context }) => {
                context.environment.googlePlayUploaded = true;
                return context.environment;
              }
            }),
            target: 'Verify and Publish'
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              URFeatures: [UserRoleFeature.RequireApprovalProcess, UserRoleFeature.RequireAdminConfiguration]
            },
            target: 'Synchronize Data'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              URFeatures: [UserRoleFeature.None]
            },
            target: 'Synchronize Data'
          }
        ]
      }
    },
    'Verify and Publish': {
      entry: assign({
        instructions: ({ context }) => {
          switch (context.productType) {
            case ProductType.Android_GooglePlay:
              return 'googleplay_verify_and_publish';
            case ProductType.Android_S3:
              return 'verify_and_publish';
            case ProductType.AssetPackage:
              return 'asset_package_verify_and_publish';
            case ProductType.Web:
              return 'web_verify';
          }
        },
        includeFields: ({ context }) => {
          switch (context.productType) {
            case ProductType.Android_GooglePlay:
            case ProductType.Android_S3:
              return ['storeDescription', 'listingLanguageCode'];
            case ProductType.AssetPackage:
            case ProductType.Web:
              return ['storeDescription'];
          }
        },
        includeReviewers: true,
        includeArtifacts: true
      }),
      exit: assign({
        includeReviewers: false,
        includeArtifacts: false
      }),
      on: {
        Approve: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'Product Publish'
        },
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: 'Synchronize Data'
        },
        'Email Reviewers': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasReviewers' },
          actions: () => {
            // TODO: connect to backend to email reviewers
            console.log('Emailing Reviewers');
          }
        }
      }
    },
    'Product Publish': {
      entry: [
        assign({ instructions: 'waiting' }),
        () => {
          // TODO: hook into build engine
          console.log('Publishing Product');
        }
      ],
      on: {
        'Publish Completed': [
          {
            meta: {
              type: ActionType.Auto,
              productTypes: [ProductType.Android_GooglePlay]
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment.googlePlayExisting,
            target: 'Make It Live'
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting,
            target: 'Published'
          }
        ],
        'Publish Failed': {
          meta: { type: ActionType.Auto },
          target: 'Synchronize Data'
        }
      }
    },
    'Make It Live': {
      meta: {
        productTypes: [ProductType.Android_GooglePlay]
      },
      entry: assign({
        instructions: 'make_it_live',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        Continue: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              URFeatures: [UserRoleFeature.RequireApprovalProcess, UserRoleFeature.RequireAdminConfiguration]
            },
            target: 'Published'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              URFeatures: [UserRoleFeature.None]
            },
            target: 'Published'
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              URFeatures: [UserRoleFeature.RequireApprovalProcess, UserRoleFeature.RequireAdminConfiguration]
            },
            target: 'Synchronize Data'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              URFeatures: [UserRoleFeature.None]
            },
            target: 'Synchronize Data'
          }
        ]
      }
    },
    Published: {
      entry: assign({
        instructions: null,
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      type: 'final'
    }
  },
  on: {
    Jump: {
      actions: [
        assign({
          start: ({ context, event }) => event.target
        })
      ],
      target: '.Start'
    }
  }
});
