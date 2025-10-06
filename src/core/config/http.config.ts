import { ApiConfig } from './app.config';

export default {
  timeout: ApiConfig.HTTP_TIMEOUT,
  maxRedirects: ApiConfig.HTTP_MAX_REDIRECTS,
};
