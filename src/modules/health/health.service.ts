import { Injectable, Logger } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  public async check() {
    return this.health.check([
      // Database health check
      async () => await this.db.pingCheck('database'),

      // Memory health check (alert if using more than 300MB)
      async () => await this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Disk health check (alert if disk usage > 80%)
      async () =>
        await this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.8,
        }),
    ]);
  }

  public async getMetrics() {
    try {
      const healthResult = await this.check();

      // Log health metrics for monitoring
      this.logger.log(
        `Health check completed: ${JSON.stringify(healthResult)}`,
      );

      return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        ...healthResult,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Health check failed: ${errorMessage}`);
      throw error;
    }
  }
}
