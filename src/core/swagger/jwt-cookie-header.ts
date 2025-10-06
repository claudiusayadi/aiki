import { ApiResponseOptions } from '@nestjs/swagger';

export const jwtCookieHeader: ApiResponseOptions['headers'] = {
  'Set-Cookie': {
    description: 'JWT authentication cookie',
    schema: {
      type: 'string',
      example:
        'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; SameSite=Strict',
    },
  },
};
