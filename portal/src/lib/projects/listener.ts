// Create a new bullmq listener for project updates
import EventEmitter from 'events';

export const ProjectPageUpdate = new EventEmitter<{
  update: [number[]];
}>().setMaxListeners(400);
// Allow 400 listeners (in the last 10 seconds)
// More than 200 people viewing a project page at the same time seems unlikely
// If it does happen, we can increase this limit
