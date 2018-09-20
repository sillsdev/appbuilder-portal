import * as React from 'react';
import { compose } from 'recompose';
import { withTranslations, i18nProps } from '@lib/i18n';

import Column from './column';
import ColumnSelector from './column-selector';
import { IProvidedProps } from './withTableColumns';

interface IOwnProps {}

type IProps =
  & IOwnProps
  & i18nProps
  & IProvidedProps;

class Header extends React.Component<IProps> {

  render() {

    const {
      t,
      columns,
      isInSelectedColumns,
      updateColumnSelection,
      columnWidth
    } = this.props;

    const columnSelectorProps = {
      columns,
      isInSelectedColumns,
      updateColumnSelection
    };

    const columnStyle = {
      width: `${columnWidth()}%`
    };

    return (
      <div className='flex header grid'>
        <div className='flex justify-content-space-evenly flex-grow-xs'>
          <div className='col flex-grow-xs' style={columnStyle}>Project</div>
          <Column
            value={t('projectTable.columns.owner')}
            display={isInSelectedColumns('owner')}
            style={columnStyle}
          />
          <Column
            value={t('projectTable.columns.organization')}
            display={isInSelectedColumns('organization')}
            style={columnStyle}
          />
          <Column
            value={t('projectTable.columns.language')}
            display={isInSelectedColumns('language')}
            style={columnStyle}
          />
          <Column
            value={t('projectTable.columns.group')}
            display={isInSelectedColumns('group')}
            style={columnStyle}
          />
        </div>
        <div className='action d-xs-none d-md-block'>
          <ColumnSelector {...columnSelectorProps} />
        </div>
      </div>
    );
  }
}

export default compose(
  withTranslations
)(Header);
