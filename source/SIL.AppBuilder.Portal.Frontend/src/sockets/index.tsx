import React from 'react';
import { LiveDataProvider } from '@data/live';

export function Sockets({ children }) {
  return <LiveDataProvider>{children}</LiveDataProvider>;
}
