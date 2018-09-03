import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'vendor/legacy-support';
import './global-config';

import 'semantic-ui-css/semantic.min.css';

import './ui/styles/app.scss';

import Application from './ui/application';

ReactDOM.render(
  <Application />,
  document.getElementById('root')
);
