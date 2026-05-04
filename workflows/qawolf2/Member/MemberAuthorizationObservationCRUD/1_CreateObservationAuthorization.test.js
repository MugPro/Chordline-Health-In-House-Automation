import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';




//--------------------------------
// Local helper: robust dropdown selection
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
            const notif = page.getByText('Notification', { exact: true });
            if (await notif.isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.getByRole('button', { name: 'Okay' }).click();
                await page.locator(lookupButtonSelector).click({ timeout: 3000 });
            }
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
    const rowSelector = `${gridId} table tbody tr:visible:has-text("${memberIdentifier}")`;
    const rowsExist = await waitForRows(page, rowSelector, 15000); // wait up to 15s

    if (!rowsExist) {
        console.log(`No records found for ${loginID}. Nothing to delete.`);
        return;
    }

    console.log(`Records found for ${loginID}. Deleting...`);

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
    console.log(`Cleanup complete. Remaining rows for ${loginID}: ${remaining}`);
}












//--------------------------------
// Test
//--------------------------------
test('Create Observation Authorization', async () => {
    //const loginID = 'AdvancedSearch';
    //const password = process.env.DEFAULT_PASS_OCT_2025;
    const member = {
        name: 'Blackwell, Megan',
        insuranceCompany: 'Excellent Health Plan',
        identifier: 'B9824538',
        plan: 'PLAN B',
        startDate: '07/14/2024',
    };
    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';
    const authorizationType = 'Observation';
    const authType = 'OBS';
    const patientStatus = 'Admitted';
    const authStatus = 'In Progress';
    const team = 'Case Team';
    const provider = "St. Catherine's Hospital";

    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });


    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper


    // Login
    const { page, browser } = await helpers.logIn3({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    // Clean-up previous authorizations
    await NewCleanupTabOnMembersPage(page, { tab, memberName: member.name, loginID, gridId, memberIdentifier: member.identifier });

    //--------------------------------
    // Act: Create Authorization
    //--------------------------------
    await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
    await page.getByLabel(member.name).getByText(authorizationType, { exact: true }).click();

    await selectRequiredDropdown(page, 'input[name="aush_inpatient_status_id__1_input"]', patientStatus);
    await page.getByRole('button', { name: '' }).nth(2).click(); // clear
    await selectRequiredDropdown(page, 'input[name="aush_status_id__1_input"]', authStatus);

    await page.locator('button:near(#aush_admit_date__1) >> nth=0').click();
    await page.getByLabel('Current focused date is').getByText(`${todaysDateDay}`).click();

    await selectRequiredDropdown(page, 'input[name="auth_team_reference_id_input"]', team);
    await selectRequiredDropdown(page, 'input[name="auth_reviewer_user_id_input"]', loginID);

    await selectProvider(page, 'auth_provider_1_site_id', provider);
    await selectProvider(page, 'auth_provider_2_site_id', provider);

    await page.getByRole('button', { name: ' Save' }).click();
    await helpers.waitUntilLoaded(page);

    // Handle Worklog if present
    let worklogActivityDate = 'N/A';
    try {
        await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });
        worklogActivityDate = await page.locator('#work_activity_date').evaluate(e => e.value);
        worklogActivityDate = worklogActivityDate.substring(0, 14);
        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {
        await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
    }

    await helpers.waitUntilLoaded(page);

    // Grab Auth Number
    const authNumber = (await page.getByText('Observation Auth #').innerText()).split('#')[1];

    //--------------------------------
    // Assert: Latest Authorization
    //--------------------------------
    await page.getByRole('button', { name: ' All Auths' }).click();
    await helpers.waitUntilLoaded(page);


    // Locate the specific authorization row by authNumber
    const authRow = page.locator(`${gridId} table tbody tr:visible:has-text("${authNumber}")`);
    await authRow.waitFor({ state: 'visible', timeout: 5000 });

// Assert all expected columns are present
    const authRowText = await authRow.innerText();
    [
        authNumber,
        member.identifier,
        authType,
        patientStatus,
        `${todaysDate} 12:00:00 AM`,
        team,
        "Pending",
        provider
    ].forEach(str => expect(authRowText).toContain(str));

await browser.close();

});
