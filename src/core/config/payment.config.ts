import { registerAs } from '@nestjs/config';

import { ApiConfig } from './app.config';

export default registerAs('payment', () => ({
  secretKey: ApiConfig.PAYSTACK_SECRET_KEY,
  publicKey: ApiConfig.PAYSTACK_PUBLIC_KEY,
  baseUrl: ApiConfig.PAYSTACK_BASE_URL,
  callbackUrl: ApiConfig.PAYSTACK_CALLBACK_URL,
  webhookUrl: ApiConfig.PAYSTACK_WEBHOOK_URL,
  flowPlanCode: ApiConfig.FLOW_PLAN_CODE,
}));
