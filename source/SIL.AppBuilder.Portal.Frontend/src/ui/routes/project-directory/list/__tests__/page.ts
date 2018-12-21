import {
  interactor,
  Interactor,
  text,
  isPresent
} from '@bigtest/interactor';

import orgSelectInteractor from '@ui/components/inputs/organization-select/__tests__/page';
import tableInteractor from '@ui/components/project-table/__tests__/page';

class Directory {
  header = text('[data-test-directory-header]');

  orgSelect = orgSelectInteractor;
  table = tableInteractor;
  isLoading = isPresent('.loading-overlay');
}

export const DirectoryInteractor = interactor(Directory);
export type TDirectoryInteractor = Directory & Interactor;

export default new (DirectoryInteractor as any)('[data-test-project-directory]') as TDirectoryInteractor;
