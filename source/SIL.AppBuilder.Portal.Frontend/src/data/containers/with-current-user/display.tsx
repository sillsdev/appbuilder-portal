import * as React from 'react';
import { onlyUpdateForKeys, compose } from 'recompose';
import { Redirect } from 'react-router-dom';
import { hasRelationship } from '@data';
import * as toast from '@lib/toast';

import PageLoader from '@ui/components/loaders/page';
import PageError from '@ui/components/errors/page';

const defaultOptions = {
  redirectOnFailure: true,
  redirectOnMissingMemberships: true,
};

export function withDisplay(opts = {}) {
  const options = {
    ...defaultOptions,
    ...opts
  };

  return InnerComponent => {
    const template = ({ currentUserProps: { error, currentUser, isLoading } }) => {
      if (error) {
        if (error.status && error.status >= 500) {
          return <PageError error={error} />;
        }

        if (options.redirectOnFailure) {
          toast.error(error);

          return <Redirect push={true} to={'/login'} />;
        }

        return <PageError error={error} />;
      }

      if (isLoading) {
        return <PageLoader />;
      } else if (currentUser) {
        const hasMembership = hasRelationship(currentUser, 'organizationMemberships');

        if (hasMembership || !options.redirectOnMissingMemberships) {
          return <InnerComponent />;
        }

        return <Redirect push={true} to={'/organization-membership-required'} />;
      }

      // TODO: would it ever make sense to do an inline login instead of a redirect?
      return <Redirect push={true} to={'/login'} />;
    };

    return template;
  };
}
