// Create a new bullmq listener for project updates
import EventEmitter from 'events';

export type SSEPageEvents = {
  projectPage: [number[]];
  projectGroups: [number[]];
  projectOrg: [number[]];
  userTasksPage: [number[]];
};

export const SSEPageUpdates = new EventEmitter<SSEPageEvents>().setMaxListeners(400);
// Allow 400 listeners (in the last 10 seconds)
// >400 instances viewing a project page or the user tasks page simultaneously
// seems unlikely. If it does happen, we can increase this limit
