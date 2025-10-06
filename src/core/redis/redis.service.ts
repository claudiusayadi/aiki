import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../config/redis.config';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async setRefreshToken(
    userId: string,
    token: string,
    ttl: number,
  ): Promise<void> {
    await this.redis.set(this.getKey(userId), token, 'EX', ttl);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    return this.redis.get(this.getKey(userId));
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.redis.del(this.getKey(userId));
  }

  private getKey(userId: string): string {
    return `refresh:${userId}`;
  }
}
