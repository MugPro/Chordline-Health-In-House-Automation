import { test, expect } from '@playwright/test';

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

test('Create, edit (assign lead), and delete Team (External)', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `TeamCRUDNEW`;
    const teamName = `QAW team`;

    // Sign in to the app
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });


    // Cleanup team name (idempotent)
    await cleanupTeam(page, { teamName, external: true });

    //--------------------------------
    // Act: Navigate and Create Team
    //--------------------------------
    // Click the "Tools" text
    await clickAndWait(page, page.getByText(`Tools`));

    // Click the "Users & Roles" text
    await clickAndWait(page, page.getByText(`Users & Roles`));

    // Click the "Teams" text
    await clickAndWait(page, page.getByText(`Teams`));
    await waitUntilLoaded(page);

    // Click the "External" tab
    await clickAndWait(page, page.getByText(`External`, { exact: true }));
   // await waitUntilLoaded(page);

    // Click the " New" button (NBSP in label)
    await clickAndWait(page, page.getByRole(`button`, { name: ` \u00A0New` }));

    await waitUntilLoaded(page);

    // Fill the team name with new team name
    await fillAndWait(page, page.locator(`#team_name`), teamName);

    await waitUntilLoaded(page);

    // Click the " Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save and Close` }));
    //await waitUntilLoaded(page);

    // Search for the newly created team on "External" tab
    await fillAndWait(
        page,
        page.getByRole(`tabpanel`, { name: `External` }).getByPlaceholder(`Search...`),
        teamName
    );

    // Click `Search` button (use the last button instance on the page)
    await clickAndWait(page, page.locator(`#admin-search-button`).last());
    await waitUntilLoaded(page);

    const teamRow = page.locator(`tr:has(td:has-text("${teamName}"))`);

    //--------------------------------
    // Assert: Team appears in grid with 0 users
    //--------------------------------
    await expect(page.locator(`td`, { hasText: teamName })).toBeVisible();
    await expect(teamRow.locator(`td`, { hasText: `0` }).last()).toBeVisible();

    //--------------------------------
    // Act: Open team, assign a lead, and save
    //--------------------------------
    // Click into newly created team
    await clickAndWait(page, page.getByRole(`gridcell`, { name: teamName }));

    // Click the "" button (assign lead/users)
    await expect(page.getByRole(`button`, { name: `` })).toBeVisible();
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    await waitUntilLoaded(page);

    // Click the "..." button to search/select users
    await clickAndWait(page, page.getByRole(`button`, { name: `...` }));

    // Click the "LogInExUser" gridcell in the picker
    await clickAndWait(page, page.getByRole(`gridcell`, { name: `LogInExUser`, exact: true }));

    // Click the "Select" button in the modal
    await clickAndWait(page, page.locator(`button#transfer`));

    await waitUntilLoaded(page);

    // Click the " Save" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save`, exact: true }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Lead/member assignment is visible
    //--------------------------------
    await expect(
        page.getByLabel(`Team - External`).getByText(`LogInExUser Qaw`)
    ).toBeVisible();

    // Assert the "QAE" title is visible
    await expect(page.getByRole(`gridcell`, { name: `QAE` })).toBeVisible();

    //--------------------------------
    // Act: Close and delete the team
    //--------------------------------
    // Click the "Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Close` }));

    // Click the team row again to focus it
    await clickAndWait(page, page.getByRole(`gridcell`, { name: teamName }));

    // Click the "Delete" button (trash icon)
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    // Confirm "Yes"
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Team and related assignment no longer visible
    //--------------------------------
    await expect(page.getByRole(`gridcell`, { name: teamName })).not.toBeVisible();
    await expect(page.getByRole(`gridcell`, { name: `LogInExUser Qaw` })).not.toBeVisible();

    //await page.close();
});