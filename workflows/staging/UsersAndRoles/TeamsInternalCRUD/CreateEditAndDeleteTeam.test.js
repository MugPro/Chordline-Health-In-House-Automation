// CreateEditAndDeleteTeam.test.js
import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanupTeam, logIn3,
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

test('Create, edit (assign lead), and delete Team (Internal)', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `TeamCRUD`;
    const teamName = `TeamCRUDTeamName`;
    const firstNames = [`Ryan`, `Steve`, `Wendy`];
    const randomIndex = Math.floor(Math.random() * 4);
    const selectedFirstName = firstNames[randomIndex];
    const todayFormatted = format(new Date(), 'MM/dd/yyyy');

    // Sign in to the app
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });

    // Cleanup team name (idempotent)
    await cleanupTeam(page, { teamName });

    //--------------------------------
    // Act: Navigate and Create Team
    //--------------------------------
    // Click the "Tools" text
    await clickAndWait(page, page.getByText(`Tools`));

    // Click the "Users & Roles" text (works whether UI shows & or &amp;)
    await clickAndWait(page, page.getByText(/Users\s*&\s*Roles/));

    // Click the "Teams" text
    await clickAndWait(page, page.getByText(`Teams`));
    //await waitUntilLoaded(page);

    // Click the " New" button (NBSP in label)
    await clickAndWait(page, page.getByRole(`button`, { name: ` \u00A0New` }));
    await waitUntilLoaded(page);

    // Fill in the Team Name field
    await fillAndWait(page, page.locator('#team_name'), teamName);

    // Click the " Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save and Close` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Team appears in grid
    //--------------------------------
    await expect(page.getByRole(`gridcell`, { name: teamName })).toBeVisible();

    //--------------------------------
    // Act: Open team and verify fields
    //--------------------------------
    // Click into newly created team
    await clickAndWait(page, page.getByRole(`gridcell`, { name: teamName }));

    // Click the "" button (open team modal / members)
    await expect(page.getByRole(`button`, { name: `` })).toBeVisible();
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));
    await waitUntilLoaded(page);

    // Assert the Team Name input field contains the correct teamName value
    await expect(page.locator('#team_name')).toHaveValue(teamName);

    //--------------------------------
    // Arrange: Close then re-open for lead assignment
    //--------------------------------
    await clickAndWait(page, page.getByRole(`button`, { name: ` Close` }));
    //await waitUntilLoaded(page);

    //--------------------------------
    // Act: Re-open team and assign a random lead
    //--------------------------------
    // Click into newly created team
    await clickAndWait(page, page.getByRole(`gridcell`, { name: teamName }));

    // Click the "" button again
    await expect(page.getByRole(`button`, { name: `` })).toBeVisible();
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));
    await waitUntilLoaded(page);

    // Click the "..." button to open user picker
    await clickAndWait(page, page.getByRole(`button`, { name: `...` }));
    await waitUntilLoaded(page);

    // Click the first row under the column row
    await page.getByRole(`gridcell`, { name: `Wendy` }).click();

    await waitUntilLoaded(page);

    // Click the randomly selected first name cell
    await page.locator(`:text-is("${firstNames[randomIndex]}")`).click();

    //await waitUntilLoaded(page);

    // Click the "Select" button in the modal
    await page.locator("button#transfer").click();

    await waitUntilLoaded(page);

    // Click the " Save" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save`, exact: true }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Lead assignment & audit info
    //--------------------------------
    // (1) Verify that the user table shows something (not empty) and contains the selected lead
    // If your app uses a specific table region for users (data-table-code="USER"), we validate it’s visible
    const usersTable = page.locator('[data-table-code="USER"]');
    await expect(usersTable.first()).toBeVisible();

    // The selected lead should be present in a grid cell
    await expect(
        page.getByRole('gridcell', { name: selectedFirstName, exact: true })
    ).toBeVisible();

    // (2) "Entered By: Team CRUD" should be visible
    await expect(
        page.locator('.info-label:has-text("Entered By:") ~ .info-content:has-text("Team CRUD")')
    ).toBeVisible();

    // (3) "On: <today>" is visible
    await expect(
        page.locator(
            `[class="info-item-pair"]:has-text("Entered By:") ~ [class="info-item-pair"] .info-label:has-text("On:") ~ .info-content:has-text("${todayFormatted}"):visible`
        )
    ).toBeVisible();

    // Click the "Team Members" header
    await clickAndWait(page, page.locator('#members-anchor').getByText(`Team Members`));

    //--------------------------------
    // Act: Close and delete the team
    //--------------------------------
    // Click the "Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Close` }));
    //await waitUntilLoaded(page);

    // Click the team row again to focus it
    await clickAndWait(page, page.getByRole(`gridcell`, { name: teamName }));

    // Click the "Delete" button (trash icon)
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    // Confirm "Yes"
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Team and lead no longer visible
    //--------------------------------
    await expect(page.getByRole(`gridcell`, { name: teamName })).not.toBeVisible();
    await expect(page.getByText(`${selectedFirstName}`)).not.toBeVisible();

    // Optionally: await page.close();
});