
import {
  interactor,
  clickable, isPresent
} from '@bigtest/interactor';

@interactor
export class SidebarInteractor {
  constructor(selector?: string) { }

  clickOpenSidebarButton = clickable('[data-test-header-sidebar-button]');
  clickCloseSidebarButton = clickable('[data-test-sidebar-close-button]');

  isSidebarVisible = isPresent('.is-sidebar-visible [data-test-sidebar]');
}

export default new SidebarInteractor();
