import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

test('RulesReadOnlyAlwaysReadOnly', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `AlwaysReadOnly`;
    const screenTemplateGroup = `Authorization Bed Day - IP`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const screenName = `${defaultTemplate} - Copy`;
    const res1 = `yes`;
    const res2 = `no`;



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

    // Change Never read-only → Always read-only
    await page.getByText(`Never read-only`).first().click();

    await page
        .getByRole(`option`, { name: `Always read-only` })
        .locator(`span`)
        .click();

    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert
    //--------------------------------

    // Both radio options should be disabled
    await expect(
        page.getByRole(`radio`, { name: res1, exact: true })
    ).toBeDisabled();

    await expect(
        page.getByRole(`radio`, { name: res2, exact: true })
    ).toBeDisabled();



});
