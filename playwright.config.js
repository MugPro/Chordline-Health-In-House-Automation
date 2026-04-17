import { defineConfig } from '@playwright/test';
import { env as stagingEnv } from './environments/staging.env.js';
import { env as qawolf2Env } from './environments/qawolf2.env.js';

export default defineConfig({
    //timeout: 360000,
    timeout: 204000,
    retries: 1,
    workers: 1, // ← run tests one at a time
    reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
    projects: [
        {
            name: 'staging',
            testDir: './workflows/staging',
            testMatch: '**/*.test.js',
            use: {
                baseURL: stagingEnv.DEFAULT_URL,
                //headless: true,

                viewport: { width: 1280, height: 720 },
                ignoreHTTPSErrors: true,
                video: 'retain-on-failure',
                screenshot: 'only-on-failure',
            },
        },
        {
            name: 'qawolf2',
            testDir: './workflows/qawolf2',
            testMatch: '**/*.test.js',
            use: {
                baseURL: qawolf2Env.DEFAULT_URL,
                //headless: true,
                viewport: { width: 1280, height: 720 },
                ignoreHTTPSErrors: true,
                video: 'retain-on-failure',
                screenshot: 'only-on-failure',
            },
        },
    ],
});
