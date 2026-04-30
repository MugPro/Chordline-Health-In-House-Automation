/* import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('Update view', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'ViewCRUD';
    const viewName = 'QAW View';
    const viewNameEdited = `${viewName} - edited`;

    // Sign in
    const { page, browser } = await helpers.logIn({
        url: env.DEFAULT_URL_2,
        loginID,
        password: env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act
    //--------------------------------

    // Open My Views menu
    await page.locator('#view-menu [role="button"]').first().hover();
    await page.getByText('My Views').first().click();
    await page.waitForTimeout(300); // wait for dropdown animation

    // Select the first matching view to edit
    const viewCell = page.getByText(viewName).first();
    await viewCell.scrollIntoViewIfNeeded();
    await viewCell.click();

    // Click Edit
    await page.getByRole('button', { name: '' }).click();

    // Update the view name
    await page.locator('#view_name').fill(viewNameEdited);

    // Adjust columns
    await page.getByRole('option', { name: 'Member Name' }).click();
    await page.getByRole('button', { name: 'Transfer From' }).click();
    await page.getByRole('option', { name: 'Priority' }).click();
    await page.getByRole('button', { name: 'Transfer To' }).click();

    // Save changes
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------

    // Original view name should no longer be visible
    await expect(
        page.getByRole('gridcell', { name: viewName, exact: true })
    ).not.toBeVisible();

    // Edited view name should be visible
    const editedViewCell = page.getByRole('gridcell', { name: viewNameEdited, exact: true }).first();
    await expect(editedViewCell).toBeVisible();

    // Verify that "Next Actions" column is visible
    await expect(page.getByRole('gridcell', { name: 'Next Actions' })).toBeVisible();

    // Re-open the edited view to verify selected columns
    await editedViewCell.scrollIntoViewIfNeeded();
    await editedViewCell.click();
    await page.getByRole('button', { name: '' }).click();

    // Verify that "Priority" is visible in Selected Columns
    await expect(page.getByRole('option', { name: 'Priority' })).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await browser.close();
});


 */




import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn} from "../../../../helpers/Node20Helpers.js";

test('Update My View', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = 'ViewCRUD';
    //const loginID = `emailUsers`;
    const viewName = 'QAW View';
    const viewNameEdited = `${viewName} - edited`;



    const { page, browser } = await logIn({
        loginID: 'SystemViewCRUD',
        password: 'fasdfafs123A@',
        slowMo: 800,
        url: 'https://qawolf2.tcshealthcare.com/login.jsp'
    });


    /*
    const { page, browser } = await helpers.logIn({
        url: env.DEFAULT_URL_2,
        loginID,
        password: env.DEFAULT_PASS_OCT_2025,
    });

     */






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
