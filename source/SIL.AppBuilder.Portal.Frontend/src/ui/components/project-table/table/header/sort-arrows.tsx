import * as React from 'react';
import DownArrowIcon from '@material-ui/icons/ArrowDownward';
import UpArrowIcon from '@material-ui/icons/ArrowUpward';


const iconStyle = {
  width: '14px',
  height: '14px',
  position: 'absolute',
  marginLeft: '-14px',
  marginTop: '2px'
};

export function UpArrow() {
  return (
    <UpArrowIcon
      data-test-up-arrow
      style={iconStyle}
    />
  );
}

export function DownArrow() {
  return (
    <DownArrowIcon
      data-test-down-arrow
      style={iconStyle}
    />
  );

}
