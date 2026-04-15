// SearchForDashboard.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test('Search for a dashboard and verify details', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `SearchDashboard`;
    const dashboard = `Readmissions`;

    // Login
    const { page } = await logIn({ loginID });

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Reports & Letters` button
    await page.getByText(`Reports & Letters`).click();
    //await waitUntilLoaded(page);

    // Fill in search input
    await page
        .getByRole(`dialog`, { name: `Manage Reports & Letters` })
        .getByPlaceholder(`Search...`)
        .fill(dashboard);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Verify that the dashboard name is correct
    await expect(
        page.getByRole(`gridcell`, { name: dashboard })
    ).toBeVisible();

    // Verify that the check box is checked
    await expect(page.getByRole(`checkbox`)).toBeChecked();
});