import { setup, assign } from 'xstate';
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowStateMeta,
  WorkflowTransitionMeta,
  WorkflowAdminRequirements,
  ProductType,
  ActionType,
  StateName,
  WorkflowEvent,
  JumpParams,
  jump
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
    canJump: ({ context }, params: JumpParams) => {
      return (
        context.start === params.target &&
        (params.products ? params.products.includes(context.productType) : true) &&
        (params.adminRequirements
          ? context.adminRequirements.filter((urf) => params.adminRequirements.includes(urf))
              .length > 0
          : true)
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
    adminRequirements: input.adminRequirements,
    productId: input.productId,
    hasAuthors: input.hasAuthors,
    hasReviewers: input.hasReviewers
  }),
  states: {
    Start: {
      always: [
        jump({
          target: StateName.Readiness_Check,
          adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
        }),
        jump({
          target: StateName.Approval,
          adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
        }),
        jump({
          target: StateName.Approval_Pending,
          adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
        }),
        jump({
          target: StateName.Terminated,
          adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
        }),
        jump({ target: StateName.Product_Creation }),
        jump({ target: StateName.App_Builder_Configuration }),
        //@ts-expect-error I couldn't figure out the TS magic to prevent this from complaining. It should work fine though.
        jump({ target: StateName.Author_Configuration }, [{ type: 'hasAuthors' }]),
        jump({ target: StateName.Synchronize_Data }),
        //@ts-expect-error
        jump({ target: StateName.Author_Download }, [{ type: 'hasAuthors' }]),
        //note: authors can upload at any time, this state is just to prompt an upload
        //@ts-expect-error
        jump({ target: StateName.Author_Upload }, [{ type: 'hasAuthors' }]),
        jump({ target: StateName.Product_Build }),
        jump({
          target: StateName.App_Store_Preview,
          products: [ProductType.Android_GooglePlay]
        }),
        jump({
          target: StateName.Create_App_Store_Entry,
          products: [ProductType.Android_GooglePlay]
        }),
        jump({ target: StateName.Verify_and_Publish }),
        jump({ target: StateName.Product_Publish }),
        jump({ target: StateName.Make_It_Live, products: [ProductType.Android_GooglePlay] }),
        jump({ target: StateName.Published }),
        {
          guard: ({ context }) =>
            context.adminRequirements.includes(WorkflowAdminRequirements.ApprovalProcess),
          target: StateName.Readiness_Check
        },
        {
          target: StateName.Product_Creation
        }
      ],
      on: {
        // this is here just so the default start transition shows up in the visualization
        // don't actually use this transition
        Default: [
          {
            meta: {
              type: ActionType.Auto,
              adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
            },
            target: StateName.Readiness_Check
          },
          {
            meta: { type: ActionType.Auto },
            target: StateName.Product_Creation
          }
        ]
      }
    },
    [StateName.Readiness_Check]: {
      meta: {
        adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
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
          target: StateName.Approval
        }
      }
    },
    [StateName.Approval]: {
      meta: {
        adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
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
          target: StateName.Product_Creation
        },
        Hold: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: StateName.Approval_Pending
        },
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: StateName.Terminated
        }
      }
    },
    [StateName.Approval_Pending]: {
      meta: {
        adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
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
          target: StateName.Terminated
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
          target: StateName.Product_Creation
        }
      }
    },
    [StateName.Terminated]: {
      meta: {
        adminRequirements: [WorkflowAdminRequirements.ApprovalProcess]
      },
      entry: assign({
        instructions: null,
        includeFields: []
      }),
      type: 'final'
    },
    [StateName.Product_Creation]: {
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
          target: StateName.App_Builder_Configuration
        }
      }
    },
    [StateName.App_Builder_Configuration]: {
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
          target: StateName.Product_Build
        },
        Continue: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            productTypes: [ProductType.Android_S3, ProductType.AssetPackage, ProductType.Web]
          },
          target: StateName.Product_Build
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
          target: StateName.Product_Build
        },
        'Transfer to Authors': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasAuthors' },
          target: StateName.Author_Configuration
        }
      }
    },
    [StateName.Author_Configuration]: {
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
          target: StateName.App_Builder_Configuration
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: StateName.App_Builder_Configuration
        }
      }
    },
    [StateName.Synchronize_Data]: {
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
          target: StateName.Product_Build
        },
        'Transfer to Authors': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          guard: { type: 'hasAuthors' },
          target: StateName.Author_Download
        }
      }
    },
    [StateName.Author_Download]: {
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
          target: StateName.Author_Upload
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: StateName.Synchronize_Data
        }
      }
    },
    [StateName.Author_Upload]: {
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
          target: StateName.Synchronize_Data
        },
        'Take Back': {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: StateName.Synchronize_Data
        }
      }
    },
    [StateName.Product_Build]: {
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
            target: StateName.App_Store_Preview
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting ||
              context.environment.googlePlayUploaded,
            target: StateName.Verify_and_Publish
          }
        ],
        'Build Failed': {
          meta: { type: ActionType.Auto },
          target: StateName.Synchronize_Data
        }
      }
    },
    [StateName.App_Store_Preview]: {
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
              adminRequirements: [
                WorkflowAdminRequirements.ApprovalProcess,
                WorkflowAdminRequirements.StoreAccess
              ]
            },
            target: StateName.Create_App_Store_Entry
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              adminRequirements: [WorkflowAdminRequirements.None]
            },
            target: StateName.Create_App_Store_Entry
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              adminRequirements: [
                WorkflowAdminRequirements.ApprovalProcess,
                WorkflowAdminRequirements.StoreAccess
              ]
            },
            target: StateName.Synchronize_Data
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              adminRequirements: [WorkflowAdminRequirements.None]
            },
            target: StateName.Synchronize_Data
          }
        ]
      }
    },
    [StateName.Create_App_Store_Entry]: {
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
              adminRequirements: [
                WorkflowAdminRequirements.ApprovalProcess,
                WorkflowAdminRequirements.StoreAccess
              ]
            },
            actions: assign({
              environment: ({ context }) => {
                context.environment.googlePlayUploaded = true;
                return context.environment;
              }
            }),
            target: StateName.Verify_and_Publish
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              adminRequirements: [WorkflowAdminRequirements.None]
            },
            actions: assign({
              environment: ({ context }) => {
                context.environment.googlePlayUploaded = true;
                return context.environment;
              }
            }),
            target: StateName.Verify_and_Publish
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              adminRequirements: [
                WorkflowAdminRequirements.ApprovalProcess,
                WorkflowAdminRequirements.StoreAccess
              ]
            },
            target: StateName.Synchronize_Data
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              adminRequirements: [WorkflowAdminRequirements.None]
            },
            target: StateName.Synchronize_Data
          }
        ]
      }
    },
    [StateName.Verify_and_Publish]: {
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
          target: StateName.Product_Publish
        },
        Reject: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: StateName.Synchronize_Data
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
    [StateName.Product_Publish]: {
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
            target: StateName.Make_It_Live
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting,
            target: StateName.Published
          }
        ],
        'Publish Failed': {
          meta: { type: ActionType.Auto },
          target: StateName.Synchronize_Data
        }
      }
    },
    [StateName.Make_It_Live]: {
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
              adminRequirements: [
                WorkflowAdminRequirements.ApprovalProcess,
                WorkflowAdminRequirements.StoreAccess
              ]
            },
            target: StateName.Published
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              adminRequirements: [WorkflowAdminRequirements.None]
            },
            target: StateName.Published
          }
        ],
        Reject: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              adminRequirements: [
                WorkflowAdminRequirements.ApprovalProcess,
                WorkflowAdminRequirements.StoreAccess
              ]
            },
            target: StateName.Synchronize_Data
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              adminRequirements: [WorkflowAdminRequirements.None]
            },
            target: StateName.Synchronize_Data
          }
        ]
      }
    },
    [StateName.Published]: {
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
