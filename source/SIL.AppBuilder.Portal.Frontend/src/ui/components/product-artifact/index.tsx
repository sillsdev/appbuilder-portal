import React, { useState } from 'react';
import { useOrbit } from 'react-orbitjs';

import { ProductBuildResource, attributesFor } from '@data';

import { compareVia } from '@lib/collection';
import { useTranslations } from '@lib/i18n';
import ResourceSelect from '@ui/components/inputs/resource-select';

import Artifacts from './artifacts';

export default function Builds({ product }) {
  const { t } = useTranslations();
  const {
    subscriptions: { productBuilds },
  } = useOrbit({
    productBuilds: (q) => q.findRelatedRecords(product, 'productBuilds'),
  });

  const sortedBuilds = productBuilds.sort(
    compareVia((build) => attributesFor(build).version, true)
  );
  const [activeVersion, setActiveVersion] = useState((sortedBuilds || [])[0]);

  return (
    <div data-test-build>
      <ResourceSelect
        items={sortedBuilds}
        labelField={(build: ProductBuildResource) => {
          // Looking at the default value here, you may notice that there are extra spaces
          // around the t(...). This is intentional, as the outputs are either:
          //
          // `Current Build (v1.0.0)`
          // or
          // `Current Build ( Build Pending )`
          //
          // without the spaces it does:
          // `Current Build (build Pending)`
          // TODO: see: https://developertown.visualstudio.com/SIL%20International%20Scriptoria/_workitems/edit/34532
          const version = attributesFor(build).version || ` ${t('projects.buildPending')} `;

          if (build === sortedBuilds[0]) {
            return t('projects.latestBuild', { version });
          }

          return version;
        }}
        value={activeVersion}
        onChange={setActiveVersion}
        className='is-large p-b-md'
        noResourcesLabel={t('projects.noBuilds')}
      />
      <Artifacts product={product} productBuild={activeVersion} />
    </div>
  );
}
