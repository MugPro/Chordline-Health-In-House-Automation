// CreateAndUpdateNewProcedureCodeAuthorizationRate.test.js

import { test, expect } from '@playwright/test';


// 🔧 Update this path if your helpers live elsewhere
import {logIn, deactivateAllRateAuthorizations, waitUntilLoaded, logIn3} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";


/**
 * This test:
 * 1) Logs in
 * 2) Deactivates existing authorization rates matching the loginID
 * 3) Creates a new Procedure Code authorization rate
 * 4) Verifies creation via grid search
 * 5) Updates the description and company
 * 6) Verifies updates in the grid
 * 7) Cleans up by deactivating the created authorization
 */

test('Create and update new Procedure Code Authorization Rate', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `AuthorizationRate`;
    const bedLevelDesc = `${loginID}${Date.now()}`;
    const editedBedLevelDesc = bedLevelDesc + ' edited';
    //const company = `Excellent Health Plan`;
    const company = `company description`;
    //const updatedCompany = `Wonderful Health Plan`;
    const updatedCompany = `Excellent Health Plan`;
    const itemDesc = `0001F - HEART FAILURE`;
    const updatedItemDesc = `0001U - RBC DNA HEA 35 AG 11`;

    // Login
    /*
    const { page } = await logIn({
        loginID, slowMo: 450
    });

     */




    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url, slowMo: 450 });





    await waitUntilLoaded(page);

    // Clean-up baseline: deactivate all matching authorizations
    await deactivateAllRateAuthorizations(page, { description: loginID });

    //--------------------------------
    // Act: Create new Procedure Code authorization
    //--------------------------------
    // Click `Tools`
    await page.getByText(`Tools`).click();

    // Click `Companies`
    await page.getByText(`Companies`).click();

    // Click `Rates`
    await page.getByText(`Rates`).click();

    //await waitUntilLoaded(page);

    // Click `Authorizations` tab
    await page.getByLabel(`Manage Companies`).getByText(`Authorizations`).click();

    // Click `New`
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#grid-toolbar-new-button-menu`)
        .click();

    //await waitUntilLoaded(page);

    // Click `Procedure Code`
    await page.getByText(`Procedure Code`).click();

    //await waitUntilLoaded(page);

    // Fill in `Description`
    await page.locator(`#athr_description`).fill(bedLevelDesc);

    // Select `Company`
    await page.getByRole(`button`, { name: `expand combobox` }).first().click();
    //await waitUntilLoaded(page);
    //await page.getByRole(`option`, { name: company }).locator(`span`).click();

    await page.getByRole('option', { name: company }).first().click();

    //await waitUntilLoaded(page);

    // Close any open dropdown
    await page.keyboard.press('Enter');

    // Open Procedure Code lookup
    await page
        .locator(
            `[data-bind="attr: { data-table-code: fields.athr_link_id.lookupTableCode, data-filter-code: fields.athr_link_id.lookupFilterCode }"] [type="button"]`,
        )
        .click();

    //await waitUntilLoaded(page);

    // Select Procedure Code item
    await page.getByText(itemDesc).last().click();

    // Increase rate
    await page.getByRole(`button`, { name: `Increase value` }).click();

    //await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    //await waitUntilLoaded(page);

    // Search for created authorization
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .getByPlaceholder(`Search...`)
        .fill(bedLevelDesc);

    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#admin-search-button`)
        .click();

    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Verify creation
    //--------------------------------
    await expect(
        page.getByRole(`gridcell`, { name: bedLevelDesc }),
    ).toBeVisible();

    await expect(
        page.getByRole(`gridcell`, { name: company }),
    ).toBeVisible();

    await expect(
        page.getByRole(`gridcell`, { name: itemDesc }),
    ).toBeVisible();

    //--------------------------------
    // Act: Update Procedure Code authorization
    //--------------------------------
    // Open search result
    await page.getByRole(`gridcell`, { name: bedLevelDesc }).click();

    // Click Edit
    await page.getByRole(`button`, { name: `` }).click();

    //await waitUntilLoaded(page);

    // Update Description
    await page.locator(`#athr_description`).fill(editedBedLevelDesc);

    // Open Company lookup
    await page
        .locator(
            `[class="formField fieldcol1 rowFirst"]:has-text("Company") button:has-text("...")`,
        )
        .click();

    //await waitUntilLoaded(page);

    // Select updated company from lookup dialog
    await page
        .locator(
            `[role="dialog"]:has-text("Lookup") tbody tr:has-text("${updatedCompany}")`,
        )
        .click();

    //await waitUntilLoaded(page);

    // Click Select
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    //await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Verify updates
    //--------------------------------
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .getByPlaceholder(`Search...`)
        .fill(editedBedLevelDesc);

    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#admin-search-button`)
        .click();

    await expect(
        page.getByRole(`gridcell`, { name: editedBedLevelDesc }),
    ).toBeVisible();

    await expect(
        page.getByRole(`gridcell`, { name: updatedCompany }),
    ).toBeVisible();

});