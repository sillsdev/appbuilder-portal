import * as React from 'react';
import { compose } from 'recompose';
import CloseIcon from '@material-ui/icons/Close';

import { withTranslations, i18nProps } from '@lib/i18n';
import { IProvidedProps } from '@data/containers/resources/group/with-data-actions';
import { GroupResource, attributesFor } from '@data';
import { isEmpty } from '@lib/collection';


interface IOwnProps {
  groups: GroupResource[];
}

type IProps =
  & IOwnProps
  & IProvidedProps
  & i18nProps;

class List extends React.Component<IProps> {

  remove = group => (e) => {
    e.preventDefault();
    const { removeRecord } = this.props;
    removeRecord(group);
  }

  render() {

    const { t, groups } = this.props;

    if (isEmpty(groups)) {
      return <p className='gray-text p-b-lg'>{t('org.noGroups')}</p>;
    }

    return (
      <div className='m-t-lg'>
        {
          groups.map((group,index) =>
            <div
              key={index}
              className='
                col flex align-items-center
                justify-content-space-between
                w-100-xs-only flex-100 m-b-sm
                multi-select-item'
            >
              {attributesFor(group).name}
              <div
                className='flex align-items-center'
                onClick={this.remove(group)}
              >
                <CloseIcon/>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default compose(
  withTranslations
)(List);
