import * as React from 'react';
import AndriodIcon from '@material-ui/icons/Android';
import WebIcon from '@material-ui/icons/Web';

import { ResourceObject } from 'jsonapi-typescript';
import { ProductAttributes } from '@data/models/product';
import { PRODUCTS_TYPE, attributesFor } from '@data';

const iconMap = {
  android: () => <AndriodIcon />,
  html: () => <WebIcon />,
};

export interface IProps {
  product: ResourceObject<PRODUCTS_TYPE, ProductAttributes>;
}

export default class ProductIcon extends React.Component<IProps> {

  render() {

    const { product } = this.props;

    const { name } = attributesFor(product);
    const closestKey = Object.keys(iconMap).find(key => name.toLowerCase().includes(key));

    return iconMap[closestKey]() || <WebIcon />;
  }
}
