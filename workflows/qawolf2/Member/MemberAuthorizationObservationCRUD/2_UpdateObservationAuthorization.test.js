/*import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

//--------------------------------
// Local helper: dropdown selection
//--------------------------------
async function selectRequiredDropdown(page, inputSelector, optionText) {
    const input = page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await input.fill(optionText);
    await page.waitForTimeout(300);
    await input.press('ArrowDown');
    await input.press('Enter');
    await input.evaluate(el => el.blur());
}

//--------------------------------
// Local helper: provider lookup
//--------------------------------
async function selectProvider(page, providerFieldName, providerName) {
    const lookupButtonSelector = `[name="${providerFieldName}"] ~ button[title="Lookup"]`;

    await page.locator(lookupButtonSelector).click();
    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('checkbox', { name: 'In Network' }).check();
    await page.getByRole('textbox', { name: 'Search...' }).fill(providerName);


    //await page.locator('#lookup-search-button').click();


    const lookupDialog = page.getByRole('dialog', { name: 'Lookup' });

    await lookupDialog
        .locator('#lookup-search-button')
        .first()
        .click();




    await page.getByRole('gridcell', { name: providerName }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();
}

//--------------------------------
// Test
//--------------------------------
test('UpdateObservationAuthorization', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'ObservationCRUD';
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const member = {
        name: 'Blackwell, Megan',
        insuranceCompany: 'Excellent Health Plan',
        identifier: 'B9824538',
        plan: 'PLAN B',
        startDate: '07/14/2024',
    };

    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';
    const patientStatus = 'Admitted';
    const authStatus = 'In Progress';
    const team1 = 'Case Team';
    const team2 = 'Compliance Team';
    const provider = "St. Catherine's Hospital";

    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    // Login
    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    // Clean slate
    await helpers.cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Create minimal Observation auth
    //--------------------------------
    await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
    await page.getByLabel(member.name).getByText('Observation', { exact: true }).click();

    await selectRequiredDropdown(
        page,
        'input[name="aush_inpatient_status_id__1_input"]',
        patientStatus,
    );

    await page.getByRole('button', { name: '' }).nth(2).click();

    await selectRequiredDropdown(
        page,
        'input[name="aush_status_id__1_input"]',
        authStatus,
    );




    await page
        .getByRole('button', { name: 'Open the date view' })
        .first()
        .click();








    const calendar = page.locator('.k-calendar');

    await calendar
        .getByRole('gridcell', { name: `${todaysDateDay}` })
        .first()
        .click();







    await selectRequiredDropdown(page, 'input[name="auth_team_reference_id_input"]', team1);
    await selectRequiredDropdown(page, 'input[name="auth_reviewer_user_id_input"]', loginID);

    await selectProvider(page, 'auth_provider_1_site_id', provider);
    await selectProvider(page, 'auth_provider_2_site_id', provider);

    await page.getByRole('button', { name: ' Save' }).click();
    await helpers.waitUntilLoaded(page);

    let worklogActivityDate = 'N/A';
    try {
        await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
        worklogActivityDate = (await page.locator('#work_activity_date').inputValue()).substring(0, 14);
        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {}

    await helpers.waitUntilLoaded(page);

    const authNumber = (await page.getByText('Observation Auth #').innerText()).split('#')[1];
    const row = `${gridId} table tbody tr:visible:has-text("${loginID}")`;
    const worklogRow = '#worklogs-child-grid tbody tr:visible';

    //--------------------------------
    // Act (UPDATE)
    //--------------------------------
    const saveButton = page.getByRole('button', { name: ' Save' });

    await page.locator(row).hover();
    await page.locator(`${row} .k-grid-editAction`).click();

    await expect(saveButton).not.toBeEnabled();
    expect(await page.locator('#auth_request_date').inputValue()).toContain(todaysDate);

    await page.getByRole('button', { name: '' }).nth(1).click();

    await page
        .locator(`[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`)
        .click();
    await page.getByRole('option').getByText(team2).click();

    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await helpers.waitUntilLoaded(page);

    let worklogActivityDate2 = 'N/A';
    try {
        await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
        worklogActivityDate2 = (await page.locator('#work_activity_date').inputValue()).substring(0, 14);
        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {}

    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(saveButton).not.toBeVisible();
    await expect(page.getByText(`Observation Auth #${authNumber}`)).toBeVisible();

    await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();
    await expect(page.getByText(`* Observation Status: ${patientStatus}`)).toBeVisible();

    if (worklogActivityDate2 !== 'N/A') {
        await expect(page.locator(worklogRow)).toHaveCount(2);
    }

    await page.getByRole('button', { name: ' All Auths' }).click();
    const rowText = await page.locator(row).innerText();
    expect(rowText).toContain(team2);
});


 */









/*

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

//--------------------------------
// Local helper: dropdown selection
//--------------------------------
async function selectRequiredDropdown(page, inputSelector, optionText) {
    const input = page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await input.fill(optionText);
    await page.waitForTimeout(300);
    await input.press('ArrowDown');
    await input.press('Enter');
    await input.evaluate(el => el.blur());
}

//--------------------------------
// Local helper: provider lookup
//--------------------------------
async function selectProvider(page, providerFieldName, providerName) {
    const lookupButtonSelector = `[name="${providerFieldName}"] ~ button[title="Lookup"]`;

    await page.locator(lookupButtonSelector).click();
    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('checkbox', { name: 'In Network' }).check();
    await page.getByRole('textbox', { name: 'Search...' }).fill(providerName);

    const lookupDialog = page.getByRole('dialog', { name: 'Lookup' });

    await lookupDialog.locator('#lookup-search-button').first().click();
    await page.getByRole('gridcell', { name: providerName }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();
}

//--------------------------------
// Local helper: handle duplicate popup
//--------------------------------
async function handleDuplicatePopup(page) {
    const duplicatePopupButton = page.locator('#positiveButton');
    try {
        await duplicatePopupButton.waitFor({ state: 'visible', timeout: 3000 });
        if (await duplicatePopupButton.isEnabled()) {
            console.log('Duplicate authorization popup detected. Clicking Okay...');
            await duplicatePopupButton.click();
            await duplicatePopupButton.waitFor({ state: 'hidden', timeout: 5000 });
            await helpers.waitUntilLoaded(page);
        }
    } catch {
        console.log('No duplicate popup appeared.');
    }
}

//--------------------------------
// Local helper: close work log/time spent dialogs
//--------------------------------
async function closeWorkLogDialogs(page) {
    try {
        const saveCloseButton = page.getByRole('button', { name: ' Save and Close' });
        await expect(saveCloseButton).toBeVisible({ timeout: 3000 });
        await saveCloseButton.click();
        await helpers.waitUntilLoaded(page);
    } catch {
        // Dialog not present, ignore
    }
}

//--------------------------------
// Test
//--------------------------------
test('UpdateObservationAuthorization', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'ObservationCRUD';
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const member = {
        name: 'Blackwell, Megan',
        insuranceCompany: 'Excellent Health Plan',
        identifier: 'B9824538',
        plan: 'PLAN B',
        startDate: '07/14/2024',
    };

    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';
    const patientStatus = 'Admitted';
    const authStatus = 'In Progress';
    const team1 = 'Case Team';
    const team2 = 'Compliance Team';
    const provider = "St. Catherine's Hospital";

    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    // Login
    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    // Clean slate
    await helpers.cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Create minimal Observation auth
    //--------------------------------
    await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
    await page.getByLabel(member.name).getByText('Observation', { exact: true }).click();

    await selectRequiredDropdown(page, 'input[name="aush_inpatient_status_id__1_input"]', patientStatus);
    await page.getByRole('button', { name: '' }).nth(2).click();
    await selectRequiredDropdown(page, 'input[name="aush_status_id__1_input"]', authStatus);

    await page.getByRole('button', { name: 'Open the date view' }).first().click();
    const calendar = page.locator('.k-calendar');
    await calendar.getByRole('gridcell', { name: `${todaysDateDay}` }).first().click();

    await selectRequiredDropdown(page, 'input[name="auth_team_reference_id_input"]', team1);
    await selectRequiredDropdown(page, 'input[name="auth_reviewer_user_id_input"]', loginID);

    await selectProvider(page, 'auth_provider_1_site_id', provider);
    await selectProvider(page, 'auth_provider_2_site_id', provider);

    //--------------------------------
    // Save and handle duplicate popup + Work Log
    //--------------------------------
    const saveButton = page.getByRole('button', { name: ' Save' });
    await saveButton.click();
    await helpers.waitUntilLoaded(page);

    await handleDuplicatePopup(page);
    await closeWorkLogDialogs(page);

    //--------------------------------
    // Get Auth Number
    //--------------------------------
    const authNumber = (await page.getByText('Observation Auth #').innerText()).split('#')[1];

    //--------------------------------
    // Act (UPDATE)
    //--------------------------------
    const rowSelector = `${gridId} table tbody tr:visible:has-text("${loginID}")`;

    // Navigate back to grid to ensure row exists
    const allAuthsButton = page.getByRole('button', { name: ' All Auths' });
    await allAuthsButton.click();
    await page.locator(rowSelector).first().waitFor({ state: 'visible', timeout: 10000 });

    //await page.locator(rowSelector).first().hover();
    //await page.locator(`${rowSelector} .k-grid-editAction`).click();







    // Wait for the row itself
    const row = page.locator(rowSelector).first();
    await row.waitFor({ state: 'visible', timeout: 15000 });

// Get the edit button inside the row
    const editButton = row.locator('.k-grid-editAction');

// Wait until attached to DOM
    await editButton.waitFor({ state: 'attached', timeout: 15000 });

// Ensure the button is enabled and hoverable
    await row.hover();
    await expect(editButton).toBeEnabled({ timeout: 10000 });

// Click
    await editButton.click();












    await expect(saveButton).not.toBeEnabled();
    expect(await page.locator('#auth_request_date').inputValue()).toContain(todaysDate);

    await page.getByRole('button', { name: '' }).nth(1).click();
    await page.locator(`[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`).click();
    await page.getByRole('option').getByText(team2).click();

    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Handle duplicate popup again on update + Work Log dialogs
    await handleDuplicatePopup(page);
    await closeWorkLogDialogs(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(saveButton).not.toBeVisible();
    await expect(page.getByText(`Observation Auth #${authNumber}`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();
    await expect(page.getByText(`* Observation Status: ${patientStatus}`)).toBeVisible();
});


 */









import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

//--------------------------------
// Local helper: dropdown selection
//--------------------------------

async function selectRequiredDropdown(page, inputSelector, optionText) {
    const input = page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 }); // wait until visible
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true }); // focus the input
    await input.fill(optionText);       // type option text
    await page.waitForTimeout(300);     // allow dropdown to populate
    await input.press('ArrowDown');     // highlight first matching option
    await input.press('Enter');         // select it
    await input.evaluate(el => el.blur()); // trigger change event
}

//--------------------------------
// Local helper: provider selection
//--------------------------------
async function selectProvider(page, providerFieldName, providerName) {
    const lookupButtonSelector = `[name="${providerFieldName}"] ~ button[title="Lookup"]`;

    try {
        await page.locator(lookupButtonSelector).click({ timeout: 3000 });
    } catch {
        // Handle possible notification pop-up
        try {
            await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({ timeout: 3000 });
            await page.getByRole(`button`, { name: `Okay` }).click({ timeout: 3000 });
            await page.locator(lookupButtonSelector).click({ timeout: 3000 });
        } catch {}
    }

    // Check In/Out of Network
    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    // Search for provider
    await page.getByRole(`textbox`, { name: `Search...` }).fill(providerName);
    await page.getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();

    // Select first matching provider
    await page.getByRole(`gridcell`, { name: providerName }).first().click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();
}

//--------------------------------
// Local helper: handle duplicate popup
//--------------------------------
async function handleDuplicatePopup(page) {
    const duplicatePopupButton = page.locator('#positiveButton');
    try {
        await duplicatePopupButton.waitFor({ state: 'visible', timeout: 3000 });
        if (await duplicatePopupButton.isEnabled()) {
            console.log('Duplicate authorization popup detected. Clicking Okay...');
            await duplicatePopupButton.click();
            await duplicatePopupButton.waitFor({ state: 'hidden', timeout: 5000 });
            await helpers.waitUntilLoaded(page);
        }
    } catch {
        console.log('No duplicate popup appeared.');
    }
}

//--------------------------------
// Local helper: close work log/time spent dialogs
//--------------------------------
async function closeWorkLogDialogs(page) {
    try {
        const saveCloseButton = page.getByRole('button', { name: ' Save and Close' });
        await expect(saveCloseButton).toBeVisible({ timeout: 3000 });
        await saveCloseButton.click();
        await helpers.waitUntilLoaded(page);
    } catch {
        // Dialog not present, ignore
    }
}

//--------------------------------
// Test
//--------------------------------
test('UpdateObservationAuthorization', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'ObservationCRUD';
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const member = {
        name: 'Blackwell, Megan',
        insuranceCompany: 'Excellent Health Plan',
        identifier: 'B9824538',
        plan: 'PLAN B',
        startDate: '07/14/2024',
    };

    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';
    const patientStatus = 'Admitted';
    const authStatus = 'In Progress';
    const team1 = 'Case Team';
    const team2 = 'Compliance Team';
    const provider = "St. Catherine's Hospital";

    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    // Login
    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    // Clean slate
    await helpers.cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Create minimal Observation auth
    //--------------------------------
    await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
    await page.getByLabel(member.name).getByText('Observation', { exact: true }).click();

    await selectRequiredDropdown(page, 'input[name="aush_inpatient_status_id__1_input"]', patientStatus);
    await page.getByRole('button', { name: '' }).nth(2).click();
    await selectRequiredDropdown(page, 'input[name="aush_status_id__1_input"]', authStatus);

    await page.getByRole('button', { name: 'Open the date view' }).first().click();
    const calendar = page.locator('.k-calendar');
    await calendar.getByRole('gridcell', { name: `${todaysDateDay}` }).first().click();

    await selectRequiredDropdown(page, 'input[name="auth_team_reference_id_input"]', team1);
    await selectRequiredDropdown(page, 'input[name="auth_reviewer_user_id_input"]', loginID);




    await selectRequiredDropdown(page, `input[name="auth_reviewer_user_id_input"]`, loginID);

    // Provider 1
    await selectProvider(page, "auth_provider_1_site_id", provider);

    // Provider 2 (Admitting)
    await selectProvider(page, "auth_provider_2_site_id", provider);


    //--------------------------------
    // Save and handle duplicate popup + Work Log
    //--------------------------------
    const saveButton = page.getByRole('button', { name: ' Save' });
    await saveButton.click();
    await helpers.waitUntilLoaded(page);


    /*
    await handleDuplicatePopup(page);
    await closeWorkLogDialogs(page);

     */



    await helpers.waitUntilLoaded(page);

    // Work log handling
    let worklogActivityDate = "N/A";
    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        worklogActivityDate = await page.locator(`#work_activity_date`).evaluate((e) => e.value);
        worklogActivityDate = worklogActivityDate.substring(0, 14);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({ timeout: 3000 });
    }

    await helpers.waitUntilLoaded(page);




    //--------------------------------
    // Get Auth Number
    //--------------------------------
    const authNumber = (await page.getByText('Observation Auth #').innerText()).split('#')[1];

    //--------------------------------
    // Act (UPDATE)
    //--------------------------------
    const rowSelector = `${gridId} table tbody tr:visible:has-text("${loginID}")`;

    // Navigate back to grid to ensure row exists
    const allAuthsButton = page.getByRole('button', { name: ' All Auths' });
    await allAuthsButton.click();
    await page.locator(rowSelector).first().waitFor({ state: 'visible', timeout: 10000 });

    //await page.locator(rowSelector).first().hover();
    //await page.locator(`${rowSelector} .k-grid-editAction`).click();







    // Wait for the row itself
    const row = page.locator(rowSelector).first();
    await row.waitFor({ state: 'visible', timeout: 15000 });

// Get the edit button inside the row
    const editButton = row.locator('.k-grid-editAction');

// Wait until attached to DOM
    await editButton.waitFor({ state: 'attached', timeout: 15000 });

// Ensure the button is enabled and hoverable
    await row.hover();
    await expect(editButton).toBeEnabled({ timeout: 10000 });

// Click
    await editButton.click();












    await expect(saveButton).not.toBeEnabled();
    expect(await page.locator('#auth_request_date').inputValue()).toContain(todaysDate);

    await page.getByRole('button', { name: '' }).nth(1).click();
    await page.locator(`[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`).click();
    await page.getByRole('option').getByText(team2).click();

    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Handle duplicate popup again on update + Work Log dialogs
    await handleDuplicatePopup(page);
    await closeWorkLogDialogs(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(saveButton).not.toBeVisible();
    await expect(page.getByText(`Observation Auth #${authNumber}`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();
    await expect(page.getByText(`* Observation Status: ${patientStatus}`)).toBeVisible();
});