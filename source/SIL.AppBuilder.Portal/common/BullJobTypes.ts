export enum ScriptoriaJobType {
  // Test
  Test = 'Test',
  // UserTasks
  UserTasks_Reassign = 'Reassign UserTasks'
}

export namespace UserTasks {
  export type Reassign = {
    type: ScriptoriaJobType.UserTasks_Reassign;
    projectId: number;
  };
}

export interface Test {
  type: ScriptoriaJobType.Test;
  time: number;
}

export type ScriptoriaJob = JobTypeMap[keyof JobTypeMap];

export type JobTypeMap = {
  [ScriptoriaJobType.Test]: Test;
  [ScriptoriaJobType.UserTasks_Reassign]: UserTasks.Reassign;
  // Add more mappings here as needed
};
