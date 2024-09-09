import { createMachine } from "xstate";


export const NoAdminS3 = createMachine({
  initial: 'start',
  states: {
    AppBuilderConfiguration: {
      on: {
        'Continue': {
          target: 'ProductBuild'
        }
      }
    },
    SynchronizeData: {
      on: {
        'Continue': {
          target: 'ProductBuild'
        }
      }
    },
    ProductBuild: {
      on: {
        'BuildSuccessful': {
          target: 'VerifyAndPublish'
        }
      }
    },
    VerifyAndPublish: {
      on: {
        'Reject': {
          target: 'SynchronizeData'
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
