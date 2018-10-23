import * as React from 'react';
import MoreVerticalIcon from '@material-ui/icons/MoreVert';
import { Dropdown } from 'semantic-ui-react';

class ItemActions extends React.Component {

  render() {
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
          <Dropdown.Item text='Update' />
          <Dropdown.Item text='Publish' />
          <Dropdown.Item text='Copy Source URL' />
          <Dropdown.Item text='Download' />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

}

export default ItemActions;