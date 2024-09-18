import { setup, assign } from 'xstate';
import DatabaseWrites from '../databaseProxy/index.js';
import { WorkflowContext, WorkflowInput } from '../public/workflow.js';
import { createSnapshot, updateUserTasks, updateProductTransitions } from './db.js';
import { RoleId } from '../public/prisma.js';

//later: update snapshot on state exits (define a function to do it), store instance id in context
//later: update UserTasks on entry?
export const NoAdminS3 = setup({
  types: {
    context: {} as WorkflowContext,
    input: {} as WorkflowInput
  }
}).createMachine({
  initial: 'Start',
  context: ({ input }) => ({
    instructions: 'waiting',
    /** projectName and projectDescription are always included */
    includeFields: [],
    /** Reset to false on exit */
    includeReviewers: false,
    /** Reset to false on exit */
    includeArtifacts: false,
    productId: input.productId
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
          guard: ({ context }) => context.start === 'App Builder Configuration',
          target: 'App Builder Configuration'
        },
        {
          guard: ({ context }) => context.start === 'Author Configuration',
          //later: guard project has authors
          target: 'Author Configuration'
        },
        {
          guard: ({ context }) => context.start === 'Synchronize Data',
          target: 'Synchronize Data'
        },
        {
          //later: guard project has authors
          guard: ({ context }) => context.start === 'Author Download',
          target: 'Author Download'
        },
        {
          //later: guard project has authors
          //note: authors can upload at any time, this state is just to prompt an upload
          guard: ({ context }) => context.start === 'Author Upload',
          target: 'Author Upload'
        },
        {
          guard: ({ context }) => context.start === 'Product Build',
          target: 'Product Build'
        },
        {
          guard: ({ context }) => context.start === 'Verify and Publish',
          target: 'Verify and Publish'
        },
        {
          guard: ({ context }) => context.start === 'Product Publish',
          target: 'Product Publish'
        },
        {
          guard: ({ context }) => context.start === 'Published',
          target: 'Published'
        },
        {
          target: 'Product Creation'
        }
      ],
      on: {
        // this is here just so the default start transition shows up in the visualizer
        'Default:Auto': {
          target: 'Product Creation'
        }
      }
    },
    'Product Creation': {
      entry: [
        assign({ instructions: 'waiting' }),
        ({ context }) => {
          createSnapshot('Product Creation', context);
          //later: hook into build engine
          console.log('Creating Product');
          updateUserTasks(context.productId, [], '');
        }
      ],
      on: {
        'Product Created:Auto': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Product Creation',
              'App Builder Configuration',
              null,
              event.comment
            );
          },
          target: 'App Builder Configuration'
        }
      }
    },
    'App Builder Configuration': {
      entry: [
        assign({
          instructions: 'app_configuration',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
        }),
        ({ context, event }) => {
          createSnapshot('App Builder Configuration', context);
          updateUserTasks(
            context.productId,
            [RoleId.AppBuilder],
            'App Builder Configuration',
            event.comment
          );
        }
      ],
      on: {
        'Continue:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'App Builder Configuration',
              'Product Build',
              'Continue',
              event.comment
            );
          },
          target: 'Product Build'
        },
        'Transfer to Authors:Owner': {
          actions: ({ context, event }) => {
            console.log('Transferring to Authors');
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'App Builder Configuration',
              'Author Configuration',
              'Transfer to Authors',
              event.comment
            );
          },
          //later: guard project has authors
          target: 'Author Configuration'
        }
      }
    },
    'Author Configuration': {
      entry: [
        assign({
          instructions: 'app_configuration',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
        }),
        ({ context, event }) => {
          createSnapshot('Author Configuration', context);
          updateUserTasks(
            context.productId,
            [RoleId.AppBuilder, RoleId.Author],
            'Author Configuration',
            event.comment
          );
        }
      ],
      on: {
        'Continue:Author': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Author Configuration',
              'App Builder Configuration',
              'Continue',
              event.comment
            );
          },
          target: 'App Builder Configuration'
        },
        'Take Back:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Author Configuration',
              'App Builder Configuration',
              'Take Back',
              event.comment
            );
          },
          target: 'App Builder Configuration'
        }
      }
    },
    'Synchronize Data': {
      entry: [
        assign({
          instructions: 'synchronize_data',
          includeFields: ['storeDescription', 'listingLanguageCode']
        }),
        ({ context, event }) => {
          createSnapshot('Synchronize Data', context);
          updateUserTasks(
            context.productId,
            [RoleId.AppBuilder],
            'Synchronize Data',
            event.comment
          );
        }
      ],
      on: {
        'Continue:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Synchronize Data',
              'Product Build',
              'Continue',
              event.comment
            );
          },
          target: 'Product Build'
        },
        'Transfer to Authors:Owner': {
          //later: guard project has authors
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Synchronize Data',
              'Author Download',
              'Transfer to Authors',
              event.comment
            );
          },
          target: 'Author Download'
        }
      }
    },
    'Author Download': {
      entry: [
        assign({
          instructions: 'authors_download',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
        }),
        ({ context, event }) => {
          createSnapshot('Author Download', context);
          updateUserTasks(
            context.productId,
            [RoleId.AppBuilder, RoleId.Author],
            'Author Download',
            event.comment
          );
        }
      ],
      on: {
        'Continue:Author': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Author Download',
              'Author Upload',
              'Continue',
              event.comment
            );
          },
          target: 'Author Upload'
        },
        'Take Back:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Author Download',
              'Synchronize Data',
              'Take Back',
              event.comment
            );
          },
          target: 'Synchronize Data'
        }
      }
    },
    'Author Upload': {
      entry: [
        assign({
          instructions: 'authors_upload',
          includeFields: ['storeDescription', 'listingLanguageCode']
        }),
        ({ context, event }) => {
          createSnapshot('Author Upload', context);
          updateUserTasks(
            context.productId,
            [RoleId.AppBuilder, RoleId.Author],
            'Author Upload',
            event.comment
          );
        }
      ],
      on: {
        'Continue:Author': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Author Upload',
              'Synchronize Data',
              'Continue',
              event.comment
            );
          },
          target: 'Synchronize Data'
        },
        'Take Back:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Author Upload',
              'Synchronize Data',
              'Take Back',
              event.comment
            );
          },
          target: 'Synchronize Data'
        }
      }
    },
    'Product Build': {
      entry: [
        //later: connect to backend to build product
        assign({
          instructions: 'waiting'
        }),
        ({ context }) => {
          createSnapshot('Product Build', context);
          updateUserTasks(context.productId, [], '');
        },
        () => {
          console.log('Building Product');
        }
      ],
      on: {
        'Build Successful:Auto': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Product Build',
              'Verify and Publish',
              null,
              event.comment
            );
          },
          target: 'Verify and Publish'
        },
        'Build Failed:Auto': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Product Build',
              'Synchronize Data',
              null,
              event.comment
            );
          },
          target: 'Synchronize Data'
        }
      }
    },
    'Verify and Publish': {
      entry: [
        assign({
          instructions: 'verify_and_publish',
          includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL'],
          includeReviewers: true,
          includeArtifacts: true
        }),
        ({ context, event }) => {
          createSnapshot('Verify and Publish', context);
          updateUserTasks(
            context.productId,
            [RoleId.AppBuilder],
            'Verify and Publish',
            event.comment
          );
        }
      ],
      exit: assign({
        includeReviewers: false,
        includeArtifacts: false
      }),
      on: {
        'Approve:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Verify and Publish',
              'Publish Product',
              'Approve',
              event.comment
            );
          },
          target: 'Product Publish'
        },
        'Reject:Owner': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Verify and Publish',
              'Synchronize Data',
              'Reject',
              event.comment
            );
          },
          target: 'Synchronize Data'
        },
        'Email Reviewers:Owner': {
          //later: guard project has reviewers
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Verify and Publish',
              'Email Reviewers',
              'Email Reviewers',
              event.comment
            );
          },
          target: 'Email Reviewers'
        }
      }
    },
    'Email Reviewers': {
      //later: connect to backend to email reviewers
      entry: [
        () => {
          console.log('Emailing Reviewers');
        },
        ({ context, event }) => {
          createSnapshot('Email Reviewers', context);
          updateUserTasks(context.productId, [], '');
        }
      ],
      on: {
        'Default:Auto': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Email Reviewers',
              'Verify and Publish',
              null,
              event.comment
            );
          },
          target: 'Verify and Publish'
        }
      }
    },
    'Product Publish': {
      entry: [
        assign({ instructions: 'waiting' }),
        ({ context }) => {
          createSnapshot('Publish Product', context);
          updateUserTasks(context.productId, [], '');
        },
        () => {
          console.log('Publishing Product');
        }
      ],
      on: {
        'Publish Completed:Auto': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Product Publish',
              'Published',
              null,
              event.comment
            );
          },
          target: 'Published'
        },
        'Publish Failed:Auto': {
          actions: ({ context, event }) => {
            updateProductTransitions(
              NoAdminS3,
              context.productId,
              event.userId,
              'Product Publish',
              'Synchronize Data',
              null,
              event.comment
            );
          },
          target: 'Synchronize Data'
        }
      }
    },
    Published: {
      entry: [
        assign({
          instructions: '',
          includeFields: ['storeDescription', 'listingLanguageCode']
        }),
        ({ context }) => {
          createSnapshot('Published', context);
          updateUserTasks(context.productId, [], '');
        }
      ],
      type: 'final'
    }
  },
  on: {
    'Jump To': {
      actions: [
        assign({
          start: ({ event }) => event.target
        }),
        ({ context, event }) => {
          updateProductTransitions(
            NoAdminS3,
            context.productId,
            null,
            event.previous,
            event.target,
            null,
            event.comment
          );
        }
      ],
      target: '.Start'
    }
  }
});
