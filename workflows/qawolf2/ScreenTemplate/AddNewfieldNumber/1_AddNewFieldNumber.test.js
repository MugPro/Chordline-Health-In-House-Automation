import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

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
    const loginID = `FieldNumber`;
    const screenTemplateGroup = `Medical Review - RF`;
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;

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

    //--------------------------------
    // Clean-up
    //--------------------------------

    // Close Preview modal if open
    try {
        await page.getByRole('button', { name: ' Close' }).click();
    } catch {}

    // Close Edit Screen modal safely
    const editModal = page.getByLabel('Edit Screen - Internal');
    if (await editModal.count() > 0) {
        const closeButtons = editModal.getByRole('button', { name: 'Close', exact: true });
        if (await closeButtons.count() > 0) {
            await closeButtons.first().click();
            try {
                await editModal.waitFor({ state: 'hidden', timeout: 7000 });
            } catch {}
        }
    }

    await waitForLoader(page);

    // Fallback close
    try {
        const fallbackClose = page.getByRole('button', { name: 'Close', exact: true }).first();
        if (await fallbackClose.count() > 0) {
            await fallbackClose.click();
        }
    } catch {}
});
