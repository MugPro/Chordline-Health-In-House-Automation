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
        } catch {}
    }
}

test('AddNewFieldWholeNumber', async () => {

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

    // Create Number field (same pattern as previous test)
    await page.getByText(`Tools`).click();
    await page.getByText(`Screen Templates`).click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole(`gridcell`, { name: copyTemplate }).click();
    await page.getByRole(`button`, { name: `` }).click();
    await page.getByRole(`button`, { name: ` Field` }).click();
    await page.getByText(`Radio Button`).nth(1).click();
    await page.getByRole(`option`, { name: ` Number` }).locator(`div`).click();
    await page.getByRole(`button`, { name: `Add`, exact: true }).click();
    await page.getByRole(`button`, { name: `Save` }).click();
    await page.getByRole(`button`, { name: `Preview` }).click();

    //--------------------------------
    // Act
    //--------------------------------

    // Close Preview to return to editor
    await page.getByRole(`button`, { name: ` Close` }).click();

    // Click number field overlay to edit properties
    await page.locator(`#mrdt_custom_field_1_overlay`).click();

    // Select Whole Number checkbox
    await page.getByRole(`checkbox`, { name: `Whole Number` }).click();

    // Save
    await page.getByRole(`button`, { name: `Save` }).click();

    // Preview again
    await page.getByRole(`button`, { name: `Preview` }).click();

    // Increment number
    await page
        .getByRole(`dialog`, { name: `Edit Screen - Internal (` })
        .getByLabel(`Increase value`)
        .click();

    //--------------------------------
    // Assert
    //--------------------------------

    // Verify value is whole number
    const numberValue = await page
        .locator(`#mrdt_custom_field_1`)
        .last()
        .inputValue();

    expect(Number.isInteger(parseFloat(numberValue))).toBe(true);

    // Decrement number
    await page
        .getByRole(`dialog`, { name: `Edit Screen - Internal (` })
        .getByLabel(`Decrease value`)
        .click();

    // Verify value returns to 0
    const numberValueAfterDecrement = await page
        .locator(`#mrdt_custom_field_1`)
        .last()
        .inputValue();

    expect(Number(numberValueAfterDecrement)).toBe(0);

    //--------------------------------
    // Clean-up
    //--------------------------------

    try {
        await page.getByRole('button', { name: ' Close' }).click();
    } catch {}

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
});
