import { defineConfig } from '@playwright/test';

export default defineConfig({
    timeout: 222000,
    retries: 1,
    workers: 1,
    reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],

    projects: [
        {
            name: 'staging',
            testDir: './workflows/staging',
            testMatch: '**/*.test.js',
            globalSetup: new URL('./environments/staging.env.js', import.meta.url).pathname,
            use: {
                baseURL: process.env.DEFAULT_URL,
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
            globalSetup: new URL('./environments/qawolf2.env.js', import.meta.url).pathname,
            use: {
                baseURL: process.env.DEFAULT_URL,
                viewport: { width: 1280, height: 720 },
                ignoreHTTPSErrors: true,
                video: 'retain-on-failure',
                screenshot: 'only-on-failure',
            },
        },
    ],
});
