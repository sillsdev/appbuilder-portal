import * as React from 'react';
import AndroidIcon from '@material-ui/icons/Android';
import WebIcon from '@material-ui/icons/Web';
import ArchiveIcon from '@material-ui/icons/Archive';
import MissingIcon from '@material-ui/icons/ErrorOutline';

import { attributesFor } from '@data';

import { ProductDefinitionResource, ProductResource } from '@data';

const colorStyles = {
  android: { color: '#a4c639' },
  html: { color: '#f5a623' },
  pwa: { color: '#0096ff' },
  package: { color: '#115293' }
};

const styles = (type, selected, size) => {
  const color = selected ? colorStyles[type] : DEFAULT_COLOR;
  const fontSize = size ? { fontSize: `${size}px` } : '';

  return {
    ...color,
    ...fontSize,
  };
};

const DEFAULT_COLOR = { color: '#9b9b9b' };

const iconMap = {
  android: (selected, size) => <AndroidIcon style={styles('android', selected, size)} />,
  html: (selected, size) => <WebIcon style={styles('html', selected, size)} />,
  pwa: (selected, size) => <WebIcon style={styles('pwa', selected, size)} />,
  package: (selected, size) => <ArchiveIcon style={styles('package', selected, size)} />,
  [undefined]: () => <MissingIcon />,
};

// TODO: We need to change this to product definition
export interface IProps {
  product: ProductDefinitionResource | ProductResource;
  selected?: boolean;
  size?: number;
}

export default class ProductIcon extends React.Component<IProps> {
  render() {
    const { product, selected, size } = this.props;

    const { name } = attributesFor(product);
    const lowerName = name && name.toLowerCase();
    const closestKey = Object.keys(iconMap).find((key) => lowerName && lowerName.includes(key));

    return iconMap[closestKey](selected, size);
  }
}
