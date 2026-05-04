import { test, expect } from '@playwright/test';

// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanUpUser, logIn3,
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

test('Simple search returns expected results', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Set constants
    const loginID = `SimpleSearch`;
    const firstName = `Quality`;
    const lastName = `Assurance`;
    const title = `QAE`;

    const password2 = env.DEFAULT_PASSWORD;


    // Sanity: ensure DEFAULT_PASSWORD is present
    if (!password2) {
        test.skip(true, 'DEFAULT_PASSWORD env var is required for this test.');
    }


    /*
    // Sanity: ensure DEFAULT_PASSWORD is present
    if (!process.env.DEFAULT_PASSWORD) {
        test.skip(true, 'DEFAULT_PASSWORD env var is required for this test.');
    }

     */

    // Sign in to the app
   // const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });






    // Clean-up any pre-existing user(s) with same first name (idempotent)
    await cleanUpUser(page, { firstName });

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await clickAndWait(page, page.locator(`span`).filter({ hasText: `Tools` }).first());

    // Click the "Users & Roles" text
    await clickAndWait(page, page.getByText(`Users & Roles`));

    // Click the " New" button (NBSP in label)
    await clickAndWait(page, page.getByRole(`button`, { name: ` \u00A0New` }));

    await waitUntilLoaded(page);

    // Fill the "First Name" input field
    await fillAndWait(page, page.locator(`#user_first_name`), firstName);

    // Fill the "Last Name" input field
    await fillAndWait(page, page.locator(`#user_last_name`), lastName);

    // Fill the "Title" input field
    await fillAndWait(page, page.locator(`#user_title`), title);

    // Fill the "Login ID"
    await fillAndWait(page, page.locator(`#user_login_name`), firstName + lastName);

    // Fill the "Email Address"
    await fillAndWait(
        page,
        page.locator(`#user_email_address`),
        `${firstName}${lastName}@qawolf.email`
    );

    // Click the "expand combobox" label for Account Type (Account Details * First Name section)
    await clickAndWait(
        page,
        page
            .locator(`#record-div div`)
            .filter({ hasText: `Account Details * First Name` })
            .getByLabel(`expand combobox`)
            .first()
    );

    // Choose "Care Team Member"
    await clickAndWait(
        page,
        page.getByRole(`option`, { name: `Care Team Member` }).locator(`span`)
    );

    // Fill password + confirm
    /*
    await fillAndWait(page, page.locator(`#user_password`), process.env.DEFAULT_PASSWORD);
    await page.keyboard.press(`Tab`);
    await page.keyboard.type(process.env.DEFAULT_PASSWORD);

     */

   // await waitUntilLoaded(page);
    //await page.locator('#user_password').click();
    await page.locator(`#user_password`).fill(password2);
    //await page.locator('#user_password_confirm').click();
   // await waitUntilLoaded(page);

    await page.locator('#user_password_confirm').click();
    await waitUntilLoaded(page);
    await page.keyboard.type(password2);




    // Wait until load / background validations done
    await waitUntilLoaded(page);

    // Assign Security Role: "Administrator"
    await clickAndWait(page, page.locator(`input[name="user_security_role_id_input"]`));
    await page.keyboard.type(`Administrator`);
    await clickAndWait(page, page.getByRole(`option`, { name: `Administrator` }).locator(`span`));

    // Member Role: "All Member Access"
    await clickAndWait(
        page,
        page
            .locator(`#record-div div`)
            .filter({ hasText: `Member Role * Member Role:` })
            .getByLabel(`expand combobox`)
    );
    await clickAndWait(
        page,
        page.getByRole(`option`, { name: `All Member Access` }).locator(`span`)
    );

    await waitUntilLoaded(page);

    // Save and Close
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save and Close` }));
    await waitUntilLoaded(page);

    // Type search text on the "Internal" tab
    await fillAndWait(
        page,
        page.getByRole(`tabpanel`, { name: `Internal` }).getByPlaceholder(`Search...`),
        firstName
    );

    // Click search button
    await clickAndWait(page, page.locator(`#admin-search-button`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert the First name is visible
    await expect(
        page.getByRole(`gridcell`, { name: firstName, exact: true })
    ).toBeVisible();

    // Assert the Last name is visible
    await expect(
        page.getByRole(`gridcell`, { name: lastName, exact: true })
    ).toBeVisible();

    // Assert the Title is visible
    await expect(
        page.getByRole(`gridcell`, { name: `QAE`, exact: true })
    ).toBeVisible();

    // Verify that user email is visible
    await expect(
        page.getByRole(`gridcell`, { name: `${firstName}${lastName}@qawolf.email` })
    ).toBeVisible();

    // Verify that Login ID is visible
    await expect(
        page.getByRole(`gridcell`, { name: `${firstName}${lastName}`, exact: true })
    ).toBeVisible();

    //--------------------------------
    // Clean-up:
    //--------------------------------
    // Close any open overlays
    try {
        await page.getByLabel(`Close`).click({ timeout: 2000 });
    } catch {
        // If not present, ignore
    }

    // Clean-up created user
    await cleanUpUser(page, { firstName });

    //await page.close();
});