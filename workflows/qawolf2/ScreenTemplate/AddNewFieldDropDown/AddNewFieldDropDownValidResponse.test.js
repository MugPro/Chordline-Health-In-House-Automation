/*import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';









test('AddNewFieldDropDownValidResponse', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ValidResponse`;
    const screenTemplateGroup = `Medical Review - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;

    const validResponses = ["Option 1", "Option 2", "Option 3"];
    const randomResponse =
        validResponses[Math.floor(Math.random() * validResponses.length)];

    const { page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Clean up before test
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        screenTemplateGroup,
        defaultTemplate,
    });

    //--------------------------------
    // Act
    //--------------------------------

    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page
        .getByRole(`gridcell`, { name: copyTemplate })
        .click();

    await page.getByRole(`button`, { name: `` }).click(); // Edit

    await page.getByRole(`button`, { name: ` Field` }).click();

    await page.getByText(`Radio Button`).nth(1).click();

    await page.getByRole(`option`, { name: ` Drop Down` })
        .locator(`div`)
        .click();

    await page.getByRole(`button`, { name: `Add`, exact: true }).click();

    await page.getByRole(`button`, { name: ` Valid Response` }).click();

    await page
        .getByRole(`tabpanel`, { name: `Field Editor` })
        .getByRole(`textbox`)
        .nth(1)
        .fill(randomResponse);

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert – Verify dropdown contains random value
    //--------------------------------











    await helpers.waitUntilLoaded(page);

    // Optional: wait for spinner/overlay to disappear
    try {
        await page.locator('.k-loading-mask').waitFor({ state: 'hidden', timeout: 5000 });
    } catch {}




    // Click the dropdown arrow to open options
    const dropdown = page.getByRole('combobox').first();
    const dropdownArrow = dropdown.getByRole('button', { name: 'select' });
    await dropdownArrow.click({ force: true });

// Retry for visible popup containing the text
    const randomOption = randomResponse; // e.g., "Option 2"
    let optionClicked = false;
    const timeoutMs = 5000;
    const pollInterval = 200;
    const startTime = Date.now();

    while (!optionClicked && Date.now() - startTime < timeoutMs) {
        // Find any visible popup
        const popups = page.locator('.k-list-container').filter({ hasText: randomOption });
        const count = await popups.count();

        for (let i = 0; i < count; i++) {
            const popup = popups.nth(i);
            if (await popup.isVisible()) {
                // Click the element inside popup that contains the text
                await popup.locator(`text=${randomOption}`).click({ force: true });
                optionClicked = true;
                break;
            }
        }

        if (!optionClicked) {
            await page.waitForTimeout(pollInterval);
        }
    }

    if (!optionClicked) {
        throw new Error(`Failed to click dropdown option: ${randomOption}`);
    }

// Verify selection
    await expect(dropdown).toHaveText(randomOption);






    //--------------------------------
    // Clean-up
    //--------------------------------
    // Close Preview and modals safely
    try {
        await page.getByRole(`button`, { name: ` Close` }).click();
    } catch {}
    try {
        await page.getByLabel(`Edit Screen - Internal`).getByText(`Close`, { exact: true }).click();
    } catch {}
    try {
        await page.getByText(`Close`, { exact: true }).click();
    } catch {}

    // Clean up the copied template
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await page.context().browser().close();
});

 */















/*

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

// ------------------------------
// Helper: wait until page is loaded & dropdown is ready
// ------------------------------
export async function waitUntilLoaded(page) {
    // Wait for no loading masks
    try {
        await page.locator('.k-loading-mask').waitFor({ state: 'hidden', timeout: 15000 });
    } catch {}

    // Wait until any dialog is stable (not just Preview)
    const dialogs = page.locator('[role="dialog"]');
    const count = await dialogs.count();
    for (let i = 0; i < count; i++) {
        const dlg = dialogs.nth(i);
        if (await dlg.isVisible()) {
            await dlg.waitFor({ state: 'attached', timeout: 10000 });
        }
    }

    // Small pause to allow dropdowns to fully render
    await page.waitForTimeout(500);
}


test('AddNewFieldDropDownValidResponse', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ValidResponse`;
    const screenTemplateGroup = `Medical Review - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;

    const validResponses = ["Option 1", "Option 2", "Option 3"];
    const randomResponse =
        validResponses[Math.floor(Math.random() * validResponses.length)];

    const { page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Clean up before test
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        screenTemplateGroup,
        defaultTemplate,
    });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page
        .getByRole(`gridcell`, { name: copyTemplate })
        .click();

    await page.getByRole(`button`, { name: `` }).click(); // Edit
    await page.getByRole(`button`, { name: ` Field` }).click();
    await page.getByText(`Radio Button`).nth(1).click();
    await page.getByRole(`option`, { name: ` Drop Down` }).locator(`div`).click();
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();
    await page.getByRole(`button`, { name: ` Valid Response` }).click();
    await page.getByRole(`tabpanel`, { name: `Field Editor` })
        .getByRole(`textbox`)
        .nth(1)
        .fill(randomResponse);

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert – Verify dropdown contains random value
    //--------------------------------
    await waitUntilLoaded(page);


    const dropdown = page.getByRole('combobox').first();
    const dropdownArrow = dropdown.getByRole('button', { name: 'select' });
    await dropdownArrow.click({ force: true });

// Retry loop to safely click option
    const randomOption = randomResponse;
    let optionClicked = false;
    const timeoutMs = 10000; // give Kendo enough time
    const pollInterval = 200;
    const startTime = Date.now();

    while (!optionClicked && Date.now() - startTime < timeoutMs) {
        const popups = page.locator('.k-list-container.k-popup.k-dropdownlist-popup')
            .filter({ hasText: randomOption });
        const count = await popups.count();

        for (let i = 0; i < count; i++) {
            const popup = popups.nth(i);
            if (await popup.isVisible()) {
                const option = popup.getByText(randomOption);
                if (await option.isVisible()) {
                    await option.click({ force: true });
                    optionClicked = true;
                    break;
                }
            }
        }

        if (!optionClicked) {
            await page.waitForTimeout(pollInterval);
        }
    }

    if (!optionClicked) {
        // Debug info
        const visiblePopups = await page.locator('.k-list-container.k-popup.k-dropdownlist-popup').allTextContents();
        console.error('Visible dropdown popups:', visiblePopups);
        throw new Error(`Failed to click dropdown option: ${randomOption}`);
    }

    await expect(dropdown).toHaveText(randomOption);






    //--------------------------------
    // Clean-up
    //--------------------------------
    try { await page.getByRole(`button`, { name: ` Close` }).click(); } catch {}
    try { await page.getByLabel(`Edit Screen - Internal`).getByText(`Close`, { exact: true }).click(); } catch {}
    try { await page.getByText(`Close`, { exact: true }).click(); } catch {}

    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await page.context().browser().close();
});


 */

















/*

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

// Clean and safe wait
export async function waitUntilLoaded(page) {
    try {
        await page.locator('.k-loading-mask').waitFor({ state: 'hidden', timeout: 10000 });
    } catch {}

    await page.waitForTimeout(500); // allow Kendo rendering
}

test('AddNewFieldDropDownValidResponse', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ValidResponse`;
    const screenTemplateGroup = `Medical Review - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;

    const validResponses = ["Option 1", "Option 2", "Option 3"];
    const randomResponse =
        validResponses[Math.floor(Math.random() * validResponses.length)];

    const { page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        screenTemplateGroup,
        defaultTemplate,
    });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: copyTemplate }).click();
    await page.getByRole(`button`, { name: `` }).click(); // Edit
    await page.getByRole(`button`, { name: ` Field` }).click();
    await page.getByText(`Radio Button`).nth(1).click();
    await page.getByRole(`option`, { name: ` Drop Down` }).locator(`div`).click();
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();
    await page.getByRole(`button`, { name: ` Valid Response` }).click();

    await page
        .getByRole(`tabpanel`, { name: `Field Editor` })
        .getByRole(`textbox`)
        .nth(1)
        .fill(randomResponse);

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert – Verify dropdown contains random value
    //--------------------------------
    await waitUntilLoaded(page);






    const previewDialog = page
        .getByRole('dialog', { name: 'Edit Screen - Internal' })
        .first();

    await previewDialog.waitFor({ state: 'visible', timeout: 10000 });

// Get the LAST dropdown (your newly added one)
    const dropdown = previewDialog.locator('.k-dropdownlist').last();

    await dropdown.scrollIntoViewIfNeeded();

// Click dropdown to open popup
    await dropdown.click();

// Wait for Kendo popup (global popup container)
    const popup = page.locator('.k-animation-container:visible').last();
    await popup.waitFor({ state: 'visible', timeout: 5000 });

// Click your random option inside popup
    await popup.getByText(randomResponse, { exact: true }).click();

// Verify selected value
    const selectedValue = dropdown.locator('.k-input-value-text');
    await expect(selectedValue).toHaveText(randomResponse);





    //--------------------------------
    // Clean-up
    //--------------------------------
    try {
        await page.getByRole(`button`, { name: ` Close` }).click();
    } catch {}
    try {
        await page.getByLabel(`Edit Screen - Internal`)
            .getByText(`Close`, { exact: true })
            .click();
    } catch {}
    try {
        await page.getByText(`Close`, { exact: true }).click();
    } catch {}

    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await page.context().browser().close();
});


 */













/*
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

test('AddNewFieldDropDownValidResponse', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ValidResponse`;
    const screenTemplateGroup = `Medical Review - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;

    const validResponses = ["Option 1", "Option 2", "Option 3"];
    const randomResponse = validResponses[Math.floor(Math.random() * validResponses.length)];

    const { page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    // Clean up before test
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        screenTemplateGroup,
        defaultTemplate,
    });

    //--------------------------------
    // Act – Create field and add valid response
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: copyTemplate }).click();
    await page.getByRole(`button`, { name: `` }).click(); // Edit
    await page.getByRole(`button`, { name: ` Field` }).click();
    await page.getByText(`Radio Button`).nth(1).click();
    await page.getByRole(`option`, { name: ` Drop Down` }).locator(`div`).click();
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();
    await page.getByRole(`button`, { name: ` Valid Response` }).click();

    // Fill the random valid response
    await page.getByRole(`tabpanel`, { name: `Field Editor` })
        .getByRole(`textbox`)
        .nth(1)
        .fill(randomResponse);

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert – Select and verify dropdown value
    //--------------------------------

    // Click the Drop Down input field (span inside combobox)
    await page
        .getByRole('combobox')
        .filter({ hasText: 'Option' })
        .locator('span')
        .nth(1)
        .click();

    // Verify the random option is visible
    await expect(
        page.getByRole('combobox', { hasText: randomResponse }).first()
    ).toBeVisible();

    // Click dropdown arrow (chevron)
    await page
        .getByRole('combobox')
        .filter({ hasText: 'Option' })
        .getByLabel('select')
        .click();

    // Click the random option inside the dropdown
    await page
        .getByRole('option', { name: randomResponse })
        .locator('span')
        .click();

    // Verify the dropdown displays the selected option
    await expect(
        page.getByRole('combobox').filter({ hasText: randomResponse })
    ).toBeVisible();

    //--------------------------------
    // Clean-up – Close modals and remove copied template
    //--------------------------------
    try { await page.getByRole(`button`, { name: ` Close` }).click(); } catch {}
    try { await page.getByLabel(`Edit Screen - Internal`).getByText(`Close`, { exact: true }).click(); } catch {}
    try { await page.getByText(`Close`, { exact: true }).click(); } catch {}

    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await page.context().browser().close();
});


 */










import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";






// Helper: wait for optional loading spinner
async function waitForLoader(page) {
    const loader = page.locator('#loading');
    if (await loader.count() > 0) {
        try {
            // Wait briefly if loader appears
            await loader.waitFor({ state: 'visible', timeout: 3000 });
            // Wait for it to disappear
            await loader.waitFor({ state: 'hidden', timeout: 10000 });
        } catch {
            // Ignore if it never appears or hides
        }
    }
}


test('AddNewFieldDropDownValidResponse', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `ValidResponse`;
    const screenTemplateGroup = `Medical Review - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;

    const validResponses = ["Option 1", "Option 2", "Option 3"];
    const randomResponse = validResponses[Math.floor(Math.random() * validResponses.length)];


    //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });

    // Clean up before test
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        screenTemplateGroup,
        defaultTemplate,
    });

    //--------------------------------
    // Act – Create field and add valid response
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: copyTemplate }).click();
    await page.getByRole(`button`, { name: `` }).click(); // Edit
    await page.getByRole(`button`, { name: ` Field` }).click();
    await page.getByText(`Radio Button`).nth(1).click();
    await page.getByRole(`option`, { name: ` Drop Down` }).locator(`div`).click();
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();
    await page.getByRole(`button`, { name: ` Valid Response` }).click();

    // Fill the random valid response
    await page.getByRole(`tabpanel`, { name: `Field Editor` })
        .getByRole(`textbox`)
        .nth(1)
        .fill(randomResponse);

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert – Select and verify dropdown value
    //--------------------------------

    // Click the Drop Down input field (span inside combobox)
    await page
        .getByRole('combobox')
        .filter({ hasText: 'Option' })
        .locator('span')
        .nth(1)
        .click();

    // Short delay to ensure dropdown popup appears
    await page.waitForTimeout(500);

    // Click dropdown arrow (chevron) to open the options popup
    const dropdown = page.getByRole('combobox').filter({ hasText: 'Option' }).first();
    const dropdownArrow = dropdown.getByLabel('select');
    await dropdownArrow.click();

    // Wait for the dropdown popup container to become visible
    const popup = page.locator('.k-list-container.k-popup:visible').first();
    await popup.waitFor({ state: 'visible', timeout: 10000 });

    // Small delay to let UI stabilize and avoid immediate popup close
    await page.waitForTimeout(500);

    // Locate the option inside the popup
    const optionLocator = popup.getByText(randomResponse, { exact: true });

    // Hover over the option to simulate user interaction and keep popup open
    await optionLocator.hover();

    // Click the option
    await optionLocator.click();

    // Verify the dropdown displays the selected option
    await expect(
        page.getByRole('combobox').filter({ hasText: randomResponse })
    ).toBeVisible();

    //--------------------------------
    // Clean-up – Close modals and remove copied template
    //--------------------------------

    // Close Preview modal if still open
    try {
        await page.getByRole('button', { name: ' Close' }).click();
    } catch {}







    /*
    // Close Edit Screen - Internal modal after preview
    const editScreenModal = page.getByLabel('Edit Screen - Internal');
    if (await editScreenModal.count() > 0) {
        const closeButton = editScreenModal
            .getByRole('button', { name: 'Close', exact: true })
            .first(); // <- pick first button to avoid strict mode
        if (await closeButton.count() > 0) {
            await closeButton.click();
            // Wait until the modal is fully hidden
            await editScreenModal.waitFor({ state: 'hidden', timeout: 5000 });
        }
    }

    // Fallback: any remaining Close button on page
    try {
        const fallbackClose = page.getByRole('button', { name: 'Close', exact: true }).first();
        if (await fallbackClose.count() > 0) {
            await fallbackClose.click();
        }
    } catch {}

     */



















    // Close Edit Screen - Internal modal after preview (robust)
    const editScreenModal = page.getByLabel('Edit Screen - Internal');
    if (await editScreenModal.count() > 0) {
        const closeButtons = editScreenModal.getByRole('button', { name: 'Close', exact: true });
        if (await closeButtons.count() > 0) {
            // Click the first Close button to avoid strict mode violation
            await closeButtons.first().click();

            // Wait until the modal is fully hidden
            try {
                await editScreenModal.waitFor({ state: 'hidden', timeout: 7000 });
            } catch {
                // If modal doesn’t disappear, continue to avoid blocking the test
            }
        }
    }

    await waitForLoader(page);


// Fallback: any remaining Close button on page
    try {
        const fallbackClose = page.getByRole('button', { name: 'Close', exact: true }).first();
        if (await fallbackClose.count() > 0) {
            await fallbackClose.click();
        }
    } catch {}



    /*
    // Remove copied screen template
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await page.context().browser().close();

     */

    await browser.close();

});
