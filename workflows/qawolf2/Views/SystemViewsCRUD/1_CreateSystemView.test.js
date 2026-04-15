import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Create a System View', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SystemViewCRUD`;
    const viewName = `QAWolf view name`;
    const viewNameEdited = `${viewName} - edited`;

    // Sign in to the app (your helper launches the browser)
    const { page, browser } = await helpers.logIn({
        url: env.DEFAULT_URL_2,
        loginID,
        password: env.DEFAULT_PASS_OCT_2025,
    });

    // Clean up any existing view with the same name
    await helpers.cleanUpMyView(page, { viewName });

    //--------------------------------
    // Act
    //--------------------------------

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
        .getByRole('option')
        .getByText('Priority')
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
