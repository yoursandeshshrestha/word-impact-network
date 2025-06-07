import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

    if (!origin) return callback(null, true);

    // Check if the origin matches any of the allowed origins
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      // If allowedOrigin is a domain without protocol, match any protocol
      if (allowedOrigin.startsWith('.')) {
        return origin.endsWith(allowedOrigin);
      }
      // If allowedOrigin is a full URL, do exact match
      return origin === allowedOrigin;
    });

    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-API-Key',
    'X-HTTP-Method-Override',
    'X-Requested-With',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie'],
  maxAge: 86400,
};

export default corsOptions;
