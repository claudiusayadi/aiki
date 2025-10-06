import { ApiConfig } from './app.config';

export default {
  access: {
    secure: true,
    httpOnly: true,
    sameSite: true,
    maxAge: ApiConfig.JWT_ACCESS_TOKEN_TTL * 1000, // cookies maxAge is in ms
  },
  refresh: {
    secure: true,
    httpOnly: true,
    sameSite: true,
    maxAge: ApiConfig.JWT_REFRESH_TOKEN_TTL * 1000, // cookies maxAge is in ms
  },
};
