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

//--------------------------------
// Test
//--------------------------------
test('Create Observation Authorization', async () => {
    const loginID = 'AdvancedSearch';
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

    // Login
    const { page, browser } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    // Clean-up previous authorizations
    await helpers.cleanupTabOnMembersPage(page, { tab, memberName: member.name, loginID, gridId });

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



});
