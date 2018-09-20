import * as React from 'react';

import './footer.scss';

interface IProps {
  keyword: string;
}


const descriptions = {
  ['name']: {
    example: `"NIV by SIL"`,
  },
  ['organization.name']: {
    title: ``,
  },
  ['language']: {
    title: ``,
  },
  ['owner.name']: {
    title: ``,
  },
  ['product.name']: {
    title: ``,
  },
  ['group.name']: {
    title: ``,
  },
  ['product.datePublished']: {
    title: ``,
  }
};

export default class SearchFooter extends React.Component<IProps> {
  render() {
    const { keyword } = this.props;
    const { example, description } = descriptions[keyword];

    return (
      <footer className='tokenized-search-footer'>
        <strong>{keyword}:</strong> <em>{example}</em>
      </footer>
    );
  }
}
