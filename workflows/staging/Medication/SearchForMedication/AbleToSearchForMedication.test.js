// AbleToSearchForMedication.test.js

import { test, expect } from '@playwright/test';

// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test('Able to search for a medication and verify details', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `SearchMedication`;
    const brandName = `Amyvid`;
    const ndcProductCode = `0002-1200`;
    const genericName = `Florbetapir F`;

    // Login
    const { page } = await logIn({ loginID });

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await page.locator(`span`).filter({ hasText: `Tools` }).first().click();

    // Click `Medications` button
    await page.getByText(`Medications`).click();
    //await waitUntilLoaded(page);

    // Fill in search input field
    await page
        .getByRole(`dialog`, { name: `Manage Medication` })
        .getByPlaceholder(`Search...`)
        .fill(brandName);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();
    //await waitUntilLoaded(page);

    // Double-click the first row with the brand name
    await page.getByRole(`gridcell`, { name: brandName }).first().dblclick();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Verify that NDC Product Code is correct
    await expect(
        page
            .getByLabel(`Medication`, { exact: true })
            .getByText(ndcProductCode, { exact: true })
    ).toBeVisible();

    // Verify that the brand name is correct
    await expect(
        page
            .getByLabel(`Medication`, { exact: true })
            .getByText(brandName, { exact: true })
    ).toBeVisible();

    // Verify that the generic name is correct
    await expect(
        page.getByLabel(`Medication`, { exact: true }).getByText(genericName)
    ).toBeVisible();
});