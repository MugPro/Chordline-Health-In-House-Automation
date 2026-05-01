import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn, logIn3} from "../../../../helpers/Node20Helpers.js";

test('Delete all QAW Views', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = 'ViewCRUD';
    //const loginID = `emailUsers`;
    const viewName = 'QAW View';
    const viewNameEdited = `${viewName} - edited`;


    const loginID = 'SystemViewCRUD';

    const password = env.DEFAULT_PASS_JUNE_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;


    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 800
    });






    await helpers.cleanUpMyView(page, { viewName });

    await browser.close();
});
