import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded, cleanUpStratificationRuleWithCheckIfExistsCondition } from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 20;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);

/** Click a locator and then wait a bit */
const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

/** Fill a locator and then wait a bit */
const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Create, Update, and Delete a Stratification Schedule', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `StratificationSchedule`;
    const ruleName = `QAW schedule`;
    const ruleNameEdited = `${ruleName} - edited`;
    const description = `QAW description`;
    const descriptionEdited = `QAW description - edited`;

    // Sign in to the app
    const { page } = await logIn({ loginID });

    // Clean up any pre-existing schedule with this name (idempotent)
    await cleanUpStratificationRuleWithCheckIfExistsCondition(page, { ruleName, schedules: true });

    //--------------------------------
    // Act: Navigate and Create
    //--------------------------------
    // Click `Tools` button
    await clickAndWait(page, page.getByText(`Tools`));

    // Click `Stratification` button
    await clickAndWait(page, page.getByText(`Stratification`, { exact: true }));
    await waitUntilLoaded(page);

    // Click `Schedules` tab
    await clickAndWait(page, page.getByText(`Schedules`, { exact: true }));
    await waitUntilLoaded(page);

    // Click `New` button (NBSP in label)
    await clickAndWait(page, page.getByRole(`button`, { name: ` \u00A0New` }));

    await waitUntilLoaded(page);

    // Fill in Name title
    await fillAndWait(page, page.locator(`input[name="title"]`), ruleName);

    // Fill in `Description` text area
    await fillAndWait(page, page.locator(`textarea[name="description"]`), description);

    // Wait for page load
    //await waitUntilLoaded(page);

    // Click `Rule` button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Rule` }));

    // Click `BH Disability no Open Case` in menu list
    await clickAndWait(page, page.getByRole(`gridcell`, { name: `BH Disability no Open Case` }));

    // Click `Select` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Select`, exact: true }));

    await waitUntilLoaded(page);

    // Click `Save` button (glyph save)
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Schedule created
    //--------------------------------
    // Verify that newly created schedule name is visible on the page
    await expect(page.getByRole(`gridcell`, { name: ruleName })).toBeVisible();

    // Verify that newly created schedule description is visible on the page
    await expect(page.getByRole(`gridcell`, { name: description })).toBeVisible();

    //--------------------------------
    // Act: Edit schedule (update name & description)
    //--------------------------------
    // Click newly created schedule
    await clickAndWait(page, page.getByRole(`gridcell`, { name: ruleName }));

    // Click `Edit` button (glyph)
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));
    await waitUntilLoaded(page);

    // Fill in `Name` input field
    await fillAndWait(page, page.locator(`input[name="title"]`), ruleNameEdited);

    // Fill in `Description` text area
    await fillAndWait(page, page.locator(`textarea[name="description"]`), descriptionEdited);

    await waitUntilLoaded(page);

    // Click `Save` button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Edits persisted
    //--------------------------------
    // Assert that the updated name is visible
    await expect(page.getByRole(`gridcell`, { name: ruleNameEdited })).toBeVisible();

    // Assert that the updated description is visible
    await expect(page.getByRole(`gridcell`, { name: descriptionEdited })).toBeVisible();

    //--------------------------------
    // Act: Delete the schedule
    //--------------------------------
    // Click edited schedule
    await clickAndWait(page, page.getByRole(`gridcell`, { name: ruleNameEdited }));
    //await waitUntilLoaded(page);

    // Click `Delete` button (glyph)
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    // Click `Yes` button to confirm
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Schedule removed
    //--------------------------------
    await expect(page.getByRole(`gridcell`, { name: ruleNameEdited })).not.toBeVisible();
    await expect(page.getByRole(`gridcell`, { name: descriptionEdited })).not.toBeVisible();
});
