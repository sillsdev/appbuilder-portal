import React from 'react';
import { LiveDataProvider } from '@data/live';

import { default as SocketManager } from './socket-manager';

export function Sockets({ children }) {
  return (
    <LiveDataProvider>
      <SocketManager>{children}</SocketManager>
    </LiveDataProvider>
  );
}
