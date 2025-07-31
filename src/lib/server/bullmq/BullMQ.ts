import * as Workers from './BullWorker';

export const allWorkers = [
  new Workers.Builds(),
  new Workers.SystemRecurring(),
  new Workers.SystemStartup(),
  new Workers.Miscellaneous(),
  new Workers.Publishing(),
  new Workers.RemotePolling(),
  new Workers.UserTasks(),
  new Workers.Emails(),
  new Workers.SvelteSSE()
];
