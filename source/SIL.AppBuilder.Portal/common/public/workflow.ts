import { setup, assign } from 'xstate';

//later: update snapshot on state exits (define a function to do it), store instance id in context
//later: update UserTasks on entry?
export const NoAdminS3 = setup({
  types: {
    context: {} as {
      //later: narrow types if necessary
      instructions: string;
      includeFields: string[];
      includeReviewers: boolean;
      includeArtifacts: string | boolean;
      start?: string;
    },
    input: {} as {
      start?: string;
    }
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
    start: input.start
  }),
  states: {
    Start: {
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
          guard: ({ context }) => context.start === 'Verify And Publish',
          target: 'Verify And Publish'
        },
        {
          guard: ({ context }) => context.start === 'Publish Product',
          target: 'Publish Product'
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
        'Default.Auto': {
          target: 'Product Creation'
        }
      }
    },
    'Product Creation': {
      entry: [
        assign({ instructions: 'waiting' }),
        () => {
          //later: hook into build engine
          console.log('Creating Product');
        }
      ],
      on: {
        'Product Created.Auto': {
          target: 'App Builder Configuration'
        }
      }
    },
    'App Builder Configuration': {
      entry: assign({
        instructions: 'app_configuration',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL']
      }),
      on: {
        'Continue.Owner': {
          target: 'Product Build'
        },
        'Send to Authors.Owner': {
          //later: guard project has authors
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
        'Continue.Author': {
          target: 'App Builder Configuration'
        },
        'Take Back.Owner': {
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
        'Continue.Owner': {
          target: 'Product Build'
        },
        'Transfer to Authors.Owner': {
          //later: guard project has authors
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
        'Continue.Author': {
          target: 'Author Upload'
        },
        'Take Back.Owner': {
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
        'Continue.Author': {
          target: 'Synchronize Data'
        },
        'Take Back.Owner': {
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
        () => {
          console.log('Building Product');
        }
      ],
      on: {
        'Build Successful.Auto': {
          target: 'Verify And Publish'
        },
        'Build Failed.Auto': {
          target: 'Synchronize Data'
        }
      }
    },
    'Verify And Publish': {
      entry: assign({
        instructions: 'verify_and_publish',
        includeFields: ['storeDescription', 'listingLanguageCode', 'projectURL'],
        includeReviewers: true,
        includeArtifacts: true
      }),
      exit: assign({
        includeReviewers: false,
        includeArtifacts: false
      }),
      on: {
        'Reject.Owner': {
          target: 'Synchronize Data'
        },
        'Approve.Owner': {
          target: 'Publish Product'
        },
        'Email Reviewers.Owner': {
          //later: guard project has reviewers
          target: 'Email Reviewers'
        }
      }
    },
    'Email Reviewers': {
      //later: connect to backend to email reviewers
      entry: () => {
        console.log('Emailing Reviewers');
      },
      on: {
        'Default.Auto': {
          target: 'Verify And Publish'
        }
      }
    },
    'Publish Product': {
      entry: [
        assign({ instructions: 'waiting' }),
        () => {
          console.log('Publishing Product');
        }
      ],
      on: {
        'Publish Completed.Auto': {
          target: 'Published'
        },
        'Publish Failed.Auto': {
          target: 'Synchronize Data'
        }
      }
    },
    Published: {
      entry: assign({
        instructions: '',
        includeFields: ['storeDescription', 'listingLanguageCode']
      }),
      type: 'final'
    }
  },
  on: {
    jump: {
      actions: assign({
        start: ({ event }) => event.target
      }),
      target: '.Start'
    }
  }
});