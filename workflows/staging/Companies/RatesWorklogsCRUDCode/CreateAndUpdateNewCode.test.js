// CreateAndUpdateNewCode.test.js

import { test, expect } from '@playwright/test';

// 🔧 Update this path to match where your helpers live
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

// For random numbers/values
import { faker } from '@faker-js/faker';

/**
 * This test:
 * 1) Logs in
 * 2) Navigates to Tools > Companies > Codes (via Rates tree branch)
 * 3) Creates a new Code rate with randomized company/medical-code/rate
 * 4) Verifies the row and modal reflect the created values
 * 5) Edits the Code (description, medical code, rate)
 * 6) Verifies the updated row and modal reflect the edited values
 */

test('Create and update new Code rate', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `CompRateWorkCode`;
    const desc = `${loginID}${Date.now()}`;
    const company = ['Excellent Health Plan', 'Wonderful Health Plan'][
        Math.floor(Math.random() * 2)
        ];

    // Random rate and formatted currency
    const rate = faker.number.float({ min: 1, max: 2000, fractionDigits: 2 });
    const formatRate = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(rate);

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Companies > Codes (via Rates)
    await page.getByText(`Tools`).hover();
    await page.getByText(`Companies`).click();
    await page.getByRole(`treeitem`, { name: `Rates` }).locator(`span`).first().click();

    //await waitUntilLoaded(page);
    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click +New
    await page.locator(`#grid-toolbar-new-button-menu`).click();

    // Click Code option
    await page.getByText(`Code`, { exact: true }).click();

    await waitUntilLoaded(page);

    // Fill in Description
    await page.locator(`#cort_description`).fill(desc);

    // Fill in Company
    await page.locator(`input[name="cort_company_id_input"]`).fill(company);
    await page.getByRole(`option`, { name: company }).click();

    await page.getByRole('button', { name: 'expand combobox' }).nth(1).click();


    // Prepare to get Medical Code suggestions (ensure listbox is visible)
    const medCodeInput = page.locator(`input[name="cort_medical_code_id_input"]`);
    await medCodeInput.click();

    //await waitUntilLoaded(page);

    const medCodeOptions = page.locator(
        `[id="cort_medical_code_id-autocomplete_listbox"] li`
    );
    // Wait for the suggestion list to appear (if your app needs a type to trigger, you can type a space)
    await medCodeOptions.first().waitFor({ state: 'visible' });

    // Grab all available medical codes and pick a random one
    const medCodes = await medCodeOptions.allInnerTexts();
    const medCode = medCodes[Math.floor(Math.random() * medCodes.length)];



    // Fill in Medical Code and pick the option
    await medCodeInput.fill(medCode);
    await waitUntilLoaded(page);
    await page.getByText(medCode).click();

    // Fill in Rate
    await page.getByRole(`spinbutton`, { name: `$` }).click();
    await page.locator(`#cort_rate`).fill(String(rate));

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search for the created description
    await page
        .getByRole(`tabpanel`, { name: `Work Logs` })
        .getByPlaceholder(`Search...`)
        .fill(desc);
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Creation
    //--------------------------------
    // Assert the Code rate row is visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${desc}")`)
    ).toBeVisible();

    // Assert the Company appears in the row (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=3`
        )
    ).toContainText(company);

    // Assert the Description appears in the row (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=4`
        )
    ).toContainText(desc);

    // Assert the Item (medical code short) appears in the row (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=5`
        )
    ).toContainText(medCode.split(' - ')[0]);

    // Assert the Rate appears in the row (td nth=6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${desc}") td >> nth=6`
        )
    ).toContainText(formatRate);

    // Double-click the row to open the "Rate - Code" modal
    await page.getByRole(`gridcell`, { name: desc }).dblclick();

    await waitUntilLoaded(page);

    // Modal assertions
    const rateCodeModal = page.getByLabel(`Rate - Code #`);
    await expect(rateCodeModal.getByText(desc)).toBeVisible();
    await expect(rateCodeModal.getByText(company)).toBeVisible();
    await expect(rateCodeModal.getByText(formatRate)).toBeVisible();
    await expect(rateCodeModal.getByText(medCode)).toBeVisible();

    //--------------------------------
    // Arrange: Edit values
    //--------------------------------
    const descEdit = `${loginID}${Date.now()}`;
    const rateEdit = faker.number.float({ min: 1, max: 2000, fractionDigits: 2 });
    const formatRateEdit = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(rateEdit);

    //--------------------------------
    // Act: Update
    //--------------------------------
    // Click Edit
    await page.getByRole(`button`, { name: ` Edit` }).click();

    await waitUntilLoaded(page);

    // Update Description
    await page.locator(`#cort_description`).fill(descEdit);

    // Clear and change Medical Code
    await page.locator(`[title="Clear"]`).last().click();

    await page.getByRole('button', { name: 'expand combobox' }).nth(1).click();


    // Ensure med code suggestions are present again
    await medCodeInput.click();
    await medCodeOptions.first().waitFor({ state: 'visible' });




    const medCodesEdit = await medCodeOptions.allInnerTexts();
    const medCodeEdit =
        medCodesEdit[Math.floor(Math.random() * medCodesEdit.length)];

    await medCodeInput.fill(medCodeEdit);
    await page.getByText(medCodeEdit).click();

    // Update Rate
    await page.getByRole(`spinbutton`, { name: `$` }).click();
    await page.locator(`#cort_rate`).fill(String(rateEdit));

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search for the edited description
    await page
        .getByRole(`tabpanel`, { name: `Work Logs` })
        .getByPlaceholder(`Search...`)
        .fill(descEdit);
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Updates
    //--------------------------------
    // Assert updated row is visible
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${descEdit}")`)
    ).toBeVisible();

    // Company should remain the same in the row (td nth=3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=3`
        )
    ).toContainText(company);

    // Updated Description (td nth=4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=4`
        )
    ).toContainText(descEdit);

    // Updated Item (medical code short) (td nth=5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=5`
        )
    ).toContainText(medCodeEdit.split(' - ')[0]);

    // Updated Rate (td nth=6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${descEdit}") td >> nth=6`
        )
    ).toContainText(formatRateEdit);

    // Double-click the row to open the modal again
    await page.getByRole(`gridcell`, { name: descEdit }).dblclick();

    await waitUntilLoaded(page);

    // Modal assertions for edited values
    await expect(rateCodeModal.getByText(descEdit)).toBeVisible();
    await expect(rateCodeModal.getByText(company)).toBeVisible();
    await expect(rateCodeModal.getByText(formatRateEdit)).toBeVisible();
    await expect(rateCodeModal.getByText(medCodeEdit)).toBeVisible();
});