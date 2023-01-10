import React, { useEffect, useState } from 'react';
import { useOrbit, remoteIdentityFrom } from 'react-orbitjs';
import { get } from '~/lib/fetch';

import { ProductBuildResource, attributesFor } from '@data';

import { compareVia } from '@lib/collection';
import { useTranslations } from '@lib/i18n';
import ResourceSelect from '@ui/components/inputs/resource-select';

import Publication from '../product-publication';

import Artifacts from './artifacts';

export default function Builds({ product }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const [builds, setBuilds] = useState([]);
  const [activeVersion, setActiveVersion] = useState();
  const productRemoteId = remoteIdentityFrom(dataStore, product).keys.remoteId;

  useEffect(() => {
    async function fetcher() {
      let response = await get(`/api/products/${productRemoteId}/builds`);
      try {
        let json = await response.json();

        let builds = json.data;
        let sortedBuilds = builds.sort(compareVia((build) => attributesFor(build).buildId, true));

        setBuilds(sortedBuilds || []);
        setActiveVersion((sortedBuilds || [])[0]);
      } catch (e) {
        console.debug('builds not ready, or do not exist');
      }
    }

    fetcher();
  }, [productRemoteId, builds.length === 0]);

  return (
    <div data-test-build>
      <ResourceSelect
        items={builds}
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
          let version = attributesFor(build).version;
          if (version === null) {
            const success = attributesFor(build).success;
            if (success === false) {
              version = ` ${t('projects.buildFailed')} `;
            } else {
              version = ` ${t('projects.buildPending')} `;
            }
          }

          if (build === builds[0]) {
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
      <Publication product={product} productBuild={activeVersion} />
    </div>
  );
}
