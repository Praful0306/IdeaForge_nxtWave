// In-memory IP rate limiter for NagarNetra
// 10 requests per minute per IP

interface RateRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateRecord>();

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = ipMap.get(ip);

  if (!record || now > record.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}
