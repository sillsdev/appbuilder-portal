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
    TypeId: number;
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
