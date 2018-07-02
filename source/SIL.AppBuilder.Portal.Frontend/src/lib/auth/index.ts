import { withRouter } from 'react-router';

export function requireLogin(Component) {
  return (props) => {

    return Component;
  }
}
