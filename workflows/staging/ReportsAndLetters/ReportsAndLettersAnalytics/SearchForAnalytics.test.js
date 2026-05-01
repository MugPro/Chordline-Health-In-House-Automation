// SearchForAnalytics.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test('Search for an analytics and verify details', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `SearchMedication`;
    const analysis = `Readmissions`;

    // Login
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Reports & Letters` button
    await page.getByText(`Reports & Letters`).click();
    //await waitUntilLoaded(page);

    // Click `Analytics` tab
    await page
        .getByLabel(`Manage Reports & Letters`)
        .getByText(`Analytics`, { exact: true })
        .click();
    //await waitUntilLoaded(page);

    // Fill in search input
    await page
        .getByRole(`dialog`, { name: `Manage Reports & Letters` })
        .getByPlaceholder(`Search...`)
        .fill(analysis);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Verify that the analysis name is correct
    await expect(page.getByRole(`gridcell`, { name: `Readmissions` })).toBeVisible();

    // Verify that the check box is checked
    await expect(page.getByRole(`checkbox`)).toBeChecked();
});