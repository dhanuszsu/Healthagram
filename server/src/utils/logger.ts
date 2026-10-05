function formatTimestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(`[${formatTimestamp()}] [INFO] ${message}`, meta ? meta : '');
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`[${formatTimestamp()}] [WARN] ${message}`, meta ? meta : '');
  },
  error: (message: string, meta?: unknown) => {
    console.error(`[${formatTimestamp()}] [ERROR] ${message}`, meta ? meta : '');
  },
  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${formatTimestamp()}] [DEBUG] ${message}`, meta ? meta : '');
    }
  }
};
