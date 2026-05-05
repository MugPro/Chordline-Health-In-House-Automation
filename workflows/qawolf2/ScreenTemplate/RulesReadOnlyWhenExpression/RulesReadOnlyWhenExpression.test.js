
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

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
   // const loginID = `ReadOnlyWhenExpression`;
    const screenTemplateGroup = `Authorization Bed Day - BH OBS`;
    const defaultTemplate = `Authorization Bed Day - OBS - BH - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const valueOption = `PTS-Expedited`;
    const res1 = `yes`;
    const res2 = `no`;



    //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 400,
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
    //await waitForLoader(page);

    // Open Preview
    console.log('Clicking Preview...');
    await page.getByRole('button', {name: 'Preview'}).click();
    //await waitForLoader(page); // wait for any loader after Preview click

    // Handle unsaved changes dialog if it appears
    const unsavedDialog = page.getByRole('dialog').filter({hasText: 'You have unsaved changes'});
    if (await unsavedDialog.count() > 0) {
        console.log('Handling unsaved changes dialog...');
        await unsavedDialog.getByRole('button', {name: 'Yes'}).click();
        //await waitForLoader(page);
    }

    //--------------------------------
    // Wait for Preview dialog fully loaded
    //--------------------------------
    console.log('Waiting for Preview dialog...');
    const previewDialog = page.getByRole('dialog').filter({
        hasText: 'Edit Screen - Internal (PREVIEW)'
    });
    await expect(previewDialog).toBeVisible();

    // Wait for radios to appear
    const yesRadio = previewDialog.getByRole('radio', {name: res1, exact: true});
    const noRadio = previewDialog.getByRole('radio', {name: res2, exact: true});
    await expect(yesRadio).toBeVisible();
    await expect(noRadio).toBeVisible();

    await browser.close();

});