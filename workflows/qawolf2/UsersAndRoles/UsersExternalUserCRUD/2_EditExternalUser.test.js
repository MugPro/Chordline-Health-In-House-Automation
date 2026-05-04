/*import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test('2_EditExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ExternalUserCrud`;
    const group = `Users`;
    const tab = `External`;

    // Existing user (from Create test)
    const firstName = `ExUserC`;
    const logInId = `QA-${firstName}`;
    const securityRole = `External User`;
    const memberRole = `All Member Access`;

    // Edited values
    const firstNameEdit = `ExUserC-edit`;
    const lastNameEdit = `QAWolf-edit`;
    const titleEdit = `QAE2`;
    const accessJustificationEdit = `Provider`;
    const emailAddressEdit = faker.internet.email({ firstName });
    const externalAccessTypeEdit = `Local Team User`;
    const phoneEdit = faker.phone.number('###-###-####');
    const addressEdit = faker.location.streetAddress();
    const cityEdit = faker.location.city();
    const zipCodeEdit = faker.location.zipCode();
    const stateEdit = faker.location.state();

    //--------------------------------
    // Login
    //--------------------------------
    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Navigate to Users → External
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Users & Roles`).click();
    await page.getByRole(`treeitem`, { name: group }).locator(`span`).first().click();

    await waitUntilLoaded(page);

    // Wait for Internal grid to fully render first
    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });

    // Switch to External tab
    await page.getByRole('tab', { name: tab }).click();

    await expect(
        page.getByRole('tabpanel', { name: tab })
    ).toBeVisible({ timeout: 20000 });

    await waitUntilLoaded(page);

    const externalTabPanel = page.getByRole('tabpanel', { name: tab });

    //--------------------------------
    // Search and open existing user
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(firstName);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: firstName, exact: true }).dblclick();

    //--------------------------------
    // Edit
    //--------------------------------
    await page.getByRole('button', { name: ' Edit' }).click();

    await page.locator('#user_first_name').fill(firstNameEdit);
    await page.locator('#user_last_name').fill(lastNameEdit);

    // Remove existing External Access Type (X button)
    await page
        .locator('span')
        .filter({ hasText: 'Local Administrator' })
        .getByRole('button')
        .first()
        .click();

    // Select new External Access Type
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Account Details * First Name' })
        .getByLabel('expand combobox')
        .nth(1)
        .click();

    await page.getByText(externalAccessTypeEdit).click();

    await page.locator('#user_phone_national_number').fill(phoneEdit);
    await page.locator('#user_email_address').fill(emailAddressEdit);
    await page.locator('#user_title').fill(titleEdit);

    // Remove existing Access Justification
    await page
        .locator('span')
        .filter({ hasText: 'Service Account' })
        .getByRole('button')
        .first()
        .click();

    // Select new Access Justification
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Access Justification' })
        .getByLabel('expand combobox')
        .first()
        .click();

    await page.getByRole('option', { name: accessJustificationEdit }).click();

    await page.locator('#user_address_1').fill(addressEdit);
    await page.locator('#user_city').fill(cityEdit);
    await page.locator('#user_zip').fill(zipCodeEdit);

    await page.locator('input[name="user_state_id_input"]').fill(stateEdit);
    await page.getByRole('option', { name: stateEdit }).click();

    //--------------------------------
    // Save
    //--------------------------------
    await page.getByRole('button', { name: ' Save and Close' }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Search updated record
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(emailAddressEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Grid Assertions
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: firstNameEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: lastNameEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: titleEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddressEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustificationEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: externalAccessTypeEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();

    //--------------------------------
    // Open and assert details
    //--------------------------------
    await page.getByRole('gridcell', { name: firstNameEdit }).dblclick();

    const userPanel = page.getByLabel('User - External');

    await expect(userPanel.getByText(firstNameEdit)).toBeVisible();
    await expect(userPanel.getByText(logInId)).toBeVisible();
    await expect(userPanel.getByText(externalAccessTypeEdit)).toBeVisible();
    await expect(userPanel.getByText(lastNameEdit)).toBeVisible();
    await expect(userPanel.getByText(titleEdit)).toBeVisible();
    await expect(userPanel.getByText(accessJustificationEdit)).toBeVisible();
    await expect(userPanel.getByText(emailAddressEdit)).toBeVisible();
    await expect(page.getByText(addressEdit)).toBeVisible();
    await expect(page.getByText(cityEdit)).toBeVisible();
    await expect(page.getByText(stateEdit)).toBeVisible();
    await expect(userPanel.getByText(securityRole)).toBeVisible();
    await expect(userPanel.getByText(memberRole)).toBeVisible();
});


 */


















/*
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test('2_EditExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ExternalUserCrud`;
    const group = `Users`;
    const tab = `External`;

    // Existing user (from Create test)
    const firstName = `ExUserC`;
    const logInId = `QA-${firstName}`;
    const securityRole = `External User`;
    const memberRole = `All Member Access`;

    // Edited values
    const firstNameEdit = `ExUserC-edit`;
    const lastNameEdit = `QAWolf-edit`;
    const titleEdit = `QAE2`;
    const accessJustificationEdit = `Provider`;
    const emailAddressEdit = faker.internet.email({ firstName });
    const externalAccessTypeEdit = `Local Team User`;
    const phoneEdit = faker.phone.number('###-###-####');
    const addressEdit = faker.location.streetAddress();
    const cityEdit = faker.location.city();
    const zipCodeEdit = faker.location.zipCode();
    const stateEdit = faker.location.state();

    //--------------------------------
    // Login
    //--------------------------------
    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Navigate to Users → External
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Users & Roles`).click();
    await page.getByRole(`treeitem`, { name: group }).locator(`span`).first().click();

    await waitUntilLoaded(page);

    // Wait for Internal grid to fully render first
    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });

    // Switch to External tab
    await page.getByRole('tab', { name: tab }).click();

    await expect(
        page.getByRole('tabpanel', { name: tab })
    ).toBeVisible({ timeout: 20000 });

    await waitUntilLoaded(page);

    const externalTabPanel = page.getByRole('tabpanel', { name: tab });

    //--------------------------------
    // Search and open existing user
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(firstName);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: firstName, exact: true }).dblclick();

    //--------------------------------
    // Edit
    //--------------------------------
    await page.getByRole('button', { name: ' Edit' }).click();

// Wait for edit mode input to replace the div
    await page.locator('input#user_first_name').waitFor({
        state: 'visible',
        timeout: 10000,
    });

    await page.locator('input#user_first_name').fill(firstNameEdit);
    await page.locator('input#user_last_name').fill(lastNameEdit);


    // Remove existing External Access Type (X button)
    await page
        .locator('span')
        .filter({ hasText: 'Local Administrator' })
        .getByRole('button')
        .first()
        .click();

    // Select new External Access Type
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Account Details * First Name' })
        .getByLabel('expand combobox')
        .nth(1)
        .click();

    await page.getByText(externalAccessTypeEdit).click();

    await page.locator('#user_phone_national_number').fill(phoneEdit);
    await page.locator('#user_email_address').fill(emailAddressEdit);
    await page.locator('#user_title').fill(titleEdit);

    // Remove existing Access Justification
    await page
        .locator('span')
        .filter({ hasText: 'Service Account' })
        .getByRole('button')
        .first()
        .click();

    // Select new Access Justification
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Access Justification' })
        .getByLabel('expand combobox')
        .first()
        .click();

    await page.getByRole('option', { name: accessJustificationEdit }).click();

    await page.locator('#user_address_1').fill(addressEdit);
    await page.locator('#user_city').fill(cityEdit);
    await page.locator('#user_zip').fill(zipCodeEdit);

    await page.locator('input[name="user_state_id_input"]').fill(stateEdit);
    await page.getByRole('option', { name: stateEdit }).click();

    //--------------------------------
    // Save
    //--------------------------------
    await page.getByRole('button', { name: ' Save and Close' }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Search updated record
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(emailAddressEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Grid Assertions
    //--------------------------------
    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: firstNameEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: lastNameEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: titleEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddressEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustificationEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: externalAccessTypeEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();

    //--------------------------------
    // Open and assert details
    //--------------------------------
    await page.getByRole('gridcell', { name: firstNameEdit }).dblclick();

    const userPanel = page.getByLabel('User - External');

    await expect(userPanel.getByText(firstNameEdit)).toBeVisible();
    await expect(userPanel.getByText(logInId)).toBeVisible();
    await expect(userPanel.getByText(externalAccessTypeEdit)).toBeVisible();
    await expect(userPanel.getByText(lastNameEdit)).toBeVisible();
    await expect(userPanel.getByText(titleEdit)).toBeVisible();
    await expect(userPanel.getByText(accessJustificationEdit)).toBeVisible();
    await expect(userPanel.getByText(emailAddressEdit)).toBeVisible();
    await expect(page.getByText(addressEdit)).toBeVisible();
    await expect(page.getByText(cityEdit)).toBeVisible();
    await expect(page.getByText(stateEdit)).toBeVisible();
    await expect(userPanel.getByText(securityRole)).toBeVisible();
    await expect(userPanel.getByText(memberRole)).toBeVisible();
});


 */






















/*
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test('2_EditExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ExternalUserCrud`;
    const group = `Users`;
    const tab = `External`;
    const logInId = `QA-ExUserC`; // original login ID
    const securityRole = `External User`;
    const memberRole = `All Member Access`;

    const firstName = `ExUserC2`;
    const lastName = `QAWolf2`;

    // New edit data
    const firstNameEdit = `ExUserC2-edit`;
    const lastNameEdit = `QAWolf2-edit`;
    const titleEdit = `QAE3`;
    const accessJustificationEdit = `Provider`;
    const emailAddressEdit = faker.internet.email({ firstName: 'ExUserC3' });
    const externalAccessTypeEdit = `Local Team User`;
    const phoneEdit = faker.phone.number("###-###-####");
    const addressEdit = faker.location.streetAddress();
    const cityEdit = faker.location.city();
    const zipCodeEdit = faker.location.zipCode();
    const stateEdit = faker.location.state();

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

    await waitUntilLoaded(page);

    // Wait for grid in default Internal tab
    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });

    //--------------------------------
    // Switch to External tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const externalTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(externalTabPanel).toBeVisible({ timeout: 20000 });
    await waitUntilLoaded(page);

    //--------------------------------
    // Search and open existing user
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(firstName);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: firstName, exact: true }).dblclick();

    //--------------------------------
    // Click Edit
    //--------------------------------
    await page.getByRole('button', { name: ' Edit' }).click();

    // Wait for edit mode to activate
    await page.locator('input#user_first_name').waitFor({ state: 'visible' });

    //--------------------------------
    // Act - Fill edited fields
    //--------------------------------
    await page.locator('#user_first_name').fill(firstNameEdit);
    await page.locator('#user_last_name').fill(lastNameEdit);






// Locate input and dropdown arrow
    const externalInput = page.locator('input[name="user_external_access_type_id_input"]');
    const dropdownArrow = externalInput.locator('xpath=following-sibling::button[@aria-label="expand combobox"]');

// 1. Open the dropdown
    await dropdownArrow.click();

// 2. Wait for the Kendo listbox to appear
    const listbox = page.locator('#user_external_access_type_id-autocomplete_listbox');
    await listbox.waitFor({ state: 'visible', timeout: 5000 });

// 3. Click the exact option
    await listbox.getByRole('option', { name: externalAccessTypeEdit }).click();










    // Fill remaining fields
    await page.locator('#user_phone_national_number').fill(phoneEdit);
    await page.locator('#user_email_address').fill(emailAddressEdit);
    await page.locator('#user_title').fill(titleEdit);

    // Access Justification
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Access Justification' })
        .getByLabel('expand combobox')
        .first()
        .click();
    await page.getByRole('option', { name: accessJustificationEdit }).locator('span').click();

    await page.locator('#user_address_1').fill(addressEdit);
    await page.locator('#user_city').fill(cityEdit);
    await page.locator('#user_zip').fill(zipCodeEdit);
    await page.locator('input[name="user_state_id_input"]').fill(stateEdit);
    await page.getByText(stateEdit).click();








    //--------------------------------
// Save
//--------------------------------
    await page.getByRole('button', { name: ' Save and Close' }).click();
    await waitUntilLoaded(page);

// Check if an error popup appeared
    const errorPopup = page.locator('text=A problem occurred during save');
    if (await errorPopup.isVisible({ timeout: 1000 })) {
        // Assert the error text
        await expect(errorPopup).toHaveText('A problem occurred during save. Please contact the system administrator and view server logs for more information.');
        console.log('Save failed as expected, ending test.');
        return; // End test here
    }

//--------------------------------
// Assert edited values (only if save succeeded)
//--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(emailAddressEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: firstNameEdit, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: lastNameEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: titleEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddressEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustificationEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: externalAccessTypeEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();



    await browser.close();

});



 */



































import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import * as helpers from "../../../../helpers/Node20Helpers.js";
import {env} from "../../../../environments/qawolf2.env.js";

test('2_EditExternalUser', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    //const loginID = `ExternalUserCrud`;
    //const loginID = `emailUsers`;
    const group = `Users`;
    const tab = `External`;
    const logInId = `QA-ExUserC`; // original login ID
    const securityRole = `External User`;
    const memberRole = `All Member Access`;

    const firstName = `ExUserC2`;
    const lastName = `QAWolf2`;

    // New edit data
    const firstNameEdit = `ExUserC2-edit`;
    const lastNameEdit = `QAWolf2-edit`;
    const titleEdit = `QAE3`;
    const accessJustificationEdit = `Provider`;
    const emailAddressEdit = faker.internet.email({ firstName: 'ExUserC3' });
    const externalAccessTypeEdit = `Local Team User`;
    const phoneEdit = faker.phone.number("###-###-####");
    const addressEdit = faker.location.streetAddress();
    const cityEdit = faker.location.city();
    const zipCodeEdit = faker.location.zipCode();
    const stateEdit = faker.location.state();

    //--------------------------------
    // Login
    //--------------------------------

    //const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });

    //--------------------------------
    // Navigate to Users
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`Users & Roles`).click();
    await page.getByRole(`treeitem`, { name: group }).locator(`span`).first().click();

    await waitUntilLoaded(page);

    // Wait for grid in default Internal tab
    await page
        .getByRole('tabpanel', { name: 'Internal' })
        .getByRole('grid')
        .waitFor({ state: 'visible', timeout: 20000 });

    //--------------------------------
    // Switch to External tab
    //--------------------------------
    await page.getByRole('tab', { name: tab }).click();
    const externalTabPanel = page.getByRole('tabpanel', { name: tab });
    await expect(externalTabPanel).toBeVisible({ timeout: 20000 });
    await waitUntilLoaded(page);

    //--------------------------------
    // Search and open existing user
    //--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(firstName);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: firstName, exact: true }).dblclick();

    //--------------------------------
    // Click Edit
    //--------------------------------
    await page.getByRole('button', { name: ' Edit' }).click();


    await waitUntilLoaded(page);

    // Wait for edit mode to activate
    await page.locator('input#user_first_name').waitFor({ state: 'visible' });

    //--------------------------------
    // Act - Fill edited fields
    //--------------------------------
    await page.locator('#user_first_name').fill(firstNameEdit);
    await page.locator('#user_last_name').fill(lastNameEdit);


    await waitUntilLoaded(page);



// Locate input and dropdown arrow
    const externalInput = page.locator('input[name="user_external_access_type_id_input"]');
    const dropdownArrow = externalInput.locator('xpath=following-sibling::button[@aria-label="expand combobox"]');

// 1. Open the dropdown
    await dropdownArrow.click();

// 2. Wait for the Kendo listbox to appear
    const listbox = page.locator('#user_external_access_type_id-autocomplete_listbox');
    await listbox.waitFor({ state: 'visible', timeout: 5000 });

// 3. Click the exact option
    await listbox.getByRole('option', { name: externalAccessTypeEdit }).click();










    // Fill remaining fields
    await page.locator('#user_phone_national_number').fill(phoneEdit);
    await page.locator('#user_email_address').fill(emailAddressEdit);
    await page.locator('#user_title').fill(titleEdit);

    // Access Justification
    await page
        .locator('#record-div div')
        .filter({ hasText: 'Access Justification' })
        .getByLabel('expand combobox')
        .first()
        .click();
    await page.getByRole('option', { name: accessJustificationEdit }).locator('span').click();

    await page.locator('#user_address_1').fill(addressEdit);
    await page.locator('#user_city').fill(cityEdit);
    await page.locator('#user_zip').fill(zipCodeEdit);
    await page.locator('input[name="user_state_id_input"]').fill(stateEdit);
    await page.getByText(stateEdit).click();








    //--------------------------------
// Save
//--------------------------------
    await page.getByRole('button', { name: ' Save and Close' }).click();
    await waitUntilLoaded(page);

// Check if an error popup appeared
    const errorPopup = page.locator('text=A problem occurred during save');
    if (await errorPopup.isVisible({ timeout: 1000 })) {
        // Assert the error text
        await expect(errorPopup).toHaveText('A problem occurred during save. Please contact the system administrator and view server logs for more information.');
        console.log('Save failed as expected, ending test.');
        return; // End test here
    }

//--------------------------------
// Assert edited values (only if save succeeded)
//--------------------------------
    await externalTabPanel.getByPlaceholder('Search...').fill(emailAddressEdit);
    await externalTabPanel.locator('#admin-search-button').click();
    await waitUntilLoaded(page);

    await expect(page.getByRole('gridcell', { name: logInId })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: firstNameEdit, exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: lastNameEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: titleEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: emailAddressEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: accessJustificationEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: externalAccessTypeEdit })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: securityRole })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: memberRole })).toBeVisible();



    await browser.close();

});


























