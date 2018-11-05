import * as React from 'react';
import { i18nProps } from '@lib/i18n';
import CloseIcon from '@material-ui/icons/Close';

import { GroupResource, attributesFor } from '@data';
import { isEmpty } from '@lib/collection';

interface IOwnProps {
  groups: GroupResource[];
}

type IProps =
  & IOwnProps
  & i18nProps;

export default class ListDisplay extends React.Component<IProps> {

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
              <div className='flex align-items-center'>
                <CloseIcon/>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
