import "regenerator-runtime/runtime";

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'vendor/legacy-support';

import 'semantic-ui-css/semantic.min.css';
// require('public/images/*');

import Application from './ui/application';

ReactDOM.render(
  <Application />,
  document.getElementById('root')
);
