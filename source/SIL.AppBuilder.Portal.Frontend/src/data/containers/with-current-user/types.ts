import { SingleResourceDoc } from 'jsonapi-typescript';

import { UserResource } from '@data';

import { USERS_TYPE } from '@data';

import { UserAttributes } from '@data/models/user';

export interface ICurrentUserProps {
  currentUser?: UserResource;
  isLoggedIn: boolean;
  currentUserProps?: {
    currentUser?: UserResource;
    error?: any;
    isLoading?: boolean;
    fetchCurrentUser?: () => void;
    isLoggedIn?: boolean;
    isTokenExpired?: boolean;
    hasVerifiedEmail?: boolean;
    token?: string;
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
