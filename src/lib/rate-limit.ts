// GitHub API 速率限制追踪
import { RATE_LIMIT_WARN_THRESHOLD } from './config';

export interface RateLimitState {
  remaining: number | null;
  limit: number | null;
  reset: number | null; // epoch seconds
}

class RateLimitTracker {
  state: RateLimitState = { remaining: null, limit: null, reset: null };

  update(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const limit = headers.get('X-RateLimit-Limit');
    const reset = headers.get('X-RateLimit-Reset');
    this.state = {
      remaining: remaining !== null ? parseInt(remaining, 10) : this.state.remaining,
      limit: limit !== null ? parseInt(limit, 10) : this.state.limit,
      reset: reset !== null ? parseInt(reset, 10) : this.state.reset,
    };
  }

  get isLow(): boolean {
    return this.state.remaining !== null && this.state.remaining < RATE_LIMIT_WARN_THRESHOLD;
  }

  get resetDate(): Date | null {
    return this.state.reset ? new Date(this.state.reset * 1000) : null;
  }
}

export const rateLimit = new RateLimitTracker();
