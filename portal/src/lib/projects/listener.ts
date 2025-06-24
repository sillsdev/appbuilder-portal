// Create a new bullmq listener for project updates
import { Worker } from 'bullmq';
import EventEmitter from 'events';
import { BullMQ, Queues } from 'sil.appbuilder.portal.common';

export const ProjectPageUpdate = new EventEmitter<{
  update: [number];
}>();

// Create a worker to listen for project updates
new Worker(
  BullMQ.QueueName.SvelteProjectSSE,
  async (job) => {
    // Trigger an event for the project id
    ProjectPageUpdate.emit('update', job.data);
  },
  Queues.config
);
