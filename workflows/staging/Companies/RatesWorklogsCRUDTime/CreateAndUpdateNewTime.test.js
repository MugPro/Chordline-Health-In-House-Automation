// CreateAndUpdateNewTime.test.js

import { test, expect } from '@playwright/test';

// 🔧 Update this path to match your helpers location
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';

// Random data generator
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

/**
 * This test:
 * 1) Logs in
 * 2) Navigates to Tools > Companies > Rates
 * 3) Creates a new Time rate (random company, time unit, time, rate)
 * 4) Verifies creation in grid and modal
 * 5) Edits the Time rate (description, time unit, time, rate)
 * 6) Verifies updates in grid and modal
 */

test('Create and update new Time rate', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `CompRateWorkTime`;
    const desc = `${loginID}${Date.now()}`;
    const company = ['Excellent Health Plan', 'Wonderful Health Plan'][
        Math.floor(Math.random() * 2)
        ];
    const timeUnit = ['min', 'hr'][Math.floor(Math.random() * 2)];
    const time = String(
        timeUnit === 'min'
            ? faker.number.int({ min: 1, max: 59 })
            : faker.number.int({ min: 1, max: 24 })
    );
    const rate = String(faker.number.float({ min: 1, max: 10, fractionDigits: 2 }));

    // Log in
    //const { page } = await logIn({ loginID });


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });





    // Navigate to Tools > Companies > Rates
    await page.getByText(`Tools`).hover();
    await page.getByText(`Companies`).click();
    await page
        .getByRole(`treeitem`, { name: `Rates` })
        .locator(`span`)
        .first()
        .click();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // +New
    await page.locator(`#grid-toolbar-new-button-menu`).click();

    //await waitUntilLoaded(page);

    // Choose "Time"
    await page.getByText(`Time`, { exact: true }).click();

    await waitUntilLoaded(page);



    // Description
    await page.locator(`#cort_description`).fill(desc);

    // Company
    await page.locator(`input[name="cort_company_id_input"]`).fill(company);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: company }).click();

    // Time Unit
    await page.locator(`[aria-controls="cort_item_units_listbox"]`).click();
    await page.getByRole(`option`, { name: timeUnit }).click();

    // Time
    await page.locator(`#cort_item`).fill(time);

    // Rate
    await page.getByRole(`spinbutton`, { name: `$` }).click();
    await page.locator(`#cort_rate`).fill(rate);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search by description
    await page
        .getByRole(`tabpanel`, { name: `Work Logs` })
        .getByPlaceholder(`Search...`)
        .fill(desc);
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Creation
    //--------------------------------
    // Row is visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${desc}")`)
    ).toBeVisible();

    // Company column (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=3`
        )
    ).toContainText(company);

    // Description column (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=4`
        )
    ).toContainText(desc);

    // Item (time + unit) column (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=5`
        )
    ).toContainText(`${time} ${timeUnit}`);

    // Rate column (td nth=6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=6`
        )
    ).toContainText(String(rate));


    // Open modal via double-click
    await page.getByRole(`gridcell`, { name: desc }).dblclick();

    await waitUntilLoaded(page);

    // Modal assertions
    const timeModal = page.getByLabel(`Rate - Time #`);
    await expect(timeModal.getByText(desc)).toBeVisible();
    await expect(timeModal.getByText(company)).toBeVisible();
    await expect(timeModal.getByText(`${time} ${timeUnit}`)).toBeVisible();
    await expect(timeModal.getByText(rate)).toBeVisible();

    //--------------------------------
    // Arrange: Edit values
    //--------------------------------
    const descEdit = `${loginID}${Date.now()}`;
    const timeUnitEdit = ['min', 'hr'][Math.floor(Math.random() * 2)];
    const timeEdit = String(
        timeUnitEdit === 'min'
            ? faker.number.int({ min: 1, max: 59 })
            : faker.number.int({ min: 1, max: 24 })
    );
    const rateEdit = String(
        faker.number.float({ min: 1, max: 10, fractionDigits: 2 })
    );

    //--------------------------------
    // Act: Update
    //--------------------------------
    await page.getByRole(`button`, { name: ` Edit` }).click();

    await waitUntilLoaded(page);

    // Update Description
    await page.locator(`#cort_description`).fill(descEdit);

    // Update Time Unit
    await page.locator(`[aria-controls="cort_item_units_listbox"]`).click();
    await page.getByRole(`option`, { name: timeUnitEdit }).click();

    // Update Time
    await page.locator(`#cort_item`).fill(timeEdit);

    // Update Rate
    await page.getByRole(`spinbutton`, { name: `$` }).click();
    await page.locator(`#cort_rate`).fill(rateEdit);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search for edited record
    await page
        .getByRole(`tabpanel`, { name: `Work Logs` })
        .getByPlaceholder(`Search...`)
        .fill(descEdit);
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Updates
    //--------------------------------
    // Row is visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${descEdit}")`)
    ).toBeVisible();

    // Company column (unchanged)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=3`
        )
    ).toContainText(company);

    // Description column
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=4`
        )
    ).toContainText(descEdit);

    // Item column (time + unit)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=5`
        )
    ).toContainText(`${timeEdit} ${timeUnitEdit}`);

    // Rate column
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=6`
        )
    ).toContainText(String(rateEdit));

    // Modal assertions for edited values
    await page.getByRole(`gridcell`, { name: descEdit }).dblclick();

    await waitUntilLoaded(page);


    await expect(timeModal.getByText(descEdit)).toBeVisible();
    await expect(timeModal.getByText(company)).toBeVisible();
    await expect(timeModal.getByText(`${timeEdit} ${timeUnitEdit}`)).toBeVisible();
    await expect(timeModal.getByText(rateEdit)).toBeVisible();
});