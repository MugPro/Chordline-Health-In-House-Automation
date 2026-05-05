import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

// Helper: wait for optional loading spinner
async function waitForLoader(page) {
    const loader = page.locator('#loading');
    if (await loader.count() > 0) {
        try {
            await loader.waitFor({ state: 'visible', timeout: 3000 });
            await loader.waitFor({ state: 'hidden', timeout: 10000 });
        } catch {
            // Ignore if loader never appears or hides
        }
    }
}

test('AddNewFieldNumber', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `FieldNumber`;
    const screenTemplateGroup = `Medical Review - RF`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;


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

    // Copy default template
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

    // Click Edit
    await page.getByRole(`button`, { name: `` }).click();

    // Click New Fields
    await page.getByRole(`button`, { name: ` Field` }).click();

    // Click new field input selector
    await page.getByText(`Radio Button`).nth(1).click();

    // Select Number field type
    await page.getByRole(`option`, { name: ` Number` }).locator(`div`).click();

    // Click Add
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();

    // Save
    await page.getByRole(`button`, { name: `Save` }).click();

    // Preview
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Assert
    //--------------------------------

    // Verify Number label is visible inside Edit Screen modal
    const editScreenModal = page.getByLabel('Edit Screen - Internal (');
    await expect(
        editScreenModal.getByText(`Number:`)
    ).toBeVisible();

    // Verify Medical Review Form label is visible
    await expect(
        page.getByText(`Medical Review From:`, { exact: true })
    ).toBeVisible();


    await browser.close();

});
