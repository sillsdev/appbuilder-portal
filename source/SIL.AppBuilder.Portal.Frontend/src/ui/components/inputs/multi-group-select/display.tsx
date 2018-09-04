import * as React from 'react';
import { compose } from 'recompose';
import { Dropdown, Checkbox } from 'semantic-ui-react';

import { attributesFor } from '@data';

import { IProvidedProps as IDataProps } from '../group-select/with-data';
import { withTranslations, i18nProps } from '@lib/i18n';

interface IOwnProps {
  selectedGroups: Id[];
  onChange: (groupIds: Id[]) => void;
  disableSelection?: boolean;
}

export interface IState {
  options: Array<{ id: string, value: string }>;
  selectedOptions: Array<{ id: string, value: string }>;
}

type IProps =
  & IOwnProps
  & IDataProps
  & i18nProps;

class GroupSelectDisplay extends React.Component<IProps, IState> {

  state = {
    options: [],
    selectedOptions: []
  }

  componentDidMount() {
    const { groups } = this.props;

    if (groups && groups.length > 0) {
      const dropdownOptions = this.groupToDropdownOptions(groups);
      this.setState({ options: dropdownOptions });
    }
  }

  componentDidUpdate(prevProps) {

    const newDropdownOptions = this.groupToDropdownOptions(this.props.groups);
    const prevDropdownOptions = this.groupToDropdownOptions(prevProps.groups);
    const newValues = newDropdownOptions.map(o => o.id).join('');
    const oldValues = prevDropdownOptions.map(o => o.id).join('');

    if(newValues != oldValues) {
      this.setState({ options: newDropdownOptions });
    }
  }

  groupToDropdownOptions = (groups) => {

    const groupOptions = groups
      .filter(group => attributesFor(group).name)
      .map(group => ({
        text: attributesFor(group).name,
        id: group.id
      }));

    return groupOptions;
  }

  getText = () => {

    const { selectedOptions, options } = this.state;
    const { t } = this.props;

    if (selectedOptions && selectedOptions.length === 0) {
      return t('common.inputs.multiGroup.none');
    }

    if (selectedOptions.length === options.length) {
      return t('common.inputs.multiGroup.all');
    }

    const getShortName = (text) => text.split(' ').length > 1 ? `${text.split(' ')[0]}...` : text;

    return selectedOptions.map(item => getShortName(item.text)).join(', ');
  }

  updateOptionsSelected = (id) => {

    const { options, selectedOptions } = this.state;
    const { onChange } = this.props;

    const optionSelected = options.find(opt => opt.id === id);

    const isOptionInSelectedOptions = (o) => selectedOptions.find(i => i.id === o.id) != undefined

    if (!optionSelected) { return; }

    //If option is in selectedOptions, remove it
    if (isOptionInSelectedOptions(optionSelected)) {

      const selectOptionsFiltered = selectedOptions.filter(i => i.id !== optionSelected.id);

      this.setState({
        selectedOptions: selectOptionsFiltered
      },() => {
        onChange(this.state.selectedOptions);
      });

    } else {

      this.setState({
        selectedOptions: [
          ...selectedOptions,
          optionSelected
        ]
      }, () => {
        onChange(this.state.selectedOptions);
      });

    }
  }

  isItemSelected = (id) => {
    const { selectedOptions } = this.state;
    return selectedOptions.filter(i => i.id === id).length > 0;
  }

  render() {
    const { disableSelection } = this.props;
    const { options } = this.state;

    return (
      <>
        <Dropdown
          data-test-multi-group-select
          disabled={disableSelection || false}
          multiple
          text={this.getText()}
          className='w-100 groupDropdown'

        >
          <Dropdown.Menu className='groups' data-test-multi-group-menu>
            {
              options.map((item, index) => (
                <div key={index} className="item" onClick={e => {
                  e.stopPropagation();
                  this.updateOptionsSelected(item.id);
                }}>
                  <Checkbox
                    data-test-multi-group-checkbox
                    value={item.id}
                    label={item.text}
                    checked={this.isItemSelected(item.id)}
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

export default compose(
  withTranslations
)(GroupSelectDisplay)
