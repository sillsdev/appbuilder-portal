import { SingleResourceDoc } from 'jsonapi-typescript';

import { UserResource } from '@data';

import { USERS_TYPE } from '@data';

import { UserAttributes } from '@data/models/user';

export interface IFetchCurrentUserOptions {
  forceReloadFromServer?: boolean;
  forceReloadFromCache?: boolean;
}

export interface ICurrentUserProps {
  currentUser?: UserResource;
  currentUserProps?: {
    currentUser?: UserResource;
    error?: any;
    isLoading?: boolean;
    fetchCurrentUser?: (opts?: IFetchCurrentUserOptions) => Promise<void>;
  };
}

export interface IProvidedProps {
  currentUser: UserResource;
}

type UserPayload = SingleResourceDoc<USERS_TYPE, UserAttributes>;
export interface IProps {
  usersMatchingLoggedInUser: UserPayload;
}

export interface IState {
  currentUser: UserPayload;
  isLoading: boolean;
  error?: any;
  fetchCurrentUser?: () => Promise<void>;
  networkFetchComplete: boolean;
}
