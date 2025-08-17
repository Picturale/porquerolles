import { trustConfig } from '../index';

export type StabilityInput = {
  ratingsCount?: number;           // total valid ratings N
  trustedRatersCount?: number;     // K: raters with T≥60
  maxClusterShare?: number;        // anti-collusion ratio 0..1
};

export function computeStabilityNeeded(input: StabilityInput = {}) {
  const { stability } = trustConfig;
  const N = Math.max(0, input.ratingsCount ?? 0);
  const K = Math.max(0, input.trustedRatersCount ?? 0);
  const cluster = typeof input.maxClusterShare === 'number' ? input.maxClusterShare : 0;

  const needN = Math.max(0, stability.minRatings - N);
  const needK = Math.max(0, stability.minTrusted - K);
  const clusterOk = cluster <= stability.maxClusterShare;
  const isStable = needN === 0 && needK === 0 && clusterOk;

  // For UX we surface the trusted-raters delta primarily
  const neededTrusted = needK;

  return { isStable, neededTrusted, needN, needK, clusterOk };
}
