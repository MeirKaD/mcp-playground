const requestCounts = new Map<string, number>();
const REQUEST_LIMIT = 5;

export function getRequestCount(identifier: string): number {
  return requestCounts.get(identifier) || 0;
}

export function incrementRequestCount(identifier: string): number {
  const currentCount = getRequestCount(identifier);
  const newCount = currentCount + 1;
  requestCounts.set(identifier, newCount);
  return newCount;
}

export function isRequestLimitExceeded(identifier: string): boolean {
  return getRequestCount(identifier) >= REQUEST_LIMIT;
}

export function resetRequestCount(identifier: string): void {
  requestCounts.delete(identifier);
}