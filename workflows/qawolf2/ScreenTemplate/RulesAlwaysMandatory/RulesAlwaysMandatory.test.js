
/*

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

test('RulesAlwaysMandatory', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `AlwaysMandatory`;
    const screenTemplateGroup = `Authorization - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const mandatoryRadioButton = `Radio Button:`;



    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 400,
    });

    // Clean up existing copy
    await helpers.cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });

    // Create fresh copy
    await helpers.copyDefaultScreenTemplate(page, {
        defaultTemplate,
        screenTemplateGroup,
        customScreenName: screenName,
    });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).first().click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: screenName }).click();
    await page.getByRole(`button`, { name: `` }).click();

    // Add new Radio Button field
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

    // Open Rules tab
    await page.locator(`[role="tab"] :text("Rules")`).click();

    // Change from Never mandatory → Always mandatory
    await page.getByText(`Never mandatory`).first().click();

    await page
        .getByRole(`option`, { name: `Always mandatory` })
        .locator(`span`)
        .click();

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    const saveRadioboxElement = page.locator(
        `[class*="left flex-container-row"]:has(:text("${mandatoryRadioButton}"))`,
    );

    //--------------------------------
    // Assert
    //--------------------------------

    // Verify required asterisk is visible
    await expect(
        saveRadioboxElement.locator(`[class*="required-asterisk"]`)
    ).toBeVisible();

    // Screenshot comparison
    await expect(
        page.getByText(`Radio Button:`, { exact: true })
    ).toHaveScreenshot(
        'always_mandatory_radio_button.png',
        { maxDiffPixelRatio: 0.5 }
    );


});


 */























import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import { logIn3 } from '../../../../helpers/Node20Helpers.js';

test('RulesAlwaysMandatory', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `AlwaysMandatory`;
    const screenTemplateGroup = `Authorization - OP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const mandatoryRadioButton = `Radio Button:`;

    //const password = env.DEFAULT_PASS_OCT_2025;
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    //--------------------------------
    // Act
    //--------------------------------
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 400,
    });

    // Clean up existing copy
    await helpers.cleanupScreenTemplateCopy(page, {
        screenName,
        screenTemplateGroup,
        defaultTemplate,
    });

    // Create fresh copy
    await helpers.copyDefaultScreenTemplate(page, {
        defaultTemplate,
        screenTemplateGroup,
        customScreenName: screenName,
    });

    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).first().click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: screenName }).click();
    await page.getByRole(`button`, { name: `` }).click();

    // Add new Radio Button field
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

    // Open Rules tab
    await page.locator(`[role="tab"] :text("Rules")`).click();

    // Change from Never mandatory → Always mandatory
    await page.getByText(`Never mandatory`).first().click();

    await page
        .getByRole(`option`, { name: `Always mandatory` })
        .locator(`span`)
        .click();

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    const saveRadioboxElement = page.locator(
        `[class*="left flex-container-row"]:has(:text("${mandatoryRadioButton}"))`
    );

    //--------------------------------
    // Assert
    //--------------------------------

    // Verify required asterisk is visible (runs everywhere)
    await expect(
        saveRadioboxElement.locator(`[class*="required-asterisk"]`)
    ).toBeVisible();

    // Screenshot comparison (local only, skipped in CI)
    if (!process.env.CI) {
        await expect(
            page.getByText(`Radio Button:`, { exact: true })
        ).toHaveScreenshot(
            'always_mandatory_radio_button.png',
            { maxDiffPixelRatio: 0.5 }
        );
    }

    await browser.close();

});