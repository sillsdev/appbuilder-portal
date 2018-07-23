import * as React from 'react';

import { parseError } from './parse-error';

export interface IProps {
  // TODO: this'll need to be a uninion of types, as we want to support
  // string, JS Error, Http Error, JSONAPI Error, Orbit Error
  //
  // TODO: it may be handy to support an array of errors as well
  error?: any;
}

export default class ErrorHeaderMessage extends React.Component<IProps> {
  render() {
    const { error } = this.props;

    if (!error || error.length === 0) { return null; }

    // title is required, but body is not.
    const { title, body } = parseError(error);

    return (
      <div className='ui negative message'>
        <i className='close icon' />
        <div className='header'>
          {title}
        </div>

        { body && (
          <p>
            {body}
          </p>
        ) || null }
      </div>
    );
  }
}
