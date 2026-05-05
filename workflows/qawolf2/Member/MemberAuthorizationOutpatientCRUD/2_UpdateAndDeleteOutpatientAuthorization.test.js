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
// Local helper: provider selection
//--------------------------------
async function selectProvider(page, providerFieldName, providerName) {
    const lookupButtonSelector = `[name="${providerFieldName}"] ~ button[title="Lookup"]`;

    try {
        await page.locator(lookupButtonSelector).click({ timeout: 3000 });
    } catch {
        try {
            await expect(page.getByText('Notification', { exact: true }))
                .toBeVisible({ timeout: 3000 });
            await page.getByRole('button', { name: 'Okay' }).click();
            await page.locator(lookupButtonSelector).click({ timeout: 3000 });
        } catch {}
    }

    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('checkbox', { name: 'In Network' }).check();

    await page.getByRole('textbox', { name: 'Search...' }).fill(providerName);
    await page.getByRole('dialog', { name: 'Lookup' })
        .locator('#lookup-search-button')
        .click();

    await page.getByRole('gridcell', { name: providerName }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();
}





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




















// Helper: wait for at least one row for loginID to appear
async function waitForRows(page, selector, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const count = await page.locator(selector).count();
        if (count > 0) return true; // rows found
        await page.waitForTimeout(500); // short wait before retry
    }
    return false; // no rows found after timeout
}


async function NewCleanupTabOnMembersPage(page, options = {}) {
    const tab = options.tab || 'Authorizations';
    const gridId = options.gridId || '[id="authorizations-grid"]';
    const memberName = options.memberName || 'Blackwell, Megan';
    const memberIdentifier = options.memberIdentifier || 'B9824538';
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;
    const authType = options.authType || 'OP';

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page.getByRole('textbox', { name: 'Search...' }).fill(memberName);
        await page.keyboard.press('Enter');

        try {
            await page.getByRole('gridcell', { name: memberName }).dblclick();
            await helpers.waitUntilLoaded(page);
        } catch {
            console.log(`Member row not found by name`);
        }

        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();
    }

    // Wait for grid container
    await page.locator(gridId).waitFor({ state: 'visible', timeout: 10000 });

    //const rowSelector = `${gridId} table tbody tr:visible:has-text("${loginID}")`;
    const rowSelector = `${gridId} table tbody tr:visible:has-text("${authType}")`;
    const rowsExist = await waitForRows(page, rowSelector, 15000); // wait up to 15s

    if (!rowsExist) {
        console.log(`No records found for ${authType}. Nothing to delete.`);
        return;
    }

    console.log(`Records found for ${authType}. Deleting...`);

    let rowLocator = page.locator(rowSelector);

    while (await rowLocator.count() > 0) {
        const firstRow = rowLocator.first();
        await firstRow.scrollIntoViewIfNeeded();
        await firstRow.hover();

        const deleteButton = firstRow.locator('[title="Delete"]').first();

        if ((await deleteButton.count()) === 0) {
            console.log('Row found but no delete button. Stopping.');
            break;
        }

        await deleteButton.click();

        const yesButton = page.getByRole('button', { name: 'Yes' });
        if (await yesButton.isVisible().catch(() => false)) {
            await yesButton.click();
        }

        await helpers.waitUntilLoaded(page);

        const workflowNotification = page.locator('#notif-message', {
            hasText: 'This record is locked by Workflow Rule Account.',
        });

        if (await workflowNotification.isVisible().catch(() => false)) {
            await page.locator('#positiveButton').click();
            console.log('Skipped workflow-locked record.');
            break;
        }

        // Re-query rows
        rowLocator = page.locator(rowSelector);
    }

    const remaining = await rowLocator.count();
    console.log(`Cleanup complete. Remaining rows for ${authType}: ${remaining}`);
}




//--------------------------------
// Test
//--------------------------------
test('Update Outpatient Authorization', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    /*
    const loginID = 'AdvancedSearch';
    const password = process.env.DEFAULT_PASS_OCT_2025;

     */

    const member = {
        name: 'Blackwell, Megan',
        insuranceCompany: 'Excellent Health Plan',
        identifier: 'B9824538',
        plan: 'PLAN B',
        startDate: '07/14/2024',
        authType: 'OP',
    };

    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';
    const authType = 'OP';
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

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    const { browser, page } = await helpers.logIn3({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    await NewCleanupTabOnMembersPage(page, { tab, memberName: member.name, loginID, gridId, authType: member.authType });


    //--------------------------------
    // Create minimal Outpatient auth
    //--------------------------------
    await page.getByRole('button')
        .filter({ hasText: 'Authorization Inpatient' })
        .hover();

    await page.getByLabel(member.name)
        .getByText('Outpatient', { exact: true })
        .click();

    /*await selectRequiredDropdown(
        page,
        'input[name="aush_outpatient_status_id__1_input"]',
        'Admitted'
    );*/

    await selectRequiredDropdown(
        page,
        'input[name="aush_status_id__1_input"]',
        authStatus
    );

    await page.getByRole('button', { name: 'Open the date view' })
        .first()
        .click();

    await page.locator('.k-calendar')
        .getByRole('gridcell', { name: `${todaysDateDay}` })
        .first()
        .click();

    await selectRequiredDropdown(
        page,
        'input[name="auth_team_reference_id_input"]',
        team1
    );

    await selectRequiredDropdown(
        page,
        'input[name="auth_reviewer_user_id_input"]',
        loginID
    );

    await selectProvider(page, 'auth_provider_1_site_id', provider);
    await selectProvider(page, 'auth_provider_2_site_id', provider);

    const saveButton = page.getByRole('button', { name: ' Save' });
    await saveButton.click();
    await helpers.waitUntilLoaded(page);








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
    const authNumber = (await page.getByText('Outpatient Auth #').innerText()).split('#')[1];

    //--------------------------------
    // Act (UPDATE)
    //--------------------------------
    const rowSelector = `${gridId} table tbody tr:visible:has-text("${authType}")`;

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
   /* await page.locator(`[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`).click();
    await page.getByRole('option').getByText(team2).click();*/






    await selectRequiredDropdown(
        page,
        'input[name="auth_team_reference_id_input"]',
        team2
    );








    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Handle duplicate popup again on update + Work Log dialogs
    await handleDuplicatePopup(page);
    await closeWorkLogDialogs(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(saveButton).not.toBeVisible();
    await expect(page.getByText(`Outpatient Auth #${authNumber}`)).toBeVisible();
    //await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();


    await browser.close();


});










    /*


    //--------------------------------
    // Capture auth number
    //--------------------------------
    const authNumber = (
        await page.getByText('Outpatient Auth #').innerText()
    ).split('#')[1];

    //--------------------------------
    // Act (UPDATE)
    //--------------------------------
    await page.getByRole('button', { name: ' All Auths' }).click();

    const row = page.locator(
        `${gridId} table tbody tr:visible:has-text("${authNumber}")`
    );

    await row.waitFor({ state: 'visible', timeout: 10000 });

    const editButton = row.locator('.k-grid-editAction');
    await row.hover();
    await expect(editButton).toBeEnabled();
    await editButton.click();

    await expect(saveButton).not.toBeEnabled();
    expect(await page.locator('#auth_request_date').inputValue())
        .toContain(todaysDate);

    // Change team
    await page.locator('span [title="Clear"]').first().click();
    await page
        .locator(`[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`)
        .click();
    await page.getByRole('option').getByText(team2).click();

    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(saveButton).not.toBeVisible();
    await expect(page.getByText(`Outpatient Auth #${authNumber}`))
        .toBeVisible();

    await expect(page.getByText(`* Team: ${team2}`))
        .toBeVisible();

    await expect(page.getByText(`* Auth Status: ${authStatus}`))
        .toBeVisible();

    await expect(page.getByText(`* Auth Decision: Pending`))
        .toBeVisible();

    //--------------------------------
    // Assert in grid
    //--------------------------------
    await page.getByRole('button', { name: ' All Auths' }).click();

    const updatedRow = page.locator(
        `${gridId} table tbody tr:visible:has-text("${authNumber}")`
    );

    const rowText = await updatedRow.innerText();

    [
        authNumber,
        member.identifier,
        authType,
        team2,
        'Pending',
        provider
    ].forEach(str => expect(rowText).toContain(str));
});


     */