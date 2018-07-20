import * as React from 'react';
import { Dropdown, Checkbox } from 'semantic-ui-react';


export interface IProps {
  items: Array<{ id: string, value: string}>;
  selected: Array<{id: string, value: string}>;
}

export interface IState {
  items: Array<{ id: string, value: string }>;
  selected: Array<{ id: string, value: string }>;
}

class GroupDropdown extends React.Component<IProps, IState> {

  constructor(props) {
    super(props);

    this.state = {
      items: props.items,
      selected: props.selected
    }

  }


  selectedItems = () => {
    const { selected, items } = this.state;

    if (selected && selected.length == 0) {
      return '-';
    }

    if (selected.length == items.length ) {
      return 'ALL';
    }

    return selected.map(item => item.value).join(', ');
  }

  toggleSelection = (id) => {
    const itemSelected = this.state.items.filter(item => item.id === id)[0];

    if (!this.state.selected.includes(itemSelected)) {
      this.setState({
        selected: [...this.state.selected, itemSelected]
      });
    } else {
      this.setState({
        selected: this.state.selected.filter(item => item.id != itemSelected.id)
      });
    }
  }

  render() {

    return (
      <>
        <Dropdown
          multiple
          text={this.selectedItems()}
          className='w-100'
        >
          <Dropdown.Menu className='groups'>
          {
            this.state.items.map((item, index) => (
              <div key={index} className="item">
                <Checkbox
                  value={item.id}
                  label={item.value}
                  defaultChecked={this.state.selected.includes(item)}
                  onClick={e => this.toggleSelection(item.id)}
                />
              </div>
            ))
          }
          </Dropdown.Menu>
        </Dropdown>
      </>
    );

  }
}

export default GroupDropdown;