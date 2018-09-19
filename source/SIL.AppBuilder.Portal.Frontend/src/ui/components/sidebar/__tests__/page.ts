
import {
  interactor, isPresent, isHidden, hasClass
} from '@bigtest/interactor';

@interactor
export class SidebarInteractor {
  constructor(selector?: string) { }

  isSidebarVisible = isPresent('.is-sidebar-visible [data-test-sidebar]');
  isCloseButtonVisible = isHidden('[data-test-sidebar-close-button]');
  isCloseButtonVisibleInResponsive = hasClass('[data-test-sidebar-close-button]','d-sm-none')
}

export default new SidebarInteractor('[data-test-app-container]');
