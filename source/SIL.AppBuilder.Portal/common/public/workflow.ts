import { createMachine } from "xstate";


export const NoAdminS3 = createMachine({
  initial: 'App Builder Configuration',
  states: {
    'App Builder Configuration': {
      on: {
        'Continue': {
          target: 'Product Build'
        }
      }
    },
    'Synchronize Data': {
      on: {
        'Continue': {
          target: 'Product Build'
        }
      }
    },
    'Product Build': {
      on: {
        'Build Successful': {
          target: 'Verify And Publish'
        }
      }
    },
    'Verify And Publish': {
      on: {
        'Reject': {
          target: 'Synchronize Data'
        },
        'Approve': {
          target: 'Published'
        }
      }
    },
    Published: {
      type: 'final'
    }
  }
});
