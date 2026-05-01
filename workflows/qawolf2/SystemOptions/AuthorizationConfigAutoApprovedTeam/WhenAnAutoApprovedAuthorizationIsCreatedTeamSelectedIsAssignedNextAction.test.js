// tests/authorization.test.js
import { test, expect } from '@playwright/test';
import {
    logIn,
    createAuthorizationForMember,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    logIn3
} from '../../../../helpers/Node20Helpers.js';
import * as dateFns from "date-fns";
import { format } from 'date-fns';
import {env} from "../../../../environments/qawolf2.env.js";



async function waitUntilLoaded2(page, options = {}) {
    // Constants
    const loader = page.locator('#loading');

    try {
        if (await loader.isVisible({ timeout: 4000 }).catch(() => false)) {
            await loader.waitFor({ state: 'hidden', timeout: 30000 });
        }
    } catch (e) {
        console.log('Loader wait skipped:', e.message);
    }
}


test('When an auto approved Authorization is created, the team selected is assigned to the Next Action', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const bedLevel = `Behavioral Health`;
    const today = Date.now();
    const loginID = `TouchRecord`;
    const lastFirstName = `Ace, Clancy`;
    const authorizationType = `Inpatient`;
    const patientStatus = `Admitted`;
    const admitDate = dateFns.format(today, "MM dd yyyy hh mm ss aa"); // 07/25/2025 12:00:00 AM
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const reviewer = `${loginID} Qaw`;





    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;


    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 1000,
    });


    try {
        await cleanupTabOnMembersPage(page, {
            tab: "Authorizations",
            gridId: '[id="authorizations-grid"]',
            memberName: lastFirstName,
            loginID,
        });
    } catch (e) {
        await reportCleanupFailed({
            dedupKey: "cleanupTabOnMembersPage",
            errorMsg: e.message,
        });
    }



    //--------------------------------
    // Act
    //--------------------------------
    // Navigate to Tools > System Options > Configuration
    await page.getByText('Tools').click();
    await page.getByText('System Options').click();
    await page.getByText('Configuration', { exact: true }).click();

    // Scroll "Authorization Configuration" into view
    await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

    try {
        await expect(page.locator(`#AuthConfig_AuthConversion_Yes`)).toBeChecked();
    } catch {
        await page.locator(`#AuthConfig_AuthConversion_Yes`).check();
    }

    await page.getByRole(`button`, { name: `Save and Close` }).click();
   // await waitUntilLoaded2(page);
    // Create authorization



    /*
        const { authNum } = await createAuthorizationForMember(page, {
            lastFirstName,
            authorizationType,
            patientStatus,
            admitDate,
            authStatus,
            team,
            reviewer,
        });*/


    let worklogActivityDate = `No worklog appeared please check system configurations > Worklogs`;

    // Navigate to Home
    await page.getByText(`Home`, { exact: true }).click();

    // Navigate to the Members tab
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

    // Search for a member
    await page.getByRole(`textbox`, { name: `Search...` }).fill(lastFirstName);
    await page.keyboard.press("Enter");

    // Select the member to open member page
    await page.getByRole(`gridcell`, { name: lastFirstName }).dblclick();
   // await waitUntilLoaded(page);

    // Click the "Authorizations" tab
    await page.locator(`#authorizations-menu`).click();

    // Hover over "+ Authorization" button and select option >> Inpatient
    await page
        .getByRole(`button`)
        .filter({ hasText: `Authorization Inpatient` })
        .hover();
    await page
        .getByLabel(lastFirstName)
        .getByText(authorizationType, { exact: true })
        .click();



    if (authorizationType === "Inpatient" || authorizationType === "Observation") {
        // Fill in the inpatient status and select the option
        await page
            .locator(`input[name="aush_inpatient_status_id__1_input"]`)
            .fill(patientStatus);
        await page
            .getByRole(`option`, { name: patientStatus })
            .locator(`span`)
            .click();
    }

    if (authorizationType === "Inpatient") {
        // Fill in the "Admit Date:"
        await page.locator(`#aush_admit_date__1`).click();
        await page.locator(`#aush_admit_date__1`).clear();
        await page.locator(`#aush_admit_date__1`).pressSequentially(admitDate);
    }

    // Fill in "Auth Status:" and select option
    await page.getByRole(`button`, { name: `` }).nth(2).click();
    await page.locator(`input[name="aush_status_id__1_input"]`).clear();

   // await waitUntilLoaded(page);

    await page.locator(`input[name="aush_status_id__1_input"]`).fill(authStatus);
    await page.getByRole(`option`, { name: authStatus }).locator(`span`).click();

    // Fill in the "Summary > Team" section and select option
    await page.locator(`input[name="auth_team_reference_id_input"]`).fill(team);
    await page.getByRole(`option`, { name: team }).click();

    if (authorizationType === "Outpatient" || authorizationType === "Observation") {
        await page
            .locator(`input[name="auth_reviewer_user_id_input"]`)
            .fill(reviewer);
        await page
            .getByRole(`option`, { name: `${reviewer}` })
            .locator(`span`)
            .click();
    }

    // TODO: Need to make this dynamic possibly
    // Select Provider
    await page
        .locator(`[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`)
        .click();




    // Check In and Out of Network boxes
    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    // Search for the provider
    await page
        .getByRole(`textbox`, { name: `Search...` })
        .fill(`St. Catherine's Hospital`);
    await page
        .getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();
    await page
        .getByRole(`gridcell`, { name: `St. Catherine's Hospital` })
        .first()
        .click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();







// Handle the "Notification" pop up for admitting hospital duplicate
    await expect(page.getByText(`Notification`, { exact: true })).toBeVisible();
    await page.getByRole(`button`, { name: `Okay` }).click();





    // Select Provider
    await page
        .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
        .click();




    // Check In and Out of Network boxes
    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    // Search for the provider
    await page
        .getByRole(`textbox`, { name: `Search...` })
        .fill(`St. Catherine's Hospital`);
    await page
        .getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();
    await page
        .getByRole(`gridcell`, { name: `St. Catherine's Hospital` })
        .first()
        .click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();
    // Click the "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    //await waitUntilLoaded(page);

    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible();
        // Grab the work activity date of the work log
        worklogActivityDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible();
    }
   // await waitUntilLoaded(page);

    // Grab the "Auth #"
    await page.locator(`#form-header .headerLabel`).waitFor();
    const authNum = await page.locator(`#form-header .headerLabel`).innerText();




    // Add Bed Day
    await page.getByRole('button', { name: '  Bed Day' }).click();
    //await waitUntilLoaded(page);


/*
    await page.locator('input[name="auli_requested_bed_level_input"]')
        .fill(bedLevel);

    const listbox = page.locator('#auli_requested_bed_level-autocomplete_listbox');

    await expect(listbox).toBeVisible();

    await listbox
        .locator('li[role="option"]')
        .filter({ hasText: new RegExp(`^${bedLevel}$`) })
        .click();





    // 👇 wait for dropdown to close
    await expect(listbox).toBeHidden();

 */










    const bedLevelInput = page.locator('input[name="auli_requested_bed_level_input"]');
    const listbox = page.locator('#auli_requested_bed_level-autocomplete_listbox');

    await bedLevelInput.click();
    await bedLevelInput.fill(bedLevel);

// 🔑 Force the autocomplete dropdown to open
    await bedLevelInput.press('ArrowDown');

// ✅ Wait until it is actually opened (Kendo uses aria-hidden)
    await expect(listbox).toHaveAttribute('aria-hidden', 'false');

    await listbox
        .getByRole('option', { name: bedLevel, exact: true })
        .click();

// ✅ Wait until dropdown closes again
    await expect(listbox).toHaveAttribute('aria-hidden', 'true');






});