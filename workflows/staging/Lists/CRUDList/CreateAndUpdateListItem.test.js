// CreateAndUpdateListItem.test.js

import { test, expect } from '@playwright/test';

// 🔧 Match your helpers location (consistent with prior tests)
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/**
 * This test:
 * 1) Logs in
 * 2) Navigates to Tools > Lists
 * 3) Randomly picks a list (avoiding some with special validations)
 * 4) Creates a new list item (code, active, description)
 * 5) Verifies in the grid and detail modal
 * 6) Updates the item (toggle Active off, update description)
 * 7) Verifies the updates in the grid and detail modal
 */

test('Create and update a List item', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `ListsCrud`;
    const code = `QAW${String(Date.now()).slice(0, 12)}`;
    const desc = `This was made from ${loginID} ${Date.now()}`;

    // Lists to try to avoid (these often require extra fields/validation flows)
    const obj = {
        'Authorization Service Request Type': [
            'Valid on Inpatient',
            'Valid on Outpatient',
            'Valid on Observation',
            'Valid on Referral',
        ],
        'Care Plan Problem Priority': ['Display Order', 'Display Color'],
        'Case Intensity': ['Display Order'],
        'Case Priority': ['Display Order'],
        'Case Risk': ['Display Order'],
        'Case Opt Out': ['Display in Alerts'],
        'Case Status': ['Is Open'],
        'Compliance Level': ['Valid on Appeal', 'Valid on Grievances'],
        'Compliance Outcome': ['Valid on Appeal', 'Valid on Grievances'],
        'Compliance Priority': ['Valid on Appeal', 'Valid on Grievances'],
        'Compliance Status': ['Is Open', 'Valid on Appeal', 'Valid on Grievances'],
        'Compliance Submitted By': ['Valid on Appeal', 'Valid on Grievances'],
        'Coverage Status': ['Display Order'],
        'Do Not Call': ['Display in Alerts'],
        'Interpreter Flag': ['Display in Alerts'],
        'Message Topic': ['Queue Team'],
        'Next Action Priority': ['Display Order'],
        'PHI Restrictions Status': ['Display in Alerts'],
        'Program Opt Out': ['Display in Alerts'],
        Taxonomy: ['Classification', 'Specialization', 'Definition'],
    };

    // Log in
    //const { page } = await logIn({ loginID });


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    // Navigate to Tools > Lists
    await page.getByText(`Tools`).click();
    await page.getByText(`Lists`, { exact: true }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Act:
    //--------------------------------
    // Grab all the lists
    const lists = await page
        .locator(`[id="admin-navigation"] ul li`)
        .allInnerTexts();

    // Pick a random list, try to avoid those in `obj`
    let list = lists[Math.floor(Math.random() * lists.length)];
    let attempts = 0;
    while (obj[list] && attempts < 5) {
        attempts++;
        list = lists[Math.floor(Math.random() * lists.length)];
    }

    // Click the list
    await page.getByText(list, { exact: true }).click();
    await waitUntilLoaded(page);

    // Click the New button (using regex for robustness against &nbsp;)
    await page.getByRole(`button`, { name: /New/i }).click();
    await waitUntilLoaded(page);

    // Fill in Code
    await page.locator(`#code`).fill(code);

    // Check the Active checkbox
    await page.getByRole(`checkbox`, { name: `Active:` }).check();

    // Fill in Description
    await page.locator(`#description`).fill(desc);

    await waitUntilLoaded(page);

    // Click Save and Close button
    await page.getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Creation
    //--------------------------------
    // Assert that the list item is visible in the table
    await expect(page.getByRole(`gridcell`, { name: code })).toBeVisible();

    // Row Active column (td nth=2) is checked
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${code}") td >> nth=2 >> input`
        )
    ).toBeChecked();

    // Row code column (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${code}") td >> nth=3`
        )
    ).toContainText(code);

    // Row description column (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${code}") td >> nth=4`
        )
    ).toContainText(desc);

    // Open the item via double-click
    await page.getByRole(`gridcell`, { name: code }).dblclick();
    await waitUntilLoaded(page);

    // Detail view assertions
    await expect(page.locator(`#code`)).toHaveValue(code);
    await expect(page.getByRole(`checkbox`, { name: `Active:` })).toBeChecked();
    await expect(page.locator(`#description`)).toHaveValue(desc);

    //--------------------------------
    // Arrange (for update):
    //--------------------------------
    const descEdit = `This edit was made from ${loginID} ${Date.now()}`;

    //--------------------------------
    // Act: Update
    //--------------------------------
    // Uncheck Active
    await page.getByRole(`checkbox`, { name: `Active:` }).uncheck();

    // Update Description
    await page.locator(`#description`).fill(descEdit);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Updated in grid
    //--------------------------------
    // Row with code is visible
    await expect(page.getByRole(`gridcell`, { name: code })).toBeVisible();

    // Active (td nth=2) is NOT checked
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${code}") td >> nth=2 >> input`
        )
    ).not.toBeChecked();

    // Code (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${code}") td >> nth=3`
        )
    ).toContainText(code);

    // Description (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${code}") td >> nth=4`
        )
    ).toContainText(descEdit);

    // Open detail view again
    await page.getByRole(`gridcell`, { name: code }).dblclick();
    await waitUntilLoaded(page);

    // Assert detail values after update
    await expect(page.locator(`#code`)).toHaveValue(code);
    await expect(page.getByRole(`checkbox`, { name: `Active:` })).not.toBeChecked();
    await expect(page.locator(`#description`)).toHaveValue(descEdit);
});