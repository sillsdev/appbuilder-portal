import * as React from 'react';
import * as env from '@env';

export default () => {
  if (!env.showDebug) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 100000 }}>
      <label>Mode:</label> {env.NODE_ENV} <br />
      <label>Rev:</label> {env.revision} <br />
      <label>Build Date:</label> {env.buildDate} <br />
    </div>
  );
};
