export enum ScriptoriaJobType {
  Test = 'Test',
  ReassignUserTasks = 'ReassignUserTasks'
}

export interface TestJob {
  type: ScriptoriaJobType.Test;
  time: number;
}

export interface SyncUserTasksJob {
  type: ScriptoriaJobType.ReassignUserTasks;
  projectId: number;
}

export type ScriptoriaJob = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [ScriptoriaJobType.Test]: TestJob;
  [ScriptoriaJobType.ReassignUserTasks]: SyncUserTasksJob;
  // Add more mappings here as needed
};
