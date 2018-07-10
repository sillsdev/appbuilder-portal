
import {
  interactor,
  clickable, isVisible
} from '@bigtest/interactor';

@interactor
export class SidebarInteractor {
  constructor(selector?: string) { }

  clickOpenSidebarButton = clickable('[data-test-header-sidebar-button]');
  clickCloseSidebarButton = clickable('[data-test-sidebar-close-button]');

  isSidebarVisible = isVisible('[data-test-sidebar]');
}

export default new SidebarInteractor();