import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn} from "../../../../helpers/Node20Helpers.js";

test('Delete all QAW Views', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SystemViewCRUD`;
    const viewName = `QAWolf view name`;
    const viewNameEdited = `${viewName} - edited`;

    // Sign in to the app
    /*
    const { page, browser } = await helpers.logIn({
        url: env.DEFAULT_URL_2,
        loginID,
        password: env.DEFAULT_PASS_OCT_2025,
    });

     */



    const { page, browser } = await logIn({
        loginID: 'SystemViewCRUD',
        password: 'fasdfafs123A@',
        slowMo: 800,
        url: 'https://qawolf2.tcshealthcare.com/login.jsp'
    });





    await helpers.cleanUpMyView(page, { viewName });

    await browser.close();
});
