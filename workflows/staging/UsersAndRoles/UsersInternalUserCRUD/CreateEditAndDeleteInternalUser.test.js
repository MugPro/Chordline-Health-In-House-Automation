import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

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

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Create, edit, and delete Internal User', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `CreateInternalUser`;
    const securityRole = `administrator`;
    const memberRole = `All member Access`;

    const firstName = `internalQAW`;
    const lastName = `userQAW`;
    const newUserName = `newInternalQAW`;
    const newLastName = `newUserQAW`;

    const emailAddress = faker.internet.email(firstName, lastName);

    // ✅ Strong password using modern Faker API
    const upper = faker.string.alpha({ length: 1, casing: 'upper' });
    const lower = faker.string.alpha({ length: 1, casing: 'lower' });
    const number = faker.number.int({ min: 0, max: 9 }).toString();
    const symbol = faker.helpers.arrayElement(['!', '@', '#', '$', '%', '^', '&', '*']);
    const rest = faker.internet.password({ length: 8, memorable: false });

    const password2 = faker.helpers
        .shuffle([upper, lower, number, symbol, ...rest])
        .join('');

    // Sign in
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    // Cleanup (idempotent)
    await cleanUpUser(page, { firstName });
    await cleanUpUser(page, { firstName: newUserName });

    //--------------------------------
    // Act: Create Internal User
    //--------------------------------
    await clickAndWait(page, page.getByText('Tools'));
    await clickAndWait(page, page.getByText(/Users\s*&\s*Roles/));

    // Click "+ New"
    await clickAndWait(page, page.getByRole('button', { name: ` \u00A0New` }));
    await waitUntilLoaded(page);

    await fillAndWait(page, page.locator('#user_first_name'), firstName);
    await fillAndWait(page, page.locator('#user_last_name'), lastName);
    await fillAndWait(
        page,
        page.locator('#user_login_name'),
        `${firstName}${lastName}`,
    );
    await fillAndWait(page, page.locator('#user_email_address'), emailAddress);
    await fillAndWait(page, page.locator('#user_title'), 'QAE');

    // Access Justification
    await clickAndWait(
        page,
        page
            .locator('#record-div div')
            .filter({ hasText: 'Access Justification' })
            .getByLabel('expand combobox')
            .first(),
    );

    await clickAndWait(page,
        page.getByRole('option', { name: '​ Care Team Member' }).locator('span'),
    );






    await page.locator(`#user_password`).fill(password2);
    //await page.locator('#user_password_confirm').click();
    // await waitUntilLoaded(page);

    await page.locator('#user_password_confirm').click();
    await waitUntilLoaded(page);
    await page.keyboard.type(password2);





    await waitUntilLoaded(page);

    // Security Role
    await fillAndWait(
        page,
        page.locator('input[name="user_security_role_id_input"]'),
        securityRole,
    );

    await clickAndWait(page,
        page.getByRole('option', { name: `​ ${securityRole}` }).locator('span'),
    );

    // Member Role
    await fillAndWait(
        page,
        page.locator('input[name="user_member_role_id_input"]'),
        memberRole,
    );

    await clickAndWait(page,
        page.getByRole('option', { name: `​ ${memberRole}` }).locator('span'),
    );

    // Save
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: User Created
    //--------------------------------
    await fillAndWait(
        page,
        page.getByRole('tabpanel', { name: 'Internal' }).getByPlaceholder('Search...'),
        firstName,
    );

    await clickAndWait(page, page.locator('#admin-search-button'));
    await waitUntilLoaded(page);

    await expect(page.getByRole('gridcell', { name: firstName, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: lastName, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: `${firstName}${lastName}` })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddress })).toBeVisible();

    //--------------------------------
    // Act: Edit User
    //--------------------------------
    await clickAndWait(page, page.getByRole('gridcell', { name: lastName, exact: true }));
    await clickAndWait(page, page.getByRole('button', { name: '' }));
    await waitUntilLoaded(page);

    await fillAndWait(page, page.locator('#user_first_name'), newUserName);
    await fillAndWait(page, page.locator('#user_last_name'), newLastName);

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: User Updated
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: newUserName })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: newLastName })).toBeVisible();

    //--------------------------------
    // Act: Delete User
    //--------------------------------
    await fillAndWait(
        page,
        page.getByRole('tabpanel', { name: 'Internal' }).getByPlaceholder('Search...'),
        newUserName,
    );

    await clickAndWait(page, page.locator('#admin-search-button'));
    await waitUntilLoaded(page);

    await clickAndWait(page, page.getByRole('gridcell', { name: newLastName }));
    await clickAndWait(page, page.getByRole('button', { name: '' }));
    await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: User Deleted
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: newUserName })).not.toBeVisible();
    await expect(page.getByRole('gridcell', { name: newLastName })).not.toBeVisible();
    await expect(page.getByRole('gridcell', { name: `${firstName}${lastName}` })).not.toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddress })).not.toBeVisible();
});