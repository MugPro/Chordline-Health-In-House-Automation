import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn, logIn3} from "../../../../helpers/Node20Helpers.js";

test('Update a System View', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SystemViewCRUD`;
    const viewName = `QAWolf view name`;
    const viewNameEdited = `${viewName} - edited`;

    // Sign in to the app (your helper launches the browser)
    /*
    const { page, browser } = await helpers.logIn({
        url: env.DEFAULT_URL_2,
        loginID,
        password: env.DEFAULT_PASS_OCT_2025,
    });

     */



    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 800,
    });



    //--------------------------------
    // Act
    //--------------------------------

    // Hover `Select view` button
    await page.locator('#view-menu [role="button"]').first().hover();

    // Click `My Views` to open dropdown
    await page.getByText('My Views').first().click();

    // Click `Manage Views` to open the modal
    await page.getByText('Manage Views').click();

    // Inside modal: click `My Views` tab
    const manageDialog = page.getByRole('dialog', { name: 'Manage Views' });
    await manageDialog.getByText('My Views').click();

    // Search for the view inside My Views
    await manageDialog.getByPlaceholder('Search...').fill(viewName);
    await page.locator('#admin-search-button').click();

    // Click the view to edit
    const viewCell = manageDialog.getByRole('gridcell', { name: viewName }).first();
    await viewCell.scrollIntoViewIfNeeded();
    await viewCell.click();

    // Click Edit
    await page.getByRole('button', { name: '' }).click();

    // Update view name
    await page.locator('#view_name').fill(viewNameEdited);






    await page.getByRole('button', { name: ' Save and Close' }).click();


    //--------------------------------
    // Assert
    //--------------------------------
    await expect(
        manageDialog.getByRole('gridcell', { name: viewName, exact: true })
    ).not.toBeVisible();

    await expect(
        manageDialog.getByRole('gridcell', { name: viewNameEdited, exact: true }).first()
    ).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await browser.close();
});
