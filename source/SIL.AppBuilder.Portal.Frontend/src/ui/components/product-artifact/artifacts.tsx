import * as React from 'react';
import { useOrbit } from 'react-orbitjs';
import EmptyLabel from '@ui/components/labels/empty';
import { isEmpty } from '@lib/collection';
import { useTranslations } from '@lib/i18n';

import Artifact from './artifact';
import Header from './header';

import { useToggle } from '~/lib/hooks';

export default function ProductArtifact({ product, productBuild }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const [areArtifactsVisible, toggleShowArtifacts] = useToggle(true);

  const productDefinition = dataStore.cache.query((q) =>
    q.findRelatedRecord(product, 'productDefinition')
  );
  let artifacts = [];

  if (productBuild) {
    artifacts = dataStore.cache.query((q) =>
      q.findRelatedRecords(productBuild, 'productArtifacts')
    );
  }

  return (
    <div data-test-product-artifacts className='product-artifact w-100'>
      <Header
        {...{
          productDefinition,
          artifacts,
          product,
        }}
        onClick={toggleShowArtifacts}
        isCollapsed={areArtifactsVisible}
      />

      {areArtifactsVisible && (
        <div data-test-artifact-list-container>
          <EmptyLabel
            className='m-t-lg m-l-lg m-b-lg'
            condition={!isEmpty(artifacts)}
            label={t('project.products.noArtifacts')}
          >
            <div className='flex p-l-md p-t-sm p-b-sm p-r-md gray-text bold'>
              <div className='flex-70'>
                <span>{t('project.products.filename')}</span>
              </div>
              <div className='flex flex-30'>
                <div className='flex-grow'>
                  <span>{t('project.products.updated')}</span>
                </div>
                <div className='flex-30 text-align-right'>
                  <span className='m-r-md'>{t('project.products.size')}</span>
                </div>
                <div className='flex-10' />
              </div>
            </div>

            {(artifacts || []).map((artifact) => (
              <Artifact key={artifact.id} artifact={artifact} />
            ))}
          </EmptyLabel>
        </div>
      )}
    </div>
  );
}
