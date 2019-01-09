import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown } from 'semantic-ui-react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { withData as withOrbit } from 'react-orbitjs';
import { ROLE } from '@data/models/role';
import { RequireRole } from '@ui/components/authorization';

import { attributesFor, ProjectResource, UserResource } from '@data';
import { withProjectOperations } from '@ui/routes/projects/show/with-project-operations';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  project: ProjectResource;
  owner: UserResource;
  toggleArchiveProject: () => void;
}

type IProps =
  & IOwnProps
  & i18nProps;

class RowActions extends React.Component<IProps> {

  overrideIf = ({ owner, currentUser }) => {
    return owner.id === currentUser.id;
  }

  render() {

    const { t, toggleArchiveProject, project, owner } = this.props;
    const { dateArchived } = attributesFor(project);

    const dropdownItemText = !dateArchived ?
      t('project.dropdown.archive') :
      t('project.dropdown.reactivate');

    const requireRoleProps = {
      roleName: ROLE.OrganizationAdmin,
      owner,
      overrideIf: this.overrideIf
    };

    return (
      <Dropdown
        className='project-actions'
        pointing='top right'
        data-test-row-actions
        icon={null}
        trigger={<MoreVerticalIcon />}
      >
        <Dropdown.Menu>
          <Dropdown.Item
            text={t('project.dropdown.build')}
          />
          <RequireRole {...requireRoleProps}>
            <Dropdown.Item
              text={dropdownItemText}
              onClick={toggleArchiveProject}
            />
          </RequireRole>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default compose(
  withTranslations,
  withOrbit(({project}) => ({
    owner: q => q.findRelatedRecord(project,'owner')
  })),
  withProjectOperations
)(RowActions);
