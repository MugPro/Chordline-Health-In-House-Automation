import { test, expect } from '@playwright/test';
// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanUpStratificationRuleWithCheckIfExistsCondition, logIn3
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

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

test('Stratification schedule appears on Calendar and Grid', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `StratificationScheduleGrid`;
    const ruleName = `QAW schedule for grid`;
    const description = `QAW description for grid`;

    // Sign in to the app
   // const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });


    // Ensure a clean state (idempotent)
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

    // Fill `Name`
    await fillAndWait(page, page.locator(`input[name="title"]`), ruleName);

    // Fill `Description`
    await fillAndWait(page, page.locator(`textarea[name="description"]`), description);

    // Click `Rule` button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Rule` }));

    // Select a specific rule from the rule picker
    await clickAndWait(page, page.getByRole(`gridcell`, { name: `BH Disability no Open Case` }));

    // Click `Select` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Select`, exact: true }));
    await waitUntilLoaded(page);

    // Click `Save` button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Appears on Grid
    //--------------------------------
    // Verify that newly created schedule name is visible on the Grid
    await expect(page.getByRole(`gridcell`, { name: ruleName })).toBeVisible();

    // Verify that newly created schedule description is visible on the Grid
    await expect(page.getByRole(`gridcell`, { name: description })).toBeVisible();

    //--------------------------------
    // Act: Switch to Calendar view and open the new schedule
    //--------------------------------
    // Click `Calendar (US/Eastern)` radio
    await clickAndWait(page, page.getByText(`Calendar (US/Eastern)`));
    //await waitUntilLoaded(page);

    // Click `Month` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Month` }));
    //await waitUntilLoaded(page);

    // Wait for the schedule event to appear on the calendar and open it (double-click)
    // The accessible name is expected to look like "QAW schedule for grid on <date...>"
    const calendarEvent = page.getByRole(`button`, { name: new RegExp(`^${ruleName}\\s+on`) });
    await expect(calendarEvent).toBeVisible();
    await calendarEvent.dblclick();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Details match when opened from Calendar
    //--------------------------------
    // Verify Name field contains the correct schedule title
    await expect(page.locator(`input[name="title"]`)).toHaveValue(ruleName);

    // Verify Description field contains the correct schedule description
    await expect(page.locator(`textarea[name="description"]`)).toHaveValue(description);

    //--------------------------------
    // Clean-up UI state (close dialogs) and data
    //--------------------------------
    // Click `Cancel` button (close the schedule edit modal)
    await clickAndWait(page, page.getByRole(`button`, { name: ` Cancel` }));

    // Click `Close` button (close the calendar overlay)
    await clickAndWait(page, page.getByText(`Close`, { exact: true }));

    // Delete newly created rule (idempotent cleanup)
    await cleanUpStratificationRuleWithCheckIfExistsCondition(page, { ruleName, schedules: true });
});