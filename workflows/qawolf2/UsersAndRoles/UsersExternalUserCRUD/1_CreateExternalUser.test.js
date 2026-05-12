/*import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logIn, waitUntilLoaded, reportCleanupFailed } from '../../../../helpers/Node20Helpers.js';

test('1_CreateExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ExternalUserCrud`;
    const group = `Users`;
    const tab = `External`;
    const firstName = `ExUserC2`;
    const lastName = `QAWolf2`;
    const title = `QAE2`;
    const logInId = `QA-${firstName}`;
    const accessJustification = `Service Account`;
    const emailAddress = faker.internet.email({ firstName });
    const externalAccessType = `Local Administrator`;
    const securityRole = `External User`;
    const phone = faker.phone.number('###-###-####');
    const address = faker.location.streetAddress();
    const city = faker.location.city();
    const zipCode = faker.location.zipCode();
    const state = faker.location.state();
    const memberRole = `All Member Access`;
    const password = process.env.DEFAULT_PASS_JUNE_2025;








        //--------------------------------
        // Login
        //--------------------------------
        const { browser, page } = await logIn({
            url: process.env.DEFAULT_URL_2,
            loginID,
            password: process.env.DEFAULT_PASS_OCT_2025,
        });

        //--------------------------------
        // Navigate to Users
        //--------------------------------
        await page.getByText(`Tools`).click();
        await page.getByText(`Users & Roles`).click();
        await page.getByRole(`treeitem`, { name: group }).locator(`span`).first().click();

        //--------------------------------
        // WAIT FOR USERS PAGE TO FULLY LOAD
        //--------------------------------
        await waitUntilLoaded(page);



    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });




    //--------------------------------
        // Switch to External tab PROPERLY
        //--------------------------------
        await page.getByRole('tab', { name: tab }).click();

        await expect(
            page.getByRole('tabpanel', { name: tab })
        ).toBeVisible({ timeout: 20000 });

        await waitUntilLoaded(page);

        const externalTabPanel = page.getByRole('tabpanel', { name: tab });

        //--------------------------------
        // Cleanup existing user (if exists)
        //--------------------------------
        try {
            await externalTabPanel.getByPlaceholder('Search...').fill(firstName);
            await externalTabPanel.locator('#admin-search-button').click();
            await waitUntilLoaded(page);

            let attempts = 0;
            while (
                (await page.getByRole('gridcell', { name: firstName }).first().isVisible()) &&
                attempts < 3
                ) {
                attempts++;

                await page.getByRole('gridcell', { name: firstName }).first().click();

                await page
                    .locator(
                        `tr[aria-selected="true"]:has-text("${firstName}") button[title="Delete"]`
                    )
                    .click();

                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);
            }
        } catch (e) {
            await reportCleanupFailed({ errorMsg: e.message });
        }

        //--------------------------------
        // Act - Create External User
        //--------------------------------
        await page.getByRole('button', { name: '  New' }).click();

        await page.locator('#user_first_name').fill(firstName);
        await page.locator('#user_last_name').fill(lastName);
        await page.locator('#user_login_name').fill(logInId);







    // Locate input and dropdown arrow
    const externalInput = page.locator('input[name="user_external_access_type_id_input"]');
    const dropdownArrow = externalInput.locator('xpath=following-sibling::button[@aria-label="expand combobox"]');

// 1. Open the dropdown
    await dropdownArrow.click();

// 2. Wait for the Kendo listbox to appear
    const listbox = page.locator('#user_external_access_type_id-autocomplete_listbox');
    await listbox.waitFor({ state: 'visible', timeout: 5000 });

// 3. Click the exact option
    await listbox.getByRole('option', { name: externalAccessType }).click();















    await page.locator('#user_phone_national_number').fill(phone);
        await page.locator('#user_email_address').fill(emailAddress);
        await page.locator('#user_title').fill(title);

        // Access Justification
        await page
            .locator('#record-div div')
            .filter({ hasText: 'Access Justification' })
            .getByLabel('expand combobox')
            .first()
            .click();

        await page.getByRole('option', { name: accessJustification }).click();

        await page.locator('#user_address_1').fill(address);
        await page.locator('#user_city').fill(city);
        await page.locator('#user_zip').fill(zipCode);

        await page.locator('input[name="user_state_id_input"]').fill(state);
        await page.getByText(state).click();

        await page.locator('#user_password').fill(password);
        await page.locator('#user_password_confirm').fill(password);

        // Security Role
        await page.locator('input[name="user_security_role_id_input"]').fill(securityRole);
        await page.getByRole('option', { name: `​ ${securityRole}` }).click();

        // Member Role
        await page.locator('input[name="user_member_role_id_input"]').fill(memberRole);
        await page.getByRole('option', { name: `​ ${memberRole}` }).click();

        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert
        //--------------------------------
        await externalTabPanel.getByPlaceholder('Search...').fill(emailAddress);
        await externalTabPanel.locator('#admin-search-button').click();
        await waitUntilLoaded(page);

        await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: firstName, exact: true })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: lastName })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: title })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: emailAddress })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: accessJustification })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: externalAccessType })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
        await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();



        await browser.close();
    });


 */






























import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {logIn, waitUntilLoaded, reportCleanupFailed, logIn3} from '../../../../helpers/Node20Helpers.js';
import * as helpers from "../../../../helpers/Node20Helpers.js";
import {env} from "../../../../environments/qawolf2.env.js";



async function deleteExternalUserIfExists(page, group, tab, logInId) {
    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page
        .getByRole('treeitem', { name: group })
        .locator('span')
        .first()
        .click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Switch to External tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const externalTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(externalTabPanel).toBeVisible({ timeout: 20000 });
    await waitUntilLoaded(page);

    //--------------------------------
    // Search for the user
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(logInId);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Delete ALL matching users
    //--------------------------------
    const userCells = page.getByRole('gridcell', {
        name: logInId,
        exact: true
    });

    let count = await userCells.count();

    if (count === 0) {
        console.log(`✅ External user "${logInId}" not found. Continuing test.`);
        return;
    }

    console.log(`🗑️ Found ${count} user(s) with loginId "${logInId}". Deleting...`);

    while ((await userCells.count()) > 0) {
        await userCells.first().click();

        const deleteButton = page.locator(
            'tr[aria-selected="true"] button.delete-button'
        );

        await deleteButton.waitFor({ state: 'visible', timeout: 3000 });
        await deleteButton.click();

        await page.getByRole('button', { name: 'Yes' }).click();

        await waitUntilLoaded(page);
    }

    console.log(`✅ All external users "${logInId}" deleted.`);




}









test('1_CreateExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
   // const loginID = `ExternalUserCrud`;
    //const loginID = `emailUsers`;
    const group = `Users`;
    const tab = `External`;
    const firstName = `ExUserC2`;
    const lastName = `QAWolf2`;
    const title = `QAE2`;
    //const logInId = `QA-${firstName}`;

    const logInId = `QA-ExUserC`;          // original login id

    const accessJustification = `Service Account`;
    const emailAddress = faker.internet.email({ firstName });
    const externalAccessType = `Local Administrator`;
    const securityRole = `External User`;
    const phone = faker.phone.number('###-###-####');
    const address = faker.location.streetAddress();
    const city = faker.location.city();
    const zipCode = faker.location.zipCode();
    const state = faker.location.state();
    const memberRole = `All Member Access`;



   // const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 1000
    });



    await waitUntilLoaded(page);







    await deleteExternalUserIfExists(page, group, tab, logInId);

// ✅ test continues here
    ``








    await page.getByLabel('Close').click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Users & Roles`).click();
    await page.getByRole(`treeitem`, { name: group }).locator(`span`).first().click();

    //--------------------------------
    // WAIT FOR USERS PAGE TO FULLY LOAD
    //--------------------------------
   // await waitUntilLoaded(page);



    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });




    //--------------------------------
    // Switch to External tab PROPERLY
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();

    await expect(
        page.getByRole('tabpanel', { name: tab })
    ).toBeVisible({ timeout: 20000 });

    //await waitUntilLoaded(page);

    const externalTabPanel = page.getByRole('tabpanel', { name: tab });

    /*
    //--------------------------------
    // Cleanup existing user (if exists)
    //--------------------------------
    try {
        await externalTabPanel.getByPlaceholder('Search...').fill(firstName);
        await externalTabPanel.locator('#admin-search-button').click();
        await waitUntilLoaded(page);

        let attempts = 0;
        while (
            (await page.getByRole('gridcell', { name: firstName }).first().isVisible()) &&
            attempts < 3
            ) {
            attempts++;

            await page.getByRole('gridcell', { name: firstName }).first().click();

            await page
                .locator(
                    `tr[aria-selected="true"]:has-text("${firstName}") button[title="Delete"]`
                )
                .click();

            await page.getByRole('button', { name: 'Yes' }).click();
            await waitUntilLoaded(page);
        }
    } catch (e) {
        await reportCleanupFailed({ errorMsg: e.message });
    }

     */

    //--------------------------------
    // Act - Create External User
    //--------------------------------
    await page.getByRole('button', { name: '  New' }).click();

    //await waitUntilLoaded(page);

    await page.locator('#user_first_name').fill(firstName);
    await page.locator('#user_last_name').fill(lastName);
    await page.locator('#user_login_name').fill(logInId);



    //await waitUntilLoaded(page);



    // Locate input and dropdown arrow
    const externalInput = page.locator('input[name="user_external_access_type_id_input"]');
    const dropdownArrow = externalInput.locator('xpath=following-sibling::button[@aria-label="expand combobox"]');

// 1. Open the dropdown
    await dropdownArrow.click();

// 2. Wait for the Kendo listbox to appear
    const listbox = page.locator('#user_external_access_type_id-autocomplete_listbox');
    await listbox.waitFor({ state: 'visible', timeout: 5000 });

// 3. Click the exact option
    await listbox.getByRole('option', { name: externalAccessType }).click();















    await page.locator('#user_phone_national_number').fill(phone);
    await page.locator('#user_email_address').fill(emailAddress);
    await page.locator('#user_title').fill(title);

    // Access Justification
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Access Justification' })
        .getByLabel('expand combobox')
        .first()
        .click();

    await page.getByRole('option', { name: accessJustification }).click();

    await page.locator('#user_address_1').fill(address);
    await page.locator('#user_city').fill(city);
    await page.locator('#user_zip').fill(zipCode);



/*
    await page.locator('input[name="user_state_id_input"]').fill(state);
    await page.getByText(state).click();

 */


/*
    await page.locator('input[name="user_state_id_input"]').click();
    await page.locator('input[name="user_state_id_input"]').fill(state);
    await page.getByRole('option', { name: state }).click();
    await page.locator('input[name="user_state_id_input"]').press('Tab');

 */



    const stateInput = page.locator('input[name="user_state_id_input"]');
    const expandButton = stateInput.locator(
        'xpath=following-sibling::button[@aria-label="expand combobox"]'
    );

    await expandButton.click();
    await stateInput.fill(state);
    await stateInput.press('Enter');

    await expect(stateInput).toHaveValue(state);















    await page.locator('#user_password').fill(password);

    await waitUntilLoaded(page);

    await page.locator('#user_password_confirm').fill(password);

    await waitUntilLoaded(page);

    // Security Role
    await page.locator('input[name="user_security_role_id_input"]').fill(securityRole);
    await page.getByRole('option', { name: `​ ${securityRole}` }).click();

    // Member Role
    await page.locator('input[name="user_member_role_id_input"]').fill(memberRole);
    await page.getByRole('option', { name: `​ ${memberRole}` }).click();






    await page.locator('#user_password_confirm').fill(password);

    await waitUntilLoaded(page);


    await page.getByRole('button', { name: ' Save and Close' }).click();
    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(emailAddress);
    await externalTabPanel.locator('#admin-search-button').click();
   // await waitUntilLoaded(page);

    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: firstName, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: lastName })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: title })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddress })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustification })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: externalAccessType })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();



    await browser.close();
});
