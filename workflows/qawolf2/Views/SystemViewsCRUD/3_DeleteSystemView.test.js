import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Delete all QAW Views', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SystemViewCRUD`;
    const viewName = `QAWolf view name`;
    const viewNameEdited = `${viewName} - edited`;

    // Sign in to the app
    const { page, browser } = await helpers.logIn({
        url: env.DEFAULT_URL_2,
        loginID,
        password: env.DEFAULT_PASS_OCT_2025,
    });





    await helpers.cleanUpMyView(page, { viewName });

    await browser.close();
});
