import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

import { ISortProps } from '@data/containers/api/sorting';

import ColumnSelector from './column-selector';
import { IProvidedProps } from '../with-table-columns';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps
  & IProvidedProps
  & ISortProps;

class Header extends React.Component<IProps> {

  render() {

    const {
      t,
      activeProjectColumns
    } = this.props;

    return (
      <div className='flex header grid'>
        <div className='flex justify-content-space-evenly flex-grow-xs'>
          <div className='col flex-grow-xs flex-100'>Project</div>

          { activeProjectColumns.map((column, i) => (
            <div key={i} data-test-project-table-column className={'col flex-100'}>
              {t(column.i18nKey)}
            </div>
          ))}

        </div>
        <div className='action'>
          <ColumnSelector {...this.props} />
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(Header);
