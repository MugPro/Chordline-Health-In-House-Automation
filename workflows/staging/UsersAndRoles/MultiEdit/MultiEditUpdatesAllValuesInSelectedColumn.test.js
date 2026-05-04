import { test, expect } from '@playwright/test';



/*
// 1) Initialize npmImports.faker BEFORE loading helpers (no extra files needed)
import { faker as fakerLib } from '@faker-js/faker';
globalThis.npmImports = {
    ...(globalThis.npmImports || {}),
    faker: fakerLib,
};

 */



// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    createUsers,
    cleanUpUsers, logIn3,
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

test('Multi-Edit updates all values in selected column', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `MultiEdit`;
    const updatedSecurityRole = `Case Manager`;
    const userFirstNames = [`MultiEditUser1`, `MultiEditUser2`, `MultiEditUser3`];

    // Sign in to the app
   // const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });





    // Pre-clean (idempotent)
    await cleanUpUsers(page, { userFirstNames });

    await waitUntilLoaded(page);

    // Create new users
    await createUsers(page, { userFirstNames });

    await waitUntilLoaded(page);

    //--------------------------------
    // Act:
    //--------------------------------
    // Fill in user search input field within the "Internal" tab
    const internalTabPanel = page.getByRole(`tabpanel`, { name: `Internal` });
    await fillAndWait(
        page,
        internalTabPanel.getByPlaceholder(`Search...`),
        `MultiEditUser`
    );

    // Hit Enter key to search
    await page.keyboard.press(`Enter`);
    await waitUntilLoaded(page);

    // Click `Multi-Edit` button in the "Internal" area
    await clickAndWait(
        page,
        page.getByLabel(`Internal`).getByRole(`button`, { name: `Multi-Edit` })
    );

    // Allow any modal/list to render (explicit wait from your steps)
    //await page.waitForTimeout(2000);
    await waitUntilLoaded(page);

    // Click `Select...` input field (force per your steps)
    await page
        .getByLabel(`Multi-Edit`)
        .getByText(`Select...`)
        .click({ force: true });
    await pause(page);

    // Click `Security Role` option
    await clickAndWait(page, page.getByRole(`option`, { name: `Security Role` }));

    // Expand the value dropdown
    await clickAndWait(page, page.getByRole(`button`, { name: `expand combobox` }));

    // Choose `Case Manager` from the dropdown
    await clickAndWait(page, page.getByText(updatedSecurityRole))

    await waitUntilLoaded(page);

    // Save and close
    await clickAndWait(page, page.getByRole(`button`, { name: `Save and Close` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Verify Success message
    await expect(page.getByText(`Users have been successfully`)).toBeVisible();

    // Click `Okay`
    await clickAndWait(page, page.getByRole(`button`, { name: `Okay` }));
    await waitUntilLoaded(page);

    // Verify each user's security role has been updated
    // Using your provided text-selector chain:
    // tr[role="row"] >> :text-is("<firstName>") >> .. >> :text("<updatedSecurityRole>")
    await expect(
        page.locator(
            `tr[role="row"] >> :text-is("${userFirstNames[0]}") >> .. >> :text("${updatedSecurityRole}")`
        )
    ).toBeVisible();

    await expect(
        page.locator(
            `tr[role="row"] >> :text-is("${userFirstNames[1]}") >> .. >> :text("${updatedSecurityRole}")`
        )
    ).toBeVisible();

    await expect(
        page.locator(
            `tr[role="row"] >> :text-is("${userFirstNames[2]}") >> .. >> :text("${updatedSecurityRole}")`
        )
    ).toBeVisible();

    // Clean-up UI state if a Close button is present
    const closeText = page.getByText(`Close`, { exact: true });
    if (await closeText.isVisible().catch(() => false)) {
        await clickAndWait(page, closeText);
    }

    await waitUntilLoaded(page);

    // Final clean-up of newly created users (idempotent)
    await cleanUpUsers(page, { userFirstNames });
});