import { setup, assign, and } from 'xstate';
import DatabaseWrites from '../databaseProxy/index.js';
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowStateMeta,
  WorkflowTransitionMeta,
  AdminLevel,
  ProductType,
  ActionType,
  StateName,
  WorkflowEvent
} from '../public/workflow.js';
import { createSnapshot, updateUserTasks, updateProductTransitions } from './db.js';
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
  actions: {
    snapAndTasks: (
      { context, event },
      params?: { role?: RoleId | RoleId[] | ((context: WorkflowContext) => RoleId | RoleId[]) }
    ) => {
      const roles = typeof params?.role === 'function' ? params.role(context) : params?.role;
      createSnapshot(context.currentState, context);
      updateUserTasks(
        context.productId,
        roles ? (Array.isArray(roles) ? roles : [roles]) : [],
        context.currentState,
        event.comment
      );
    },
    transit: ({ context, event }, params?: { target?: StateName }) => {
      updateProductTransitions(
        DefaultWorkflow,
        context,
        event.userId,
        context.currentState,
        params?.target ?? event.target,
        event.type, // This will always log the command. Not sure if this is desired.
        event.comment
      );
    }
  },
  guards: {
    canJump: (
      { context },
      params: { target: StateName | string; product?: ProductType; level?: AdminLevel }
    ) => {
      return (
        context.start === params.target &&
        (params.product ? params.product === context.productType : true) &&
        (params.level ? params.level === context.adminLevel : true)
      );
    },
    // TODO: write actual guards. cannot be async, which means no checking DB
    hasAuthors: ({ context }) => {
      return true;
    },
    hasReviewers: ({ context }) => {
      return true;
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
    productId: input.productId,
    adminLevel: input.adminLevel ?? AdminLevel.None,
    environment: input.environment ?? {},
    productType: input.productType ?? ProductType.Android_GooglePlay
  }),
  states: {
    Start: {
      entry: ({ context }) => {
        DatabaseWrites.workflowInstances.upsert({
          where: {
            ProductId: context.productId
          },
          update: {},
          create: {
            Snapshot: '',
            ProductId: context.productId
          }
        });
      },
      always: [
        {
          guard: { type: 'canJump', params: { target: 'Readiness Check', level: AdminLevel.High } },
          target: 'Readiness Check'
        },
        {
          guard: { type: 'canJump', params: { target: 'Approval', level: AdminLevel.High } },
          target: 'Approval'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Approval Pending', level: AdminLevel.High }
          },
          target: 'Approval Pending'
        },
        {
          guard: { type: 'canJump', params: { target: 'Terminated', level: AdminLevel.High } },
          target: 'Terminated'
        },
        {
          guard: { type: 'canJump', params: { target: 'Project Creation' } },
          target: 'Project Creation'
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
            params: { target: 'App Store Preview', product: ProductType.Android_GooglePlay }
          },
          target: 'App Store Preview'
        },
        {
          guard: {
            type: 'canJump',
            params: { target: 'Create App Store Entry', product: ProductType.Android_GooglePlay }
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
            params: { target: 'Make It Live', product: ProductType.Android_GooglePlay }
          },
          target: 'Make It Live'
        },
        {
          guard: { type: 'canJump', params: { target: 'Published' } },
          target: 'Published'
        },
        {
          guard: ({ context }) => context.adminLevel === AdminLevel.High,
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
              level: AdminLevel.High
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
        level: AdminLevel.High
      },
      entry: [
        assign({
          instructions: 'readiness_check',
          includeFields: ['storeDescription', 'listingLanguageCode'],
          currentState: 'Readiness Check'
        }),
        { type: 'snapAndTasks', params: { role: RoleId.AppBuilder } }
      ],
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          actions: { type: 'transit', params: { target: 'Approval' } },
          target: 'Approval'
        }
      }
    },
    Approval: {
      meta: {
        level: AdminLevel.High
      },
      entry: [
        assign({
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
          currentState: 'Approval'
        }),
        { type: 'snapAndTasks', params: { role: RoleId.OrgAdmin } }
      ],
      on: {
        Approve: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          actions: { type: 'transit', params: { target: 'Product Creation' } },
          target: 'Product Creation'
        },
        Hold: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          actions: { type: 'transit', params: { target: 'Approval Pending' } },
          target: 'Approval Pending'
        },
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          actions: { type: 'transit', params: { target: 'Terminated' } },
          target: 'Terminated'
        }
      }
    },
    'Approval Pending': {
      meta: {
        level: AdminLevel.High
      },
      entry: [
        assign({
          instructions: 'approval_pending',
          includeFields: ['storeDescription', 'listingLanguageCode'],
          currentState: 'Approval Pending'
        }),
        { type: 'snapAndTasks', params: { role: RoleId.OrgAdmin } }
      ],
      on: {
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          actions: { type: 'transit', params: { target: 'Terminated' } },
          target: 'Terminated'
        },
        Hold: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          actions: { type: 'transit', params: { target: 'Approval Pending' } }
        },
        Approve: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          actions: { type: 'transit', params: { target: 'Product Creation' } },
          target: 'Product Creation'
        }
      }
    },
    Terminated: {
      meta: {
        level: AdminLevel.High
      },
      entry: [
        assign({
          instructions: null,
          includeFields: [],
          currentState: 'Terminated'
        }),
        { type: 'snapAndTasks' }
      ],
      type: 'final'
    },
    'Product Creation': {
      entry: [
        assign({ instructions: 'waiting', currentState: 'Product Creation' }),
        { type: 'snapAndTasks' },
        () => {
          // TODO: hook into build engine
          console.log('Creating Product');
        }
      ],
      on: {
        'Product Created': {
          meta: { type: ActionType.Auto },
          actions: { type: 'transit', params: { target: 'App Builder Configuration' } },
          target: 'App Builder Configuration'
        }
      }
    },
    'App Builder Configuration': {
      entry: [
        assign({
          instructions: ({ context }) =>
            context.productType === ProductType.Android_GooglePlay
              ? 'googleplay_configuration'
              : 'app_configuration',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL'],
          currentState: 'App Builder Configuration'
        }),
        {
          type: 'snapAndTasks',
          params: { role: RoleId.AppBuilder }
        }
      ],
      on: {
        'New App': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            product: ProductType.Android_GooglePlay
          },
          actions: { type: 'transit', params: { target: 'Product Build' } },
          target: 'Product Build'
        },
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            product: [ProductType.Android_S3, ProductType.AssetPackage, ProductType.Web]
          },
          actions: { type: 'transit', params: { target: 'Product Build' } },
          target: 'Product Build'
        },
        'Existing App': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            product: ProductType.Android_GooglePlay
          },
          actions: [
            { type: 'transit', params: { target: 'Product Build' } },
            assign({
              environment: ({ context }) => {
                context.environment.googlePlayExisting = true;
                return context.environment;
              }
            })
          ],
          target: 'Product Build'
        },
        'Transfer to Authors': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasAuthors' },
          actions: { type: 'transit', params: { target: 'Author Configuration' } },
          target: 'Author Configuration'
        }
      }
    },
    'Author Configuration': {
      entry: [
        assign({
          instructions: 'app_configuration',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL'],
          currentState: 'Author Configuration'
        }),
        {
          type: 'snapAndTasks',
          params: { role: [RoleId.AppBuilder, RoleId.Author] }
        }
      ],
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          actions: { type: 'transit', params: { target: 'App Builder Configuration' } },
          target: 'App Builder Configuration'
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          actions: { type: 'transit', params: { target: 'App Builder Configuration' } },
          target: 'App Builder Configuration'
        }
      }
    },
    'Synchronize Data': {
      entry: [
        assign({
          instructions: 'synchronize_data',
          includeFields: ['storeDescription', 'listingLanguageCode'],
          currentState: 'Synchronize Data'
        }),
        { type: 'snapAndTasks', params: { role: RoleId.AppBuilder } }
      ],
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          actions: { type: 'transit', params: { target: 'Product Build' } },
          target: 'Product Build'
        },
        'Transfer to Authors': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasAuthors' },
          actions: { type: 'transit', params: { target: 'Author Download' } },
          target: 'Author Download'
        }
      }
    },
    'Author Download': {
      entry: [
        assign({
          instructions: 'authors_download',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL'],
          currentState: 'Author Download'
        }),
        {
          type: 'snapAndTasks',
          params: { role: [RoleId.AppBuilder, RoleId.Author] }
        }
      ],
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          actions: { type: 'transit', params: { target: 'Author Upload' } },
          target: 'Author Upload'
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          actions: { type: 'transit', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        }
      }
    },
    'Author Upload': {
      entry: [
        assign({
          instructions: 'authors_upload',
          includeFields: ['storeDescription', 'listingLanguageCode'],
          currentState: 'Author Upload'
        }),
        {
          type: 'snapAndTasks',
          params: { role: [RoleId.AppBuilder, RoleId.Author] }
        }
      ],
      on: {
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          actions: { type: 'transit', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          actions: { type: 'transit', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        }
      }
    },
    'Product Build': {
      entry: [
        assign({
          instructions: 'waiting',
          currentState: 'Product Build'
        }),
        { type: 'snapAndTasks' },
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
              product: ProductType.Android_GooglePlay
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment.googlePlayUploaded,
            actions: { type: 'transit', params: { target: 'App Store Preview' } },
            target: 'App Store Preview'
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting ||
              context.environment.googlePlayUploaded,
            actions: { type: 'transit', params: { target: 'Verify and Publish' } },
            target: 'Verify and Publish'
          }
        ],
        'Build Failed': {
          meta: { type: ActionType.Auto },
          actions: { type: 'transit', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        }
      }
    },
    'App Store Preview': {
      meta: {
        product: ProductType.Android_GooglePlay
      },
      entry: [
        assign({
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
          includeArtifacts: true,
          currentState: 'App Store Preview'
        }),
        {
          type: 'snapAndTasks',
          params: {
            role: (context) =>
              context.adminLevel === AdminLevel.None ? RoleId.AppBuilder : RoleId.OrgAdmin
          }
        }
      ],
      exit: assign({ includeArtifacts: false }),
      on: {
        Approve: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              level: [AdminLevel.High, AdminLevel.Low]
            },
            actions: { type: 'transit', params: { target: 'Create App Store Entry' } },
            target: 'Create App Store Entry'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              level: AdminLevel.None
            },
            actions: { type: 'transit', params: { target: 'Create App Store Entry' } },
            target: 'Create App Store Entry'
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              level: [AdminLevel.High, AdminLevel.Low]
            },
            actions: { type: 'transit', params: { target: 'Synchronize Data' } },
            target: 'Synchronize Data'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              level: AdminLevel.None
            },
            actions: { type: 'transit', params: { target: 'Synchronize Data' } },
            target: 'Synchronize Data'
          }
        ]
      }
    },
    'Create App Store Entry': {
      meta: {
        product: ProductType.Android_GooglePlay
      },
      entry: [
        assign({
          instructions: 'create_app_entry',
          includeFields: ['storeDescription', 'listingLanguageCode'],
          includeArtifacts: true,
          environment: ({ context }) => {
            context.environment.googlePlayDraft = true;
            return context.environment;
          },
          currentState: 'Create App Store Entry'
        }),
        {
          type: 'snapAndTasks',
          params: {
            role: (context) =>
              context.adminLevel === AdminLevel.None ? RoleId.AppBuilder : RoleId.OrgAdmin
          }
        }
      ],
      exit: assign({ includeArtifacts: false }),
      on: {
        Continue: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              level: [AdminLevel.High, AdminLevel.Low]
            },
            actions: [
              { type: 'transit', params: { target: 'Verify and Publish' } },
              assign({
                environment: ({ context }) => {
                  context.environment.googlePlayUploaded = true;
                  return context.environment;
                }
              })
            ],
            target: 'Verify and Publish'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              level: AdminLevel.None
            },
            actions: [
              { type: 'transit', params: { target: 'Verify and Publish' } },
              assign({
                environment: ({ context }) => {
                  context.environment.googlePlayUploaded = true;
                  return context.environment;
                }
              })
            ],
            target: 'Verify and Publish'
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              level: [AdminLevel.High, AdminLevel.Low]
            },
            actions: { type: 'transit', params: { target: 'Synchronize Data' } },
            target: 'Synchronize Data'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              level: AdminLevel.None
            },
            actions: { type: 'transit', params: { target: 'Synchronize Data' } },
            target: 'Synchronize Data'
          }
        ]
      }
    },
    'Verify and Publish': {
      entry: [
        assign({
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
          includeArtifacts: true,
          currentState: 'Verify and Publish'
        }),
        {
          type: 'snapAndTasks',
          params: { role: RoleId.AppBuilder }
        }
      ],
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
          actions: { type: 'transit', params: { target: 'Product Publish' } },
          target: 'Product Publish'
        },
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          actions: { type: 'transit', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        },
        'Email Reviewers': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasReviewers' },
          actions: [
            { type: 'transit', params: { target: 'Verify and Publish' } },
            () => {
              // TODO: connect to backend to email reviewers
              console.log('Emailing Reviewers');
            }
          ]
        }
      }
    },
    'Product Publish': {
      entry: [
        assign({ instructions: 'waiting', currentState: 'Product Publish' }),
        { type: 'snapAndTasks' },
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
              product: ProductType.Android_GooglePlay
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment.googlePlayExisting,
            actions: { type: 'transit', params: { target: 'Make It Live' } },
            target: 'Make It Live'
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting,
            actions: { type: 'transit', params: { target: 'Published' } },
            target: 'Published'
          }
        ],
        'Publish Failed': {
          meta: { type: ActionType.Auto },
          actions: { type: 'transit', params: { target: 'Synchronize Data' } },
          target: 'Synchronize Data'
        }
      }
    },
    'Make It Live': {
      meta: {
        product: ProductType.Android_GooglePlay
      },
      entry: [
        assign({
          instructions: 'make_it_live',
          includeFields: ['storeDescription', 'listingLanguageCode'],
          currentState: 'Make It Live'
        }),
        {
          type: 'snapAndTasks',
          params: {
            role: (context) =>
              context.adminLevel === AdminLevel.None ? RoleId.AppBuilder : RoleId.OrgAdmin
          }
        }
      ],
      on: {
        Continue: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              level: [AdminLevel.High, AdminLevel.Low]
            },
            actions: { type: 'transit', params: { target: 'Published' } },
            target: 'Published'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              level: AdminLevel.None
            },
            actions: { type: 'transit', params: { target: 'Published' } },
            target: 'Published'
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              level: [AdminLevel.High, AdminLevel.Low]
            },
            actions: { type: 'transit', params: { target: 'Synchronize Data' } },
            target: 'Synchronize Data'
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              level: AdminLevel.None
            },
            actions: { type: 'transit', params: { target: 'Synchronize Data' } },
            target: 'Synchronize Data'
          }
        ]
      }
    },
    Published: {
      entry: [
        assign({
          instructions: null,
          includeFields: ['storeDescription', 'listingLanguageCode'],
          currentState: 'Published'
        }),
        { type: 'snapAndTasks' }
      ],
      type: 'final'
    }
  },
  on: {
    Jump: {
      actions: [
        assign({
          start: ({ context, event }) => {
            console.log(context.start + ' => ' + event.target);
            return event.target;
          }
        }),
        { type: 'transit' },
        ({ event }) => {
          console.log('Jumping to: ' + event.target);
        }
      ],
      target: '.Start'
    }
  }
});
