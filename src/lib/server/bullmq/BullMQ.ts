import * as Workers from './BullWorker';
import { building } from '$app/environment';

export const allWorkers = building
  ? []
  : [
      new Workers.Builds(),
      new Workers.SystemRecurring(),
      new Workers.SystemStartup(),
      new Workers.Products(),
      new Workers.Projects(),
      new Workers.Publishing(),
      new Workers.RemotePolling(),
      new Workers.UserTasks(),
      new Workers.Emails(),
      new Workers.SvelteSSE()
    ];
