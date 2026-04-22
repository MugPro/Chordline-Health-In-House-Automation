// CreateAndUpdateNewBedLevelAuthorizationRate.test.js

import { test, expect } from '@playwright/test';

// ⛳️ Adjust this import path to wherever your helpers live.
import { logIn, deactivateAllRateAuthorizations, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

/**
 * This test:
 * 1) Logs in.
 * 2) Deactivates all authorizations (cleanup baseline).
 * 3) Creates a new Bed Level authorization rate.
 * 4) Verifies creation via grid search.
 * 5) Edits the created record (description, company, bed level type).
 * 6) Verifies updates in the grid.
 * 7) Closes the dialog and performs cleanup by deactivating all authorizations again.
 */

test('Create and update new Bed Level Authorization Rate', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `AuthorizationRate`;
    const bedLevelDesc = `${Date.now()}WF`;
    const editedBedLevelDesc = bedLevelDesc + ' edited';
    //const updatedCompany = `Excellent Health Plan`;
    const updatedCompany = `company description`;
    //const company = `Wonderful Health Plan`;
    const company = `company description`;
    const itemDesc = `Behavioral Health`;
    const updatedItemDesc = `ICU`;

    // Login
    const { page } = await logIn({ loginID, slowMo: 450 });
    await waitUntilLoaded(page);

    // Clean-up baseline: deactivate all authorizations in rates tab
    await deactivateAllRateAuthorizations(page);

    //await waitUntilLoaded(page);

    //--------------------------------
    // Act: Create a new Bed Level authorization rate
    //--------------------------------
    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Companies` button
    await page.getByText(`Companies`).click();

    //await waitUntilLoaded(page);

    // Click `Rates` button
    await page.getByText(`Rates`).click();

    //await waitUntilLoaded(page);

    // Click `Authorizations` tab
    await page.getByLabel(`Manage Companies`).getByText(`Authorizations`).click();



    // Click `+New` button
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#grid-toolbar-new-button-menu`)
        .click();


    //await waitUntilLoaded(page);

    // Click `Bed Level` button
    await page.getByText(`Bed Level`, { exact: true }).click();

    //await waitUntilLoaded(page);

    // Fill in `Description` input field
    await page.locator(`#athr_description`).fill(bedLevelDesc);

    // Fill in `Company` input field (open dropdown)
    await page.getByRole(`button`, { name: `expand combobox` }).first().click();

    // Click `Company description` from dropdown menu
    //await page.getByRole(`option`, { name: company }).locator(`span`).click();

    await page.getByRole('option', { name: company }).first().click();

    // Click `Bed Level Type` down chevron
    await page.getByRole(`button`, { name: `expand combobox` }).nth(1).click();

    // Click `Behavioral Health` from dropdown menu
    await page.getByText(`Behavioral Health`).last().click();

    // Click to increase rate
    await page.getByRole(`button`, { name: `Increase value` }).click();

    //await waitUntilLoaded(page);

    // Click `Save and Close` button
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    //await waitUntilLoaded(page);

    // Fill in `Search` input field
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .getByPlaceholder(`Search...`)
        .fill(bedLevelDesc);

    // Click `Search` button
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#admin-search-button`)
        .click();

   // await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Verify creation
    //--------------------------------
    // Verify that the description is visible in search result row
    await expect(page.getByRole(`gridcell`, { name: bedLevelDesc })).toBeVisible();

    // Verify that the company description is visible in search result row
    await expect(page.getByRole(`gridcell`, { name: company })).toBeVisible();




    //--------------------------------
    // Act: Edit the created record
    //--------------------------------
    // Click search result
    await page.getByRole(`gridcell`, { name: bedLevelDesc }).click();

    //await waitUntilLoaded(page);

    // Click edit button
    await page.getByRole(`button`, { name: `` }).click();

    //await waitUntilLoaded(page);

    // Update Description input field
    await page.locator(`#athr_description`).fill(editedBedLevelDesc);

    // Fill in `Company` input field (open dropdown)
    await page.getByRole(`button`, { name: `expand combobox` }).first().click();

    // Click `Company description` from dropdown menu
    //await page.getByRole(`option`, { name: company }).locator(`span`).click();

    await page.getByRole('option', { name: updatedCompany }).first().click();

    // Click `Bed level type` down chevron
    await page.getByRole(`button`, { name: `expand combobox` }).nth(1).click();

    // Click `ICU` from dropdown menu
    await page.getByText(`ICU`, { exact: true }).click();

    //await waitUntilLoaded(page);

    // Click `Save and Close` button
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Verify updates
    //--------------------------------
    // Ensure the search input still has the value (or reapply in case grid refreshes)
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .getByPlaceholder(`Search...`)
        .fill(editedBedLevelDesc);
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#admin-search-button`)
        .click();



   // await waitUntilLoaded(page);

    // Verify that the UPDATED description is visible in search result row
    await expect(
        page.getByRole(`gridcell`, { name: editedBedLevelDesc })
    ).toBeVisible();

    // Verify that the UPDATED company description is visible in search result row
    await expect(
        page.getByRole(`gridcell`, { name: updatedCompany })
    ).toBeVisible();

    // Verify that the UPDATED item is visible in search result row
    await expect(
        page.getByRole(`gridcell`, { name: updatedItemDesc })
    ).toBeVisible();

/*

    //await waitUntilLoaded(page);

    //--------------------------------
    // Clean-up:
    //--------------------------------
    // Click `Close` button
    await page.getByText(`Close`, { exact: true }).click();

    //await waitUntilLoaded(page);

    // Deactivate all authorizations in rates tab
    await deactivateAllRateAuthorizations(page);

 */
});