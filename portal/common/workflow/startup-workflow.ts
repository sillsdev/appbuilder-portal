import { setup, assign } from 'xstate';
import {
  WorkflowContext,
  WorkflowInput,
  WorkflowStateMeta,
  WorkflowTransitionMeta,
  WorkflowOptions,
  ProductType,
  ActionType,
  WorkflowState,
  WorkflowAction,
  WorkflowEvent,
  JumpParams,
  jump,
  includeStateOrTransition
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
export const StartupWorkflow = setup({
  types: {
    context: {} as WorkflowContext,
    input: {} as WorkflowInput,
    meta: {} as WorkflowStateMeta | WorkflowTransitionMeta,
    events: {} as WorkflowEvent
  },
  guards: {
    canJump: ({ context }, params: JumpParams) => {
      return context.start === params.target && includeStateOrTransition(context, params.filter);
    },
    hasAuthors: ({ context }) => {
      return context.hasAuthors;
    },
    hasReviewers: ({ context }) => {
      return context.hasReviewers;
    }
  }
}).createMachine({
  id: 'StartupWorkflow',
  initial: WorkflowState.Start,
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
    options: input.options,
    productId: input.productId,
    hasAuthors: input.hasAuthors,
    hasReviewers: input.hasReviewers
  }),
  states: {
    [WorkflowState.Start]: {
      always: [
        jump({
          target: WorkflowState.Approval,
          filter: {
            options: { has: WorkflowOptions.ApprovalProcess }
          }
        }),
        jump({
          target: WorkflowState.Approval_Pending,
          filter: {
            options: { has: WorkflowOptions.ApprovalProcess }
          }
        }),
        jump({
          target: WorkflowState.Terminated,
          filter: {
            options: { has: WorkflowOptions.ApprovalProcess }
          }
        }),
        jump({ target: WorkflowState.Product_Creation }),
        jump({ target: WorkflowState.App_Builder_Configuration }),
        jump(
          {
            target: WorkflowState.Author_Configuration,
            filter: { options: { has: WorkflowOptions.AllowTransferToAuthors } }
          },
          //@ts-expect-error I couldn't figure out the TS magic to prevent this from complaining. It should work fine though.
          [{ type: 'hasAuthors' }]
        ),
        jump({ target: WorkflowState.Synchronize_Data }),
        jump(
          {
            target: WorkflowState.Author_Download,
            filter: { options: { has: WorkflowOptions.AllowTransferToAuthors } }
          },
          //@ts-expect-error
          [{ type: 'hasAuthors' }]
        ),
        //note: authors can upload at any time, this state is just to prompt an upload
        jump(
          {
            target: WorkflowState.Author_Upload,
            filter: { options: { has: WorkflowOptions.AllowTransferToAuthors } }
          },
          //@ts-expect-error
          [{ type: 'hasAuthors' }]
        ),
        jump({ target: WorkflowState.Product_Build }),
        jump({
          target: WorkflowState.App_Store_Preview,
          filter: {
            productType: { is: ProductType.Android_GooglePlay }
          }
        }),
        jump({
          target: WorkflowState.Create_App_Store_Entry,
          filter: {
            productType: { is: ProductType.Android_GooglePlay }
          }
        }),
        jump({ target: WorkflowState.Verify_and_Publish }),
        jump({ target: WorkflowState.Product_Publish }),
        jump({
          target: WorkflowState.Make_It_Live,
          filter: { productType: { is: ProductType.Android_GooglePlay } }
        }),
        jump({ target: WorkflowState.Published }),
        {
          guard: ({ context }) => context.options.has(WorkflowOptions.ApprovalProcess),
          target: WorkflowState.Approval
        },
        {
          target: WorkflowState.Product_Creation
        }
      ],
      on: {
        // this is here just so the default start transition shows up in the visualization
        // don't actually use this transition
        [WorkflowAction.Default]: [
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                options: { has: WorkflowOptions.ApprovalProcess }
              }
            },
            target: WorkflowState.Approval
          },
          {
            meta: { type: ActionType.Auto },
            target: WorkflowState.Product_Creation
          }
        ]
      }
    },
    [WorkflowState.Approval]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.ApprovalProcess }
        }
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
        [WorkflowAction.Approve]: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: WorkflowState.Product_Creation
        },
        [WorkflowAction.Hold]: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: WorkflowState.Approval_Pending
        },
        [WorkflowAction.Reject]: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: WorkflowState.Terminated
        }
      }
    },
    [WorkflowState.Approval_Pending]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.ApprovalProcess }
        }
      },
      entry: [
        assign({
          instructions: 'approval_pending',
          includeFields: ['storeDescription', 'listingLanguageCode']
        })
      ],
      on: {
        [WorkflowAction.Reject]: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: WorkflowState.Terminated
        },
        [WorkflowAction.Hold]: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          }
        },
        [WorkflowAction.Approve]: {
          meta: {
            type: ActionType.User,
            user: RoleId.OrgAdmin
          },
          target: WorkflowState.Product_Creation
        }
      }
    },
    [WorkflowState.Terminated]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.ApprovalProcess }
        }
      },
      entry: assign({
        instructions: null,
        includeFields: []
      }),
      type: 'final'
    },
    [WorkflowState.Product_Creation]: {
      entry: [
        assign({ instructions: 'waiting' }),
        () => {
          // TODO: hook into build engine
          console.log('Creating Product');
        }
      ],
      on: {
        [WorkflowAction.Product_Created]: {
          meta: { type: ActionType.Auto },
          target: WorkflowState.App_Builder_Configuration
        }
      }
    },
    [WorkflowState.App_Builder_Configuration]: {
      entry: assign({
        instructions: ({ context }) =>
          context.productType === ProductType.Android_GooglePlay
            ? 'googleplay_configuration'
            : 'app_configuration',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        [WorkflowAction.New_App]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            includeWhen: {
              productType: { is: ProductType.Android_GooglePlay }
            }
          },
          target: WorkflowState.Product_Build
        },
        [WorkflowAction.Continue]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            includeWhen: {
              productType: { not: ProductType.Android_GooglePlay }
            }
          },
          target: WorkflowState.Product_Build
        },
        [WorkflowAction.Existing_App]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            includeWhen: {
              productType: { is: ProductType.Android_GooglePlay }
            }
          },
          actions: assign({
            environment: ({ context }) => {
              context.environment.googlePlayExisting = true;
              return context.environment;
            }
          }),
          target: WorkflowState.Product_Build
        },
        [WorkflowAction.Transfer_to_Authors]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            includeWhen: {
              options: { has: WorkflowOptions.AllowTransferToAuthors }
            }
          },
          guard: { type: 'hasAuthors' },
          target: WorkflowState.Author_Configuration
        }
      }
    },
    [WorkflowState.Author_Configuration]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.AllowTransferToAuthors }
        }
      },
      entry: assign({
        instructions: 'app_configuration',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        [WorkflowAction.Continue]: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          target: WorkflowState.App_Builder_Configuration
        },
        [WorkflowAction.Take_Back]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: WorkflowState.App_Builder_Configuration
        }
      }
    },
    [WorkflowState.Synchronize_Data]: {
      entry: assign({
        instructions: 'synchronize_data',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        [WorkflowAction.Continue]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: WorkflowState.Product_Build
        },
        [WorkflowAction.Transfer_to_Authors]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            includeWhen: {
              options: { has: WorkflowOptions.AllowTransferToAuthors }
            }
          },
          guard: { type: 'hasAuthors' },
          target: WorkflowState.Author_Download
        }
      }
    },
    [WorkflowState.Author_Download]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.AllowTransferToAuthors }
        }
      },
      entry: assign({
        instructions: 'authors_download',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        [WorkflowAction.Continue]: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          target: WorkflowState.Author_Upload
        },
        [WorkflowAction.Take_Back]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: WorkflowState.Synchronize_Data
        }
      }
    },
    [WorkflowState.Author_Upload]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.AllowTransferToAuthors }
        }
      },
      entry: assign({
        instructions: 'authors_upload',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        [WorkflowAction.Continue]: {
          meta: {
            type: ActionType.User,
            user: RoleId.Author
          },
          target: WorkflowState.Synchronize_Data
        },
        [WorkflowAction.Take_Back]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: WorkflowState.Synchronize_Data
        }
      }
    },
    [WorkflowState.Product_Build]: {
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
        [WorkflowAction.Build_Successful]: [
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                productType: { is: ProductType.Android_GooglePlay }
              }
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment.googlePlayUploaded,
            target: WorkflowState.App_Store_Preview
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting ||
              context.environment.googlePlayUploaded,
            target: WorkflowState.Verify_and_Publish
          }
        ],
        [WorkflowAction.Build_Failed]: {
          meta: { type: ActionType.Auto },
          target: WorkflowState.Synchronize_Data
        }
      }
    },
    [WorkflowState.App_Store_Preview]: {
      meta: {
        includeWhen: {
          productType: { is: ProductType.Android_GooglePlay }
        }
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
        [WorkflowAction.Approve]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: {
                  has: WorkflowOptions.AdminStoreAccess
                }
              }
            },
            target: WorkflowState.Create_App_Store_Entry
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                options: { none: new Set([WorkflowOptions.AdminStoreAccess]) }
              }
            },
            target: WorkflowState.Create_App_Store_Entry
          }
        ],
        [WorkflowAction.Reject]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: { has: WorkflowOptions.AdminStoreAccess }
              }
            },
            target: WorkflowState.Synchronize_Data
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                options: { none: new Set([WorkflowOptions.AdminStoreAccess]) }
              }
            },
            target: WorkflowState.Synchronize_Data
          }
        ]
      }
    },
    [WorkflowState.Create_App_Store_Entry]: {
      meta: {
        includeWhen: {
          productType: { is: ProductType.Android_GooglePlay }
        }
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
        [WorkflowAction.Continue]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: { has: WorkflowOptions.AdminStoreAccess }
              }
            },
            actions: assign({
              environment: ({ context }) => {
                context.environment.googlePlayUploaded = true;
                return context.environment;
              }
            }),
            target: WorkflowState.Verify_and_Publish
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                options: { none: new Set([WorkflowOptions.AdminStoreAccess]) }
              }
            },
            actions: assign({
              environment: ({ context }) => {
                context.environment.googlePlayUploaded = true;
                return context.environment;
              }
            }),
            target: WorkflowState.Verify_and_Publish
          }
        ],
        [WorkflowAction.Reject]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: { has: WorkflowOptions.AdminStoreAccess }
              }
            },
            target: WorkflowState.Synchronize_Data
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                options: { none: new Set([WorkflowOptions.AdminStoreAccess]) }
              }
            },
            target: WorkflowState.Synchronize_Data
          }
        ]
      }
    },
    [WorkflowState.Verify_and_Publish]: {
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
        [WorkflowAction.Approve]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: WorkflowState.Product_Publish
        },
        [WorkflowAction.Reject]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder
          },
          target: WorkflowState.Synchronize_Data
        },
        [WorkflowAction.Email_Reviewers]: {
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
    [WorkflowState.Product_Publish]: {
      entry: [
        assign({ instructions: 'waiting' }),
        () => {
          // TODO: hook into build engine
          console.log('Publishing Product');
        }
      ],
      on: {
        [WorkflowAction.Publish_Completed]: [
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                productType: { is: ProductType.Android_GooglePlay }
              }
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment.googlePlayExisting,
            target: WorkflowState.Make_It_Live
          },
          {
            meta: { type: ActionType.Auto },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment.googlePlayExisting,
            target: WorkflowState.Published
          }
        ],
        [WorkflowAction.Publish_Failed]: {
          meta: { type: ActionType.Auto },
          target: WorkflowState.Synchronize_Data
        }
      }
    },
    [WorkflowState.Make_It_Live]: {
      meta: {
        includeWhen: {
          productType: { is: ProductType.Android_GooglePlay }
        }
      },
      entry: assign({
        instructions: 'make_it_live',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      on: {
        [WorkflowAction.Continue]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: { has: WorkflowOptions.AdminStoreAccess }
              }
            },
            target: WorkflowState.Published
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                options: { none: new Set([WorkflowOptions.AdminStoreAccess]) }
              }
            },
            target: WorkflowState.Published
          }
        ],
        [WorkflowAction.Reject]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: { has: WorkflowOptions.AdminStoreAccess }
              }
            },
            target: WorkflowState.Synchronize_Data
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                options: { none: new Set([WorkflowOptions.AdminStoreAccess]) }
              }
            },
            target: WorkflowState.Synchronize_Data
          }
        ]
      }
    },
    [WorkflowState.Published]: {
      entry: assign({
        instructions: null,
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      type: 'final'
    }
  },
  on: {
    [WorkflowAction.Jump]: {
      actions: [
        assign({
          start: ({ context, event }) => event.target
        })
      ],
      target: `.${WorkflowState.Start}`
    }
  }
});
