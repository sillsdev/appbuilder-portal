import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { ResourceObject } from 'jsonapi-typescript';
import { ProductAttributes } from '@data/models/product';

const iconMap = {
  android: 'android',
  html: 'file code',
};

export interface IProps {
  product: ResourceObject<'products', ProductAttributes>;
}

export default class ProductIcon extends React.Component<IProps> {
  render() {
    const { product } = this.props;
    const name  = product.attributes.name || '';
    const closestKey = Object.keys(iconMap).find(key => name.toLowerCase().includes(key));
    const icon = iconMap[closestKey] || 'file';

    return <Icon className={icon} />;
  }
}
