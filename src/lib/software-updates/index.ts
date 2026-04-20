import { SpanStatusCode, trace } from '@opentelemetry/api';
import { DatabaseReads } from '$lib/server/database';
import { filterAdminOrgs } from '$lib/utils/roles';

const tracer = trace.getTracer('SoftwareUpdatesSSE');

export interface RebuildItem {
  Id: number;
  InitiatedBy: string | null;
  Comment: string;
  DateCreated: Date | null;
  DateCompleted: Date | null;
  Organizations: string[];
  OrganizationIds: number[];
  Projects: {
    Id: number;
    Name: string;
  }[];
  _count: {
    Products: number;
    Projects: number;
  };
}
export type RebuildsTable = {
  complete: RebuildItem[];
  incomplete: RebuildItem[];
};

