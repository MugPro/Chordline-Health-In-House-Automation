import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn, logIn3, waitUntilLoaded} from "../../../../helpers/Node20Helpers.js";

test('Create view', async () => {
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


/*
    const { page, browser } = await logIn3({
        loginID: 'SystemViewCRUD',
        password: 'fasdfafs123A@',
        slowMo: 800,
        url: 'https://qawolf2.tcshealthcare.com/login.jsp'
    });

 */


    // Sign in to the app (your helper launches the browser)
    // Sign in to the app
    /*
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        slowMo: 2000,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

     */


    // Clean up any existing view with the same name
    await helpers.cleanUpMyView(page, { viewName });



    //--------------------------------
    // Act
    //--------------------------------


    /*
    // Hover `Select view` button
    await page.locator('#view-menu [role="button"]').first().hover();

    // Click `My Views`
    await page.getByText('My Views').first().click();

    // Click `Add view`
    await page.getByText('Add view').nth(1).click();

     */


//await waitUntilLoaded(page);



    // Hover `Select view` button
    await page.locator('#view-menu [role="button"]').first().hover();

    // Click `My Views`
    await page.getByText('My Views').first().click();

    // Click `Add view`
    await page.getByText('Add view').nth(1).click();





    // Fill in View Name
    await page.locator('#view_name').fill(viewName);

    // Select `Member Name` from Available Columns
    await page
        .locator('#available-columns-div')
        .getByRole('listbox')
        .getByText('Member Name')
        .click();

    // Click `Transfer To`
    await page.getByRole('button', { name: 'Transfer To' }).click();

    // Click `Save and Close`
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------

    // Verify newly created view is visible
    await expect(
        page.getByRole('gridcell', { name: viewName }).first()
    ).toBeVisible();

    // Verify correct column is present
    await expect(
        page.getByRole('gridcell', { name: 'Next Actions' }).first()
    ).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await browser.close(); // close the browser manually since your helper launched it
});
