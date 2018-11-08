import * as React from 'react';
import { compose } from 'recompose';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Dropdown } from 'semantic-ui-react';
import { withTranslations, i18nProps } from '@lib/i18n';

class ItemActions extends React.Component<i18nProps> {

  render() {

    const { t } = this.props;

    return (
      <Dropdown
        pointing='top right'
        icon={null}
        trigger={
          <MoreVerticalIcon />
        }
        className='line-height-0'
      >
        <Dropdown.Menu>
          <Dropdown.Item className='capitalize' text={t('project.products.rebuild')} />
          <Dropdown.Item className='capitalize' text={t('project.products.options.update')} />
          <Dropdown.Item className='capitalize' text={t('project.products.options.publish')} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

}

export default compose(
  withTranslations
)(ItemActions);