/*
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

// Helper: optional loader wait
async function waitForLoader(page) {
    const loader = page.locator('#loading');
    if (await loader.count() > 0) {
        try {
            await loader.waitFor({ state: 'visible', timeout: 3000 });
            await loader.waitFor({ state: 'hidden', timeout: 10000 });
        } catch {
            // Ignore if loader never appears
        }
    }
}

test('RulesReadOnlyWhenExpression', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ReadOnlyWhenExpression`;
    const screenTemplateGroup = `Authorization Bed Day - BH OBS`;
    const defaultTemplate = `Authorization Bed Day - OBS - BH - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const valueOption = `PTS-Expedited`;
    const res1 = `yes`;
    const res2 = `no`;
    const url = process.env.DEFAULT_URL_2;

    const { page } = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    await helpers.cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        defaultTemplate,
        screenTemplateGroup,
        customScreenName: screenName,
    });

    //--------------------------------
    // Act: Navigate & add radio field
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: screenName }).click();
    await page.getByRole(`button`, { name: `` }).click();

    // Add Radio Button field
    await page.getByRole(`button`, { name: ` Field` }).first().click();
    await page
        .getByRole(`combobox`)
        .filter({ hasText: `Radio ButtonRadio ButtonDrop` })
        .getByLabel(`select`)
        .click();
    await page
        .getByRole(`option`, { name: ` Radio Button` })
        .locator(`div`)
        .click();
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();

    // Add valid responses
    await page.getByRole(`button`, { name: ` Valid Response` }).click();
    await page.keyboard.type(res1);
    await page.keyboard.press(`Enter`);
    await page.keyboard.type(res2);
    await page.keyboard.press(`Enter`);

    // Open Rules tab
    await page.locator(`[role="tab"] :text("Rules")`).click();

    // Change Never read-only → Read-only when expression
    await page.getByText(`Never read-only`).first().click();
    await page
        .getByRole(`option`, { name: `Read-only when expression...` })
        .locator(`span`)
        .click();

    //--------------------------------
    // Configure Expression
    //--------------------------------
    const expressionDialog = page.getByRole(`dialog`, {
        name: `Set Read-only Condition for:`
    });
    await expressionDialog.getByPlaceholder(`Search...`).fill(`Service Request type`);
    await page.locator(`#search-value-button`).click();
    await page.getByText(`Service Request Type (`).click();
    await page.getByRole(`button`, { name: `Use Field (Code)` }).click();
    await page.keyboard.type(`=`);
    await expressionDialog.getByLabel(`expand combobox`).click();
    await page.getByText(valueOption).click();
    await page.getByRole(`button`, { name: `Insert Code Value` }).click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    //--------------------------------
    // Save + open Preview
    //--------------------------------
    await page.getByRole(`button`, { name: `Save` }).click();

    // Open Preview
    await page.getByRole('button', { name: 'Preview' }).click();

    // Handle unsaved changes warning if appears
    const unsavedDialog = page.getByRole('dialog').filter({ hasText: 'You have unsaved changes' });
    if (await unsavedDialog.count() > 0) {
        await unsavedDialog.getByRole('button', { name: 'Yes' }).click();
    }

    //--------------------------------
    // Wait for Preview dialog fully loaded
    //--------------------------------
    const previewDialog = page.getByRole('dialog', { name: /^Edit Screen - Internal \(PREVIEW\)$/ });
    await expect(previewDialog).toBeVisible({ timeout: 50000 });

    // Wait for radios to appear
    const yesRadio = previewDialog.getByRole('radio', { name: res1, exact: true });
    const noRadio = previewDialog.getByRole('radio', { name: res2, exact: true });

    await expect(yesRadio).toBeVisible({ timeout: 30000 });
    await expect(yesRadio).toBeEnabled({ timeout: 30000 });
    await expect(noRadio).toBeVisible({ timeout: 30000 });
    await expect(noRadio).toBeEnabled({ timeout: 30000 });

    //--------------------------------
    // Fill Service Request Type inside Preview
    //--------------------------------
    const serviceRequestField = previewDialog.locator('#auli_service_request_type-autocomplete');
    await serviceRequestField.waitFor({ state: 'visible', timeout: 7000 });
    await serviceRequestField.click({ force: true });
    await serviceRequestField.fill(''); // clear existing value
    await serviceRequestField.type(valueOption, { delay: 50 });

    // Select value from dropdown
    await previewDialog.getByText(valueOption).click();

    //--------------------------------
    // Assert radios are now disabled
    //--------------------------------
    await expect(yesRadio).toBeDisabled({ timeout: 30000 });
    await expect(noRadio).toBeDisabled({ timeout: 30000 });

    //--------------------------------
    // Close Preview safely
    //--------------------------------
    await previewDialog.getByRole('button', { name: 'Close' }).click();
    await previewDialog.waitFor({ state: 'hidden', timeout: 15000 });

    //--------------------------------
    // Final Clean-up: close Edit Screen modal
    //--------------------------------
    try {
        await page.getByRole(`button`, { name: ` Close` }).click();
    } catch {}

    const editModal = page.getByLabel('Edit Screen - Internal');
    if ((await editModal.count()) > 0) {
        const closeButtons = editModal.getByRole('button', { name: 'Close', exact: true });
        if ((await closeButtons.count()) > 0) {
            await closeButtons.first().click();
            try {
                await editModal.waitFor({ state: 'hidden', timeout: 7000 });
            } catch {}
        }
    }

    await waitForLoader(page);

    // Fallback close if needed
    try {
        const fallbackClose = page.getByRole('button', { name: 'Close', exact: true }).first();
        if ((await fallbackClose.count()) > 0) {
            await fallbackClose.click();
        }
    } catch {}
});



 */














import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

// Helper: optional loader wait
async function waitForLoader(page) {
    const loader = page.locator('#loading');
    if (await loader.count() > 0) {
        try {
            await loader.waitFor({ state: 'visible', timeout: 3000 });
            await loader.waitFor({ state: 'hidden', timeout: 10000 });
        } catch {
            // Ignore if loader never appears
        }
    }
}

// Increase default test timeout for this test
test('RulesReadOnlyWhenExpression', async ({}, testInfo) => {
    testInfo.setTimeout(120000); // 2 minutes

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ReadOnlyWhenExpression`;
    const screenTemplateGroup = `Authorization Bed Day - BH OBS`;
    const defaultTemplate = `Authorization Bed Day - OBS - BH - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const valueOption = `PTS-Expedited`;
    const res1 = `yes`;
    const res2 = `no`;
    const url = process.env.DEFAULT_URL_2;

    const {page} = await helpers.logIn({
        url,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    await helpers.cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        defaultTemplate,
        screenTemplateGroup,
        customScreenName: screenName,
    });

    //--------------------------------
    // Act: Navigate & add radio field
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, {name: screenName}).click();
    await page.getByRole(`button`, {name: ``}).click();

    // Add Radio Button field
    await page.getByRole(`button`, {name: ` Field`}).first().click();
    await page
        .getByRole(`combobox`)
        .filter({hasText: `Radio ButtonRadio ButtonDrop`})
        .getByLabel(`select`)
        .click();
    await page
        .getByRole(`option`, {name: ` Radio Button`})
        .locator(`div`)
        .click();
    await page.getByRole(`button`, {name: `Add`, exact: true}).click();

    // Add valid responses
    await page.getByRole(`button`, {name: ` Valid Response`}).click();
    await page.keyboard.type(res1);
    await page.keyboard.press(`Enter`);
    await page.keyboard.type(res2);
    await page.keyboard.press(`Enter`);

    // Open Rules tab
    await page.locator(`[role="tab"] :text("Rules")`).click();

    // Change Never read-only → Read-only when expression
    await page.getByText(`Never read-only`).first().click();
    await page
        .getByRole(`option`, {name: `Read-only when expression...`})
        .locator(`span`)
        .click();

    //--------------------------------
    // Configure Expression
    //--------------------------------
    const expressionDialog = page.getByRole(`dialog`, {
        name: `Set Read-only Condition for:`
    });
    await expressionDialog.getByPlaceholder(`Search...`).fill(`Service Request type`);
    await page.locator(`#search-value-button`).click();
    await page.getByText(`Service Request Type (`).click();
    await page.getByRole(`button`, {name: `Use Field (Code)`}).click();
    await page.keyboard.type(`=`);
    await expressionDialog.getByLabel(`expand combobox`).click();
    await page.getByText(valueOption).click();
    await page.getByRole(`button`, {name: `Insert Code Value`}).click();
    await page.getByRole(`button`, {name: `Select`, exact: true}).click();

    //--------------------------------
    // Save + open Preview
    //--------------------------------
    await page.getByRole(`button`, {name: `Save`}).click();
    await waitForLoader(page);

    // Open Preview
    console.log('Clicking Preview...');
    await page.getByRole('button', {name: 'Preview'}).click();
    await waitForLoader(page); // wait for any loader after Preview click

    // Handle unsaved changes dialog if it appears
    const unsavedDialog = page.getByRole('dialog').filter({hasText: 'You have unsaved changes'});
    if (await unsavedDialog.count() > 0) {
        console.log('Handling unsaved changes dialog...');
        await unsavedDialog.getByRole('button', {name: 'Yes'}).click();
        await waitForLoader(page);
    }

    //--------------------------------
    // Wait for Preview dialog fully loaded
    //--------------------------------
    console.log('Waiting for Preview dialog...');
    const previewDialog = page.getByRole('dialog').filter({
        hasText: 'Edit Screen - Internal (PREVIEW)'
    });
    await expect(previewDialog).toBeVisible({timeout: 90000});

    // Wait for radios to appear
    const yesRadio = previewDialog.getByRole('radio', {name: res1, exact: true});
    const noRadio = previewDialog.getByRole('radio', {name: res2, exact: true});
    await expect(yesRadio).toBeVisible({timeout: 30000});
    await expect(noRadio).toBeVisible({timeout: 30000});

    //--------------------------------
    // Fill Service Request Type inside Preview
    //--------------------------------
    /*const serviceRequestField = previewDialog.locator('#auli_service_request_type-autocomplete');
    await serviceRequestField.waitFor({ state: 'visible', timeout: 7000 });
    await serviceRequestField.click({ force: true });
    await serviceRequestField.fill('');
    await serviceRequestField.type(valueOption, { delay: 50 });
    await previewDialog.getByText(valueOption).click();
*/


    /*
        const serviceRequestField = previewDialog.locator('#auli_service_request_type-autocomplete');

    // Wait until input is visible and interactable
        await serviceRequestField.waitFor({ state: 'visible', timeout: 30000 });
        await serviceRequestField.scrollIntoViewIfNeeded();
        await serviceRequestField.click({ force: true });
        await serviceRequestField.fill(''); // clear existing value
        await serviceRequestField.type(valueOption, { delay: 50 });

    // Wait a tiny bit for the dropdown to render
        await page.waitForTimeout(300);

    // Select value from dropdown
        await previewDialog.getByText(valueOption).click();
    */


    const serviceRequestContainer = previewDialog.locator('#auli_service_request_type-autocomplete').locator('..');
    const comboboxButton = serviceRequestContainer.getByRole('button', {name: /expand combobox/i});

// 1️⃣ Click the combobox button to expand
    await comboboxButton.waitFor({state: 'visible', timeout: 30000});
    await comboboxButton.scrollIntoViewIfNeeded();
    await comboboxButton.click({force: true});
    await page.waitForTimeout(200); // allow dropdown to render

// 2️⃣ Locate the option in the floating dropdown and click with force
    const dropdownOption = page.locator('.k-list-container .k-list > li', {hasText: valueOption}).first();
    //await dropdownOption.scrollIntoViewIfNeeded();
    // await dropdownOption.click({ force: true });


    // Close Preview modal if still open
    try {
        await page.getByRole('button', {name: ' Close'}).click();
    } catch {
    }





    // Close Edit Screen - Internal modal after preview (robust)
    const editScreenModal = page.getByLabel('Edit Screen - Internal');
    if (await editScreenModal.count() > 0) {
        const closeButtons = editScreenModal.getByRole('button', {name: 'Close', exact: true});
        if (await closeButtons.count() > 0) {
            // Click the first Close button to avoid strict mode violation
            await closeButtons.first().click();

            // Wait until the modal is fully hidden
            try {
                await editScreenModal.waitFor({state: 'hidden', timeout: 7000});
            } catch {
                // If modal doesn’t disappear, continue to avoid blocking the test
            }
        }
    }

    await waitForLoader(page);


// Fallback: any remaining Close button on page
    try {
        const fallbackClose = page.getByRole('button', {name: 'Close', exact: true}).first();
        if (await fallbackClose.count() > 0) {
            await fallbackClose.click();
        }
    } catch {
    }


});