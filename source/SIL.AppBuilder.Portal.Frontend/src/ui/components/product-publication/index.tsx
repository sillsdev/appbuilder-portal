import * as React from 'react';
import { useOrbit, attributesFor } from 'react-orbitjs';
import { useCurrentUser } from '@data/containers/with-current-user';
import { useTranslations } from '@lib/i18n';
import moment from 'moment';

import Header from './header';

export default function Publication({ product, productBuild }) {
  const { t } = useTranslations();
  const { dataStore } = useOrbit();
  const { currentUser } = useCurrentUser();
  const { timezone } = attributesFor(currentUser);
  const getWaitTime = (dateTime, timezone) => {
    const timeZone = timezone || moment.tz.guess();
    if (!dateTime.includes('Z')) {
      dateTime += 'Z';
    }
    const inTzDateTime = moment(dateTime)
      .tz(timeZone)
      .format('L');

    return inTzDateTime;
  };
  let publications = [];

  if (productBuild) {
    publications = dataStore.cache.query((q) =>
      q.findRelatedRecords(productBuild, 'productPublications')
    );
  }
  let attributes = null;
  let date = '';
  let status = '';
  let isPublicationVisible = false;
  if (publications.length != 0) {
    attributes = attributesFor(publications[0]);
    const dateTime = attributes.dateUpdated;
    status =
      attributes.success === true
        ? t('project.products.publications.succeeded')
        : t('project.products.publications.failed');
    date = getWaitTime(dateTime, timezone);
    if (attributes.logUrl) {
      isPublicationVisible = true;
    }
  }
  return (
    <div data-test-product-publication className='publication-build w-100 m-b-lg'>
      {isPublicationVisible && (
        <div data-test-publication-container>
          <Header />
          <div
            data-test-product-publication-detailOK
            className='fs-14 black-text flex align-items-center p-l-md p-t-xs p-b-md p-r-md justify-content-space-between'
          >
            <div data-test-product-publication-channel className='flex-100 align-items-center'>
              {attributes.channel}
            </div>
            <div data-test-product-publication-status className='flex-100 align-items-center'>
              {status}
            </div>
            <div data-test-product-publication-date className='flex-100 align-items-center'>
              {date}
            </div>
            <div data-test-product-publication-url className='flex-100 align-items-center'>
              <a href={attributes.logUrl}> {t('project.products.publications.console')} </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
