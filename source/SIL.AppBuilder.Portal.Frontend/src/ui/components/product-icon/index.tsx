import * as React from 'react';
import { Icon } from 'semantic-ui-react';

const iconMap = {
  android: 'android',
  html: 'file code',
};

export interface IProps {
  product: JSONAPI<{
    name: string;
    // type?
    // TODO: figure out better mapping for this
    //       we'll know for certain as we actually start to work with products
  }>;
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
