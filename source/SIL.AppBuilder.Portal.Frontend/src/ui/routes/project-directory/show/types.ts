import { match as Match } from 'react-router';

export interface Params {
  projectId: string;
}

export interface IExpectedPropsForRoute {
  match: Match<Params>;
}
