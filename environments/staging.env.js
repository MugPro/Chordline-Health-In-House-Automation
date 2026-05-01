import dotenv from 'dotenv';
import path from 'path';

// ✅ Guard: prevent accidental double-load
if (process.env.__ENV_LOADED__ && process.env.__ENV_LOADED__ !== 'staging') {
  throw new Error(
    `Environment already loaded: ${process.env.__ENV_LOADED__}. Cannot load staging.`
  );
}

dotenv.config({
  path: path.resolve('environments/.env.staging.local'),
  override: true, // ✅ REQUIRED
});

process.env.__ENV_LOADED__ = 'staging';

export const env = {
  DEFAULT_URL: process.env.DEFAULT_URL,
  DEFAULT_URL_2: process.env.DEFAULT_URL_2,
  DEFAULT_URL_3: process.env.DEFAULT_URL_3,

  DEFAULT_LOGIN: process.env.DEFAULT_LOGIN,
  DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD,
  DEFAULT_PASS_JUNE_2025: process.env.DEFAULT_PASS_JUNE_2025,
  DEFAULT_PASS_OCT_2025: process.env.DEFAULT_PASS_OCT_2025,

  QAWA_API_KEY: process.env.QAWA_API_KEY,
};







/*
import dotenv from 'dotenv';
import path from 'path';

if (!process.env.CI) {
    dotenv.config({ path: path.resolve('environments/.env.staging.local') });
}

export const env = {
    DEFAULT_URL: process.env.DEFAULT_URL,
    DEFAULT_URL_2: process.env.DEFAULT_URL_2,
    DEFAULT_URL_3: process.env.DEFAULT_URL_3,
    INTERNAL_PDF_VIEWER: process.env.INTERNAL_PDF_VIEWER,

    DEFAULT_LOGIN: process.env.DEFAULT_LOGIN,
    DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD,
    DEFAULT_PASS_JUNE_2025: process.env.DEFAULT_PASS_JUNE_2025,
    DEFAULT_PASS_OCT_2025: process.env.DEFAULT_PASS_OCT_2025,

    QAWA_API_KEY: process.env.QAWA_API_KEY,
};


 */