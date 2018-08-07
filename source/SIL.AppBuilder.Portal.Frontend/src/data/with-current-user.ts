import { withCurrentUser as container } from './containers/with-current-user';


export function withCurrentUser() {
  console.warn(`
    [DEPRECATED]: use withCurrentUser from @data/containers/with-current-user
  `);

  return container();
}
