import * as React from 'react';
import { useOrbit } from 'react-orbitjs';
import { compareVia, isEmpty } from '@lib/collection';

import { useTranslations } from '@lib/i18n';

import { ProjectResource, ProductResource, attributesFor } from '@data';

import { withTranslations, i18nProps } from '@lib/i18n';
import ProductArtifact from '@ui/components/product-artifact';

interface IOwnProps {
  project: ProjectResource;
}

type IProps = IOwnProps & i18nProps;

export default function Products({ project }: IProps) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();

  const products = dataStore.cache.query((q) => q.findRelatedRecords(project, 'products'));
  let productList;
  if (isEmpty(products)) {
    productList = (
      <div
        className='flex align-items-center justify-content-center
      m-b-lg p-t-md p-b-md round-border-8 thin-border'
      >
        <span data-test-products-empty-text>{t('project.products.empty')}</span>
      </div>
    );
  } else {
    const sortedProducts = products.sort(
      compareVia((product) => attributesFor(product).dateCreated, false)
    );
    productList = sortedProducts.map((product) => <div>{product.id}</div>);
  }
  return <div className='m-b-lg'>{productList}</div>;
}

// class Products extends React.Component {
//   render() {
//     const { products } = this.props;
//     const { t } = useTranslations();

//     let productList;

//     if (isEmpty(products)) {
//       productList = (
//         <div
//           className='flex align-items-center justify-content-center
//         m-b-lg p-t-md p-b-md round-border-8 thin-border'
//         >
//           <span data-test-products-empty-text>{t('project.products.empty')}</span>
//         </div>
//       );
//     } else {
//       const sortedProducts = products.sort(
//         compareVia((product) => attributesFor(product).dateCreated, false)
//       );
//       productList = sortedProducts.map((product) => <div></div>);
//     }
//     return (
//       <div data-test-products>
//         {products.map((product, i) => {
//           return <ProductArtifact key={product.id} product={product} />;
//         })}
//       </div>
//     );
//   }
// }

// export default compose(
//   withTranslations,
//   withOrbit((passedProps: IProps) => {
//     const { project } = passedProps;

//     return {
//       products: (q) => q.findRelatedRecords(project, 'products'),
//     };
//   })
// )(Products);
