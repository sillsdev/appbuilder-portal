import { setup, assign } from 'xstate';

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
          guard: ({context}) => context.start === 'Synchronize Data',
          target: 'Synchronize Data'
        },
        {
          guard: ({context}) => context.start === 'Product Build',
          target: 'Product Build'
        },
        {
          guard: ({context}) => context.start === 'Verify And Publish',
          target: 'Verify And Publish'
        },
        {
          guard: ({context}) => context.start === 'Published',
          target: 'Published'
        },
        {
          target: 'App Builder Configuration'
        }
      ],
      on: {
        Default: {
          target: 'App Builder Configuration'
        }
      }
    },
    'App Builder Configuration': {
      entry: assign({
        instructions: 'app_configuration',
        includeFields: [
          'storeDescription',
          'listingLanguageCode',
          'projectURL'
        ]
      }),
      on: {
        Continue: {
          target: 'Product Build'
        }
      }
    },
    'Synchronize Data': {
      entry: assign({
        instructions: 'synchronize_data',
        includeFields: [
          'storeDescription',
          'listingLanguageCode'
        ]
      }),
      on: {
        Continue: {
          target: 'Product Build'
        }
      }
    },
    'Product Build': {
      entry: assign({
        instructions: 'waiting'
      }),
      on: {
        'Build Successful': {
          target: 'Verify And Publish'
        }
      }
    },
    'Verify And Publish': {
      entry: assign({
        instructions: 'verify_and_publish',
        includeFields: [
          'storeDescription',
          'listingLanguageCode',
          'projectURL'
        ],
        includeReviewers: true,
        includeArtifacts: true
      }),
      exit: assign({
        includeReviewers: false,
        includeArtifacts: false
      }),
      on: {
        Reject: {
          target: 'Synchronize Data'
        },
        Approve: {
          target: 'Published'
        }
      }
    },
    Published: {
      entry: assign({
        instructions: '',
        includeFields: [
          'storeDescription',
          'listingLanguageCode'
        ]
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
