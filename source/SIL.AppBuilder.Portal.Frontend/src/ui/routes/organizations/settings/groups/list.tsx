import * as React from 'react';
import * as toast from '@lib/toast';
import { compose } from 'recompose';
import CloseIcon from '@material-ui/icons/Close';
import { withTranslations, i18nProps } from '@lib/i18n';
import { IProvidedProps } from '@data/containers/resources/group/with-data-actions';
import { GroupResource, attributesFor } from '@data';
import { isEmpty } from '@lib/collection';

interface IOwnProps {
  groups: GroupResource[];
  setGroupToEdit: (group: GroupResource) => void;
}

type IProps = IOwnProps & IProvidedProps & i18nProps;

class List extends React.Component<IProps> {
  remove = (group) => (e) => {
    e.preventDefault();
    const { removeRecord, t } = this.props;
    try {
      removeRecord(group);
      toast.success(t('org.groupDeleted'));
    } catch (e) {
      toast.error(e);
    }
  };

  edit = (group) => (e) => {
    e.preventDefault();
    const { setGroupToEdit } = this.props;
    setGroupToEdit(group);
  };

  render() {
    const { t, groups } = this.props;

    if (isEmpty(groups)) {
      return (
        <p data-test-org-groups-empty className='gray-text m-t-lg p-b-lg'>
          {t('org.noGroups')}
        </p>
      );
    }

    return (
      <div className='m-t-lg'>
        {groups.map((group, index) => (
          <div
            key={group.id}
            className='
                flex align-items-center
                justify-content-space-between
                w-100-xs-only flex-100 m-b-sm
                round-border-4 light-gray-text
                pointer thin-border p-sm'
          >
            <div
              data-test-org-edit-group-button
              onClick={this.edit(group)}
              title={t('common.clickToEdit')}
            >
              {attributesFor(group).name}
            </div>
            <div
              data-test-org-delete-button
              className='flex align-items-center'
              onClick={this.remove(group)}
            >
              <CloseIcon />
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default compose(withTranslations)(List);
