import { assign, setup } from 'xstate';
import { RoleId, WorkflowType } from '../../prisma';
import type {
  WorkflowContext,
  WorkflowEvent,
  WorkflowInput,
  WorkflowStateMeta,
  WorkflowTransitionMeta
} from '../../workflowTypes';
import {
  ActionType,
  ENVKeys,
  ProductType,
  WorkflowAction,
  WorkflowOptions,
  WorkflowState,
  hasAuthors,
  hasReviewers,
  autoPublishOnRebuild,
  isAuthorState,
  isDeprecated,
  jump
} from '../../workflowTypes';
import { BullMQ, getQueues } from '../bullmq';
import { deleteWorkflow, markResolved, notifyAutoPublishOwner } from './dbProcedures';

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
export const WorkflowStateMachine = setup({
  types: {
    context: {} as WorkflowContext,
    input: {} as WorkflowInput,
    meta: {} as WorkflowStateMeta | WorkflowTransitionMeta,
    events: {} as WorkflowEvent
  }
}).createMachine({
  id: 'WorkflowDefinition',
  initial: WorkflowState.Start,
  context: ({ input }) => ({
    instructions: null,
    /** projectName and projectDescription are always included */
    includeFields: [],
    /** Reset to false on exit */
    includeReviewers: false,
    /** Reset to null on exit */
    includeArtifacts: null,
    environment: {},
    isAutomatic: input.isAutomatic,
    workflowType: input.workflowType,
    productType: input.productType,
    options: input.options,
    productId: input.productId,
    hasAuthors: input.hasAuthors,
    hasReviewers: input.hasReviewers,
    autoPublishOnRebuild: input.autoPublishOnRebuild
  }),
  states: {
    [WorkflowState.Start]: {
      always: [
        jump({
          target: WorkflowState.Approval,
          filter: {
            options: { has: WorkflowOptions.ApprovalProcess },
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({
          target: WorkflowState.Approval_Pending,
          filter: {
            options: { has: WorkflowOptions.ApprovalProcess },
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({
          target: WorkflowState.Terminated,
          filter: {
            options: { has: WorkflowOptions.ApprovalProcess },
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({
          target: WorkflowState.Product_Creation,
          filter: {
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({
          target: WorkflowState.App_Builder_Configuration,
          filter: {
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump(
          {
            target: WorkflowState.Author_Configuration,
            filter: {
              workflowType: { is: WorkflowType.Startup }
            }
          },
          [hasAuthors]
        ),
        jump({ target: WorkflowState.Synchronize_Data }),
        jump(
          {
            target: WorkflowState.Author_Download
          },
          [hasAuthors]
        ),
        //note: authors can upload at any time, this state is just to prompt an upload
        jump(
          {
            target: WorkflowState.Author_Upload
          },
          [hasAuthors]
        ),
        jump({ target: WorkflowState.Product_Build }),
        jump({
          target: WorkflowState.App_Store_Preview,
          filter: {
            productType: { is: ProductType.Android_GooglePlay },
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({
          target: WorkflowState.Create_App_Store_Entry,
          filter: {
            productType: { is: ProductType.Android_GooglePlay },
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({ target: WorkflowState.Verify_and_Publish }),
        jump({ target: WorkflowState.Product_Publish }),
        jump({
          target: WorkflowState.Evaluate_Error,
          filter: { productType: { is: ProductType.Android_GooglePlay } }
        }),
        jump({
          target: WorkflowState.Make_It_Live,
          filter: {
            productType: { is: ProductType.Android_GooglePlay },
            workflowType: { is: WorkflowType.Startup }
          }
        }),
        jump({ target: WorkflowState.Published }),
        {
          guard: ({ context }) =>
            context.options.has(WorkflowOptions.ApprovalProcess) &&
            context.workflowType === WorkflowType.Startup,
          target: WorkflowState.Approval
        },
        {
          guard: ({ context }) => context.workflowType === WorkflowType.Startup,
          target: WorkflowState.Product_Creation
        },
        {
          guard: ({ context }) => context.workflowType !== WorkflowType.Startup,
          target: WorkflowState.Product_Build
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
                options: { has: WorkflowOptions.ApprovalProcess },
                workflowType: { is: WorkflowType.Startup }
              }
            },
            target: WorkflowState.Approval
          },
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                workflowType: { is: WorkflowType.Startup }
              }
            },
            target: WorkflowState.Product_Creation
          },
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                workflowType: { not: WorkflowType.Startup }
              }
            },
            target: WorkflowState.Product_Build
          }
        ]
      }
    },
    [WorkflowState.Approval]: {
      meta: {
        includeWhen: {
          options: { has: WorkflowOptions.ApprovalProcess },
          workflowType: { is: WorkflowType.Startup }
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
          options: { has: WorkflowOptions.ApprovalProcess },
          workflowType: { is: WorkflowType.Startup }
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
          options: { has: WorkflowOptions.ApprovalProcess },
          workflowType: { is: WorkflowType.Startup }
        }
      },
      entry: ({ context }) => deleteWorkflow(context.productId),
      type: 'final'
    },
    [WorkflowState.Product_Creation]: {
      meta: {
        includeWhen: {
          workflowType: { is: WorkflowType.Startup }
        }
      },
      entry: [
        assign({ instructions: 'waiting' }),
        ({ context }) => {
          getQueues().Products.add(
            `Create Product #${context.productId}`,
            {
              type: BullMQ.JobType.Product_Create,
              productId: context.productId
            },
            BullMQ.Retry0f600
          );
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
      meta: {
        includeWhen: {
          workflowType: { is: WorkflowType.Startup }
        }
      },
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
            environment: ({ context }) => ({
              ...context.environment,
              [ENVKeys.GOOGLE_PLAY_EXISTING]: '1'
            })
          }),
          target: WorkflowState.Product_Build
        },
        [WorkflowAction.Transfer_to_Authors]: {
          meta: {
            type: ActionType.User,
            user: RoleId.AppBuilder,
            includeWhen: {
              guards: [hasAuthors]
            }
          },
          guard: hasAuthors,
          target: WorkflowState.Author_Configuration
        }
      }
    },
    [WorkflowState.Author_Configuration]: {
      meta: {
        includeWhen: {
          guards: [hasAuthors],
          workflowType: { is: WorkflowType.Startup }
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
              guards: [hasAuthors]
            }
          },
          guard: hasAuthors,
          target: WorkflowState.Author_Download
        }
      }
    },
    [WorkflowState.Author_Download]: {
      meta: {
        includeWhen: {
          guards: [hasAuthors]
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
          guards: [hasAuthors]
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
        ({ context }) => {
          getQueues().Builds.add(
            `Build Product #${context.productId}`,
            {
              type: BullMQ.JobType.Build_Product,
              productId: context.productId,
              defaultTargets:
                context.workflowType === WorkflowType.Republish
                  ? 'play-listing'
                  : context.productType === ProductType.Android_S3
                    ? 'apk'
                    : context.productType === ProductType.AssetPackage
                      ? 'asset-package'
                      : context.productType === ProductType.Web
                        ? 'html'
                        : //ProductType.Android_GooglePlay
                          //default
                          'apk play-listing',
              // extra env handled in getWorkflowParameters
              environment: context.environment
            },
            BullMQ.Retry0f600
          );
        }
      ],
      on: {
        [WorkflowAction.Build_Successful]: [
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                productType: { is: ProductType.Android_GooglePlay },
                workflowType: { is: WorkflowType.Startup }
              }
            },
            /*
             * This transition is valid iff:
             * The product type is google play AND
             * The workflow type is startup AND
             * The project has NOT been uploaded to google play
             */
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              context.workflowType === WorkflowType.Startup &&
              !context.environment[ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID],
            target: WorkflowState.App_Store_Preview
          },
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                guards: [autoPublishOnRebuild]
              }
            },
            guard: autoPublishOnRebuild,
            target: WorkflowState.Product_Publish
          },
          {
            // this is the normal transition for a successful build
            meta: { type: ActionType.Auto },
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
          productType: { is: ProductType.Android_GooglePlay },
          workflowType: { is: WorkflowType.Startup }
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
        includeArtifacts: 'all'
      }),
      exit: assign({ includeArtifacts: null }),
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
          productType: { is: ProductType.Android_GooglePlay },
          workflowType: { is: WorkflowType.Startup }
        }
      },
      entry: assign({
        instructions: 'create_app_entry',
        includeFields: ['storeDescription', 'listingLanguageCode'],
        includeArtifacts: 'latestAAB',
        environment: ({ context }) => ({
          ...context.environment,
          [ENVKeys.GOOGLE_PLAY_DRAFT]: '1'
        })
      }),
      exit: assign({ includeArtifacts: null }),
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
            actions: ({ context }) => {
              // Given that the Set Google Play Uploaded action in S1 require DB and BuildEngine queries, this is probably the best way to do this
              getQueues().Products.add(`Get VersionCode for Product #${context.productId}`, {
                type: BullMQ.JobType.Product_GetVersionCode,
                productId: context.productId
              });
            },
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
            actions: ({ context }) => {
              getQueues().Products.add(`Get VersionCode for Product #${context.productId}`, {
                type: BullMQ.JobType.Product_GetVersionCode,
                productId: context.productId
              });
            },
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
          includeArtifacts: ({ context }) => {
            switch (context.productType) {
              case ProductType.AssetPackage:
                return 'latestAssetPackage';
              default:
                return 'all';
            }
          }
        }),
        ({ context }) => {
          if (!context.isAutomatic) {
            return;
          }
          void getQueues().Emails.add(`Email reviewers for Product #${context.productId}`, {
            type: BullMQ.JobType.Email_SendNotificationToReviewers,
            productId: context.productId
          });
        }
      ],
      exit: assign({
        includeReviewers: false,
        includeArtifacts: null
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
            user: RoleId.AppBuilder,
            includeWhen: {
              guards: [hasReviewers]
            }
          },
          guard: hasReviewers,
          actions: ({ context }) => {
            getQueues().Emails.add(`Email reviewers for Product #${context.productId}`, {
              type: BullMQ.JobType.Email_SendNotificationToReviewers,
              productId: context.productId
            });
          }
        }
      }
    },
    [WorkflowState.Product_Publish]: {
      entry: [
        assign({ instructions: 'waiting' }),
        ({ context }) => {
          getQueues().Publishing.add(
            `Publish Product #${context.productId}`,
            {
              type: BullMQ.JobType.Publish_Product,
              productId: context.productId,
              defaultChannel: 'production', //default unless overriden by WorkflowDefinition.Properties or ProductDefinition.Properties
              defaultTargets:
                context.productType === ProductType.Android_GooglePlay
                  ? 'google-play'
                  : context.productType === ProductType.Web
                    ? 'rclone'
                    : //ProductType.Android_S3
                      //ProductType.AssetPackage
                      //default
                      's3-bucket',
              environment: context.environment
            },
            BullMQ.Retry0f600
          );
        }
      ],
      on: {
        [WorkflowAction.Publish_Completed]: [
          {
            meta: {
              type: ActionType.Auto,
              includeWhen: {
                productType: { is: ProductType.Android_GooglePlay },
                workflowType: { is: WorkflowType.Startup }
              }
            },
            actions: ({ context }) => {
              if (context.autoPublishOnRebuild && context.isAutomatic) {
                void notifyAutoPublishOwner(context.productId);
              }
            },
            guard: ({ context }) =>
              context.productType === ProductType.Android_GooglePlay &&
              !context.environment[ENVKeys.GOOGLE_PLAY_EXISTING] &&
              context.workflowType === WorkflowType.Startup,
            target: WorkflowState.Make_It_Live
          },
          {
            meta: { type: ActionType.Auto },
            actions: ({ context }) => {
              if (context.autoPublishOnRebuild && context.isAutomatic) {
                void notifyAutoPublishOwner(context.productId);
              }
            },
            guard: ({ context }) =>
              context.productType !== ProductType.Android_GooglePlay ||
              context.environment[ENVKeys.GOOGLE_PLAY_EXISTING] === '1',
            target: WorkflowState.Published
          }
        ],
        [WorkflowAction.Publish_Failed]: {
          meta: { type: ActionType.Auto },
          target: WorkflowState.Synchronize_Data
        },
        [WorkflowAction.Google_API_Error]: {
          meta: {
            type: ActionType.Auto,
            includeWhen: {
              productType: { is: ProductType.Android_GooglePlay }
            }
          },
          target: WorkflowState.Evaluate_Error
        }
      }
    },
    [WorkflowState.Evaluate_Error]: {
      meta: {
        includeWhen: {
          productType: { is: ProductType.Android_GooglePlay }
        }
      },
      entry: assign({
        instructions: 'evaluate_error',
        includeFields: ['storeDescription', 'listingLanguageCode'],
        includeArtifacts: 'error'
      }),
      exit: assign({ includeArtifacts: null }),
      on: {
        [WorkflowAction.Continue]: [
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                workflowType: { is: WorkflowType.Startup }
              }
            },
            actions: ({ context }) => markResolved(context.productId),
            guard: ({ context }) =>
              !context.environment[ENVKeys.GOOGLE_PLAY_EXISTING] &&
              context.workflowType === WorkflowType.Startup,
            target: WorkflowState.Make_It_Live
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.AppBuilder,
              includeWhen: {
                workflowType: { is: WorkflowType.Startup }
              }
            },
            actions: ({ context }) => markResolved(context.productId),
            guard: ({ context }) =>
              !context.environment[ENVKeys.GOOGLE_PLAY_EXISTING] &&
              context.workflowType === WorkflowType.Startup,
            target: WorkflowState.Make_It_Live
          },
          {
            meta: {
              type: ActionType.User,
              user: RoleId.OrgAdmin,
              includeWhen: {
                options: { has: WorkflowOptions.AdminStoreAccess }
              }
            },
            actions: ({ context }) => markResolved(context.productId),
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
            actions: ({ context }) => markResolved(context.productId),
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
    [WorkflowState.Make_It_Live]: {
      meta: {
        includeWhen: {
          productType: { is: ProductType.Android_GooglePlay },
          workflowType: { is: WorkflowType.Startup }
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
      entry: ({ context }) => deleteWorkflow(context.productId),
      type: 'final'
    }
  },
  on: {
    [WorkflowAction.Jump]: {
      actions: [
        assign({
          start: ({ event }) => event.target
        })
      ],
      target: `.${WorkflowState.Start}`
    },
    [WorkflowAction.Migrate]: {
      actions: [
        assign({
          start: ({ event, context }) => {
            if (isDeprecated(event.target)) {
              switch (event.target) {
                case 'Check Product Build':
                case 'Check Product Publish':
                  return WorkflowState.Synchronize_Data;
                case 'Set Google Play Existing':
                  return WorkflowState.Product_Build;
                case 'Set Google Play Uploaded':
                  return WorkflowState.Verify_and_Publish;
              }
            } else if (isAuthorState(event.target) && !context.hasAuthors) {
              switch (event.target) {
                case WorkflowState.Author_Configuration:
                  return WorkflowState.App_Builder_Configuration;
                case WorkflowState.Author_Download:
                case WorkflowState.Author_Upload:
                  return WorkflowState.Synchronize_Data;
              }
            } else {
              return event.target as WorkflowState;
            }
          },
          environment: ({ event, context }) =>
            isDeprecated(event.target) && event.target === 'Set Google Play Existing'
              ? { ...context.environment, [ENVKeys.GOOGLE_PLAY_EXISTING]: '1' }
              : context.environment
        }),
        ({ event, context }) => {
          if (isDeprecated(event.target) && event.target === 'Set Google Play Uploaded') {
            getQueues().Products.add(`Get VersionCode for Migrated Product #${context.productId}`, {
              type: BullMQ.JobType.Product_GetVersionCode,
              productId: context.productId
            });
          }
        }
      ],
      target: `.${WorkflowState.Start}`
    }
  }
});
