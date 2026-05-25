export const AI_CONFIG = {
  cacheTtlMs: parseInt(process.env.AI_CACHE_TTL_SEC || '300') * 1000,
  rateLimitTtl: 60,
  rateLimitLimit: parseInt(process.env.AI_RATE_LIMIT_RPM || '20'),
};
