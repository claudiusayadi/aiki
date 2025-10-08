import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { HealthCheck } from '@nestjs/terminus';

import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Health Check' })
  @ApiOkResponse({ description: 'The service is healthy.' })
  @Public()
  @HealthCheck()
  @Get()
  public check() {
    return this.healthService.check();
  }

  @ApiOperation({ summary: 'Get detailed metrics' })
  @ApiOkResponse({ description: 'Detailed system metrics.' })
  @Public()
  @Get('metrics')
  public getMetrics() {
    return this.healthService.getMetrics();
  }
}
