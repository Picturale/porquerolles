import React, { createContext, useContext } from 'react';
import { trustConfig } from './index';

const TrustCtx = createContext(trustConfig);
export const useTrust = () => useContext(TrustCtx);

export function TrustProvider({ children }: { children: React.ReactNode }) {
  return <TrustCtx.Provider value={trustConfig}>{children}</TrustCtx.Provider>;
}
