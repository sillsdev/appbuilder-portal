import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'semantic-ui-css/semantic.min.css';
import 'react-toastify/dist/ReactToastify.css';

import './ui/styles/app.scss';
import './public/assets/images/favicon.png';
import './public/assets/images/favicon.ico';

import Application from './ui/application';

ReactDOM.render(
  <Application />,
  document.getElementById('root')
);
