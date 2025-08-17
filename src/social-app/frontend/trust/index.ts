// Runtime export of the trust configuration
// This file allows typed access to the JSON config
import cfg from './trust.v1.json';

export type TrustConfig = typeof cfg;
export const trustConfig: TrustConfig = cfg;
