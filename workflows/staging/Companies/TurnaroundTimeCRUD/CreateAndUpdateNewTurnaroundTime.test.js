// CreateAndUpdateNewTurnaroundTime.test.js

import { test, expect } from '@playwright/test';

// 🔧 Update this path to match your helpers location (mirrors your last passing test)
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

// Random data generator
import { faker } from '@faker-js/faker';

/**
 * This test:
 * 1) Logs in
 * 2) Navigates to Tools > Companies > Turnaround Time
 * 3) Creates a new TAT (name, description, comment)
 * 4) Verifies creation in the grid and modal
 * 5) Edits description and comment
 * 6) Verifies updates in the grid and modal
 */

test('Create and update new Turnaround Time', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `CompTATCrud`;
    const name1 = `${loginID}${Date.now()}`;
    const desc = faker.lorem.sentence();
    const comment = faker.lorem.sentence();

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Companies > Turnaround Time
    await page.getByText(`Tools`).hover();
    await page.getByText(`Companies`).click();
    await page.getByText(`Turnaround Time`).click();
    //await waitUntilLoaded(page);

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the New button
    await page.getByRole(`button`, { name: `   New` }).click(); // note: some fonts render &nbsp; as a space
    await waitUntilLoaded(page);

    // Fill in Name
    await page.locator(`#tat_detail_name`).fill(name1);

    // Fill in Description
    await page.locator(`#tat_detail_description`).fill(desc);

    // Fill in Comment
    await page.locator(`#tat_detail_comment`).fill(comment);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search by name1
    await page
        .getByRole(`dialog`, { name: `Manage Companies` })
        .getByPlaceholder(`Search...`)
        .fill(name1);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Creation
    //--------------------------------
    // Assert the row with name1 is visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${name1}")`)
    ).toBeVisible();

    // Assert the Name (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${name1}") td >> nth=3`
        )
    ).toContainText(name1);

    // Assert the Description (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${name1}") td >> nth=4`
        )
    ).toContainText(desc);

    // Assert the Comment (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${name1}") td >> nth=5`
        )
    ).toContainText(comment);

    // Open modal via double-click on the row cell with name
    await page.getByRole(`gridcell`, { name: name1 }).dblclick();
    await waitUntilLoaded(page);

    // Modal assertions
    const tatModal = page.getByLabel(`Turnaround Time`);
    await expect(tatModal.getByText(name1)).toBeVisible();
    await expect(tatModal.getByText(desc)).toBeVisible();
    await expect(tatModal.getByText(comment)).toBeVisible();

    //--------------------------------
    // Arrange: Edit values
    //--------------------------------
    const descEdit = faker.lorem.sentence();
    const commentEdit = faker.lorem.sentence();

    //--------------------------------
    // Act: Update
    //--------------------------------
    // Click Edit
    await page.getByRole(`button`, { name: ` Edit` }).click();
    await waitUntilLoaded(page);

    // Update Description
    await page.locator(`#tat_detail_description`).fill(descEdit);

    // Update Comment
    await page.locator(`#tat_detail_comment`).fill(commentEdit);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Re-search by name1
    await page
        .getByRole(`dialog`, { name: `Manage Companies` })
        .getByPlaceholder(`Search...`)
        .fill(name1);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Updates
    //--------------------------------
    // Assert the row with name1 is visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${name1}")`)
    ).toBeVisible();

    // Name remains (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${name1}") td >> nth=3`
        )
    ).toContainText(name1);

    // Updated Description (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${name1}") td >> nth=4`
        )
    ).toContainText(descEdit);

    // Updated Comment (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${name1}") td >> nth=5`
        )
    ).toContainText(commentEdit);

    // Open modal again
    await page.getByRole(`gridcell`, { name: name1 }).dblclick();
    await waitUntilLoaded(page);

    // Modal assertions for edited values
    await expect(tatModal.getByText(name1)).toBeVisible();
    await expect(tatModal.getByText(descEdit)).toBeVisible();
    await expect(tatModal.getByText(commentEdit)).toBeVisible();
});
