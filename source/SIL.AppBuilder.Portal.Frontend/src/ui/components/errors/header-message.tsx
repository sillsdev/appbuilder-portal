import * as React from 'react';
import CloseIcon from '@material-ui/icons/Close';

import { parseError } from './parse-error';

export interface IProps {
  // TODO: this'll need to be a uninion of types, as we want to support
  // string, JS Error, Http Error, JSONAPI Error, Orbit Error
  //
  // TODO: it may be handy to support an array of errors as well
  error?: any;
  showClose?: boolean;
  displayClass?: string;
}

export default function ErrorHeaderMessage({ error, showClose, displayClass }: IProps) {
  if (!error || error.length === 0) {
    return null;
  }

  showClose = showClose === undefined ? true : showClose;
  displayClass = displayClass === undefined ? 'ui negative message' : displayClass;
  // title is required, but body is not.
  const { title, body } = parseError(error);

  return (
    <div className={displayClass}>
      {showClose ? <CloseIcon className='close icon' /> : null}
      <div className='header'>{title}</div>

      {(body && <p>{body}</p>) || null}
    </div>
  );
}
