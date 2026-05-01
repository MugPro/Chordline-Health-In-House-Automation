// CreateAndUpdateNewUnit.test.js

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
 * 3) Creates a new Unit rate (random company, units, rate)
 * 4) Verifies creation in grid and modal
 * 5) Edits the Unit rate (description, units, rate)
 * 6) Verifies updates in grid and modal
 */

test('Create and update new Unit rate', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `CompRateWorkUnit`;
    const desc = `${loginID}${Date.now()}`;
    const company = ['Excellent Health Plan', 'Wonderful Health Plan'][
        Math.floor(Math.random() * 2)
        ];

    const rate = String(
        faker.number.float({ min: 1, max: 2000, fractionDigits: 2 })
    );
    const formatRate = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(rate));

    const units = String(faker.number.int({ min: 1, max: 999 }));

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

    // Choose "Unit"
    await page.getByText(`Unit`, { exact: true }).click();

    await waitUntilLoaded(page);

    // Description
    await page.locator(`#cort_description`).fill(desc);

    // Company
    await page.locator(`input[name="cort_company_id_input"]`).fill(company);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: company }).click();

    // Units
    await page.getByRole(`spinbutton`).first().click();
    await page.locator(`#cort_item`).fill(units);

    // Rate
    await page.getByRole(`spinbutton`, { name: `$` }).click();
    await page.locator(`#cort_rate`).fill(rate);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search for created description
    await page
        .getByRole(`tabpanel`, { name: `Work Logs` })
        .getByPlaceholder(`Search...`)
        .fill(desc);
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Creation
    //--------------------------------
    // Row visible
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

    // Item column (units) (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=5`
        )
    ).toContainText(units);

    // Rate column (td nth=6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=6`
        )
    ).toContainText(formatRate);

    // Open modal via double-click
    await page.getByRole(`gridcell`, { name: desc }).dblclick();

    await waitUntilLoaded(page);

    // Modal assertions
    const unitModal = page.getByLabel(`Rate - Unit #`);
    await expect(unitModal.getByText(desc)).toBeVisible();
    await expect(unitModal.getByText(company)).toBeVisible();
    await expect(unitModal.getByText(formatRate)).toBeVisible();

    // Units persist on modal (input value)
   // await expect(page.locator(`#cort_item`)).toHaveValue(units);


// ✅ FIX: Units persist on modal as text, not an input
    //await expect(page.locator(`#cort_item`)).toContainText(units);
    await expect(page.locator('#cort_item')).toContainText(units);






    //--------------------------------
    // Arrange: Edit values
    //--------------------------------
    const descEdit = `${loginID}${Date.now()}`;
    const rateEdit = String(
        faker.number.float({ min: 1, max: 2000, fractionDigits: 2 })
    );
    const formatRateEdit = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(Number(rateEdit));
    const unitsEdit = String(faker.number.int({ min: 1, max: 999 }));

    //--------------------------------
    // Act: Update
    //--------------------------------
    await page.getByRole(`button`, { name: ` Edit` }).click();

    await waitUntilLoaded(page);

    // Update Description
    await page.locator(`#cort_description`).fill(descEdit);

    // Update Units
    await page.getByRole(`spinbutton`, { name: units, exact: true }).click();
    await page.locator(`#cort_item`).fill(unitsEdit);

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
    // Row visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${descEdit}")`)
    ).toBeVisible();

    // Company column (unchanged) (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=3`
        )
    ).toContainText(company);

    // Description column (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=4`
        )
    ).toContainText(descEdit);

    // Item column (units) (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=5`
        )
    ).toContainText(unitsEdit);

    // Rate column (td nth=6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=6`
        )
    ).toContainText(formatRateEdit);

    // Open edited modal
    await page.getByRole(`gridcell`, { name: descEdit }).dblclick();

    await waitUntilLoaded(page);

    // Modal assertions for edited values
    await expect(unitModal.getByText(descEdit)).toBeVisible();
    await expect(unitModal.getByText(company)).toBeVisible();
    await expect(unitModal.getByText(formatRateEdit)).toBeVisible();

    // Units persist after edit
    await expect(page.locator('#cort_item')).toContainText(unitsEdit);

});