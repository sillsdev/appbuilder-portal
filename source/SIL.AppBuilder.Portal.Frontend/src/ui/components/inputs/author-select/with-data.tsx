import React from 'react';
import { buildOptions, ProjectResource, query } from '@data';
import { attributesFor, isRelatedRecord, relationshipFor } from '@data/helpers';
import { useOrbit, useQuery } from 'react-orbitjs';
import { defaultSourceOptions, OrganizationResource } from '@data';
import { TYPE_NAME as USER } from '@data/models/user';
import { retrieveRelation } from '@data/containers/with-relationship';

import { PageError } from '~/ui/components/errors';
import { PageLoader } from '~/ui/components/loaders';

interface IProps {
  project: ProjectResource;
  selected: Id;
  groupId: Id;
  restrictToGroup: boolean;
  scopeToOrganization?: OrganizationResource;
}

export function withData(WrappedComponent) {
  function DataWrapper({
    project,
    scopeToOrganization,
    selected,
    restrictToGroup,
    groupId,
    ...otherProps
  }): JSX.Element {
    // console.log('ahhh', users);
    const { dataStore } = useOrbit();

    const {
      isLoading,
      error,
      result: { users, userRoles, roles, authors },
    } = useQuery({
      users: [
        (q) => q.findRecords('user'),
        buildOptions({
          include: [
            'group-memberships.group',
            'organization-memberships.organization',
            'user-roles',
          ],
        }),
      ],
      userRoles: [(q) => q.findRecords('userRole'), buildOptions()],
      roles: [(q) => q.findRecords('role'), buildOptions()],
      authors: [(q) => q.findRecords('author'), buildOptions()],
    });

    if (error) return <PageError error={error} />;
    if (isLoading || !users) return <PageLoader sizeClass={'m-t-sm m-b-sm'} />;

    const authorRole = roles.find((r) => {
      const { roleName } = attributesFor(r);
      return roleName === 'Author';
    });
    const authorRoles = (userRoles || []).filter(
      (r) =>
        r &&
        scopeToOrganization &&
        isRelatedRecord(r, scopeToOrganization) &&
        isRelatedRecord(r, authorRole)
    );
    const authorUserIds = (authorRoles || []).map(
      (r) => r && relationshipFor(r, 'user').data['id']
    );

    const existingAuthors = (authors || []).filter(
      (a) => a && project && isRelatedRecord(a, project)
    );
    const existingAuthorUserIds = existingAuthors.map(
      (a) => a && relationshipFor(a, 'user').data['id']
    );

    // remove users who _can't_ be assigned to this project as authors
    const filtered = (users || [])
      .filter((user) => authorUserIds.includes(user.id))
      .filter((user) => {
        let isInOrganization = true;
        let isInGroup = true;
        let isNewAuthor = true;

        if (scopeToOrganization) {
          const organizationId = scopeToOrganization.id;
          const organizations = retrieveRelation(dataStore, [
            user,
            'organizationMemberships',
            'organization',
          ]);
          const ids = (organizations || []).map((o) => o && o.id);

          isInOrganization = ids.includes(organizationId);
        }

        if (restrictToGroup && groupId) {
          const groups = retrieveRelation(dataStore, [user, 'groupMemberships', 'group']);
          const ids = (groups || []).map((g) => g && g.id);
          isInGroup = ids.includes(groupId);
        }

        if (existingAuthorUserIds) {
          isNewAuthor = !existingAuthorUserIds.includes(user.id);
        }

        return isInOrganization && isInGroup && isNewAuthor;
      });

    return <WrappedComponent {...{ ...otherProps, selected, users: filtered }} />;
  }

  return query(() => {
    return {
      cacheKey: 'static',
      users: [
        (q) => q.findRecords(USER),
        {
          label: 'Get Users for User Input Select',
          sources: {
            remote: {
              settings: { ...defaultSourceOptions() },
              include: [
                'group-memberships.group',
                'organization-memberships.organization',
                'user-roles',
              ],
            },
          },
        },
      ],
    };
  })(DataWrapper);
}
