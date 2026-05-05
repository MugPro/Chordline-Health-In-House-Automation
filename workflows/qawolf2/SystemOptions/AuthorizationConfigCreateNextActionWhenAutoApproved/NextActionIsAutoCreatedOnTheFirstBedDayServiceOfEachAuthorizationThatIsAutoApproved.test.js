//--------------------------------
// workflow.test.js
//--------------------------------

import {logIn, logIn3} from '../../../../helpers/Node20Helpers.js';
import { waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import {
    cleanupTabOnMembersPage,
    createAuthorizationForMember,
    reportCleanupFailed,
} from '../../../../helpers/Node20Helpers.js';
import * as dateFns from "date-fns";
import { format } from 'date-fns';
import { test, expect } from '@playwright/test';
import {env} from "../../../../environments/qawolf2.env.js";

test('Next Action is auto created on the first Bed Day Service of each Authorization that is auto approved', async () => {
    //--------------------------------
    // Arrange
    //-

    const today = Date.now();
    //const loginID = `AuthCreateBedDay`;
    const username = `Auth Create`;
    const lastFirstName = `Ace, Clancy`;
    const authorizationType = `Inpatient`;
    const patientStatus = `Admitted`;
    const admitDate = dateFns.format(today, "MM dd yyyy hh mm ss aa"); // 07/25/2025 12:00:00 AM
    const authStatus = `In Progress`;
    const team = `Case Team`;


    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    const reviewer = `${loginID} Qaw`;
    const bedLevel = `NICU`;

   // const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;


    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 800,
    });

    try {
        await cleanupTabOnMembersPage(page, {
            tab: 'Authorizations',
            gridId: '[id="authorizations-grid"]',
            memberName: lastFirstName,
            loginID: username,
        });
    } catch (e) {
        await reportCleanupFailed({
            dedupKey: "cleanupTabOnMembersPage",
            errorMsg: e.message,
        });
    }

    //--------------------------------
    // Act:
    //--------------------------------
    // Navigate to Tools > System Options
    await page.getByText(`Tools`).click();
    await page.getByText(`System Options`).click();
    await page.getByText(`Configuration`, { exact: true }).click();
    await page.getByText(`Authorization Configuration`).scrollIntoViewIfNeeded();

    // Ensure Auto Approved Next Action is toggled
    try {
        await expect(
            page.locator(`#AuthConfig_AutoApprovedCreateNextAction_Yes`)
        ).toBeChecked();
    } catch {
        await page.locator(`#AuthConfig_AutoApprovedCreateNextAction_Yes`).check();
    }

    // Grab Auto Approved Next Action comment
    await page.getByRole(`button`, { name: `Edit Comment` }).first().click();
    await expect(page.getByText(`Auto Approved Next Action Comment`, { exact: true })).toBeVisible();
    const frame = page.frameLocator(`[id="flyout-div"] [title="Editable area. Press F10 for toolbar."]`);
    const nextActionComment = await frame.locator(`[id="flyout-textarea"]`).innerText({ timeout: 3000 });

    // Save System Options changes
    await page.getByLabel(`Auto Approved Next Action`).getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);
    await page.getByRole(`button`, { name: `Save and Close` }).click();
   // await waitUntilLoaded(page);









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


   // await waitUntilLoaded(page);




















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
    await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({
        timeout: 3000,
    });
    await page.getByRole(`button`, { name: `Okay` }).click({ timeout: 3000 });





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
   // await waitUntilLoaded(page);



    let worklogActivityDate = `No worklog appeared please check system configurations > Worklogs`;


    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        // Grab the work activity date of the work log
        worklogActivityDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({
            timeout: 3000,
        });
    }
    //await waitUntilLoaded(page);

    // Grab the "Auth #"
    await page.locator(`#form-header .headerLabel`).waitFor();
    const authNum = await page.locator(`#form-header .headerLabel`).innerText();


















    // Add Bed Day
    await page.getByRole(`button`, { name: `  Bed Day` }).click();






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






    await page.getByRole('spinbutton').click();
    await page.locator('#auli_requested_units').fill('1');
    await page.locator('#auli_requested_units').press('Tab');







    const serviceRequestDate = (await page.locator('#auli_service_request_date').inputValue()).split(" ")[0];

    /*await page.getByRole(`button`, { name: ` Save`, exact: true }).click();

     */
    //await waitUntilLoaded(page);
    await page.getByRole(`button`, { name: ` Save and Close` }).click();









    //await waitUntilLoaded(page);





    await waitUntilLoaded(page);
    await expect(page.getByText(`New Work Log`)).toBeVisible();
   // await waitUntilLoaded(page);
    await page.getByRole(`button`, { name: ` Save and Close` }).click();










    //--------------------------------
    // Assert:
    //--------------------------------

    await page.locator(`[id="shortcuts"] [data-value="nextactions-anchor"]:visible`).click();

    const grid = page.locator('div[data-parent-table-code="AUTH"][data-table-code="NACT"]');
    const rows = grid.locator('.k-grid-content table.k-grid-table tbody tr');
    await expect(rows).toHaveCount(1);

    const row = rows.first();
    const expectedTexts = ['Medium', 'Bed Day', 'Auto Approval Follow-up', 'Pending', nextActionComment, serviceRequestDate];
    for (const text of expectedTexts) {
        await expect(row).toContainText(text);
    }

    await browser.close();

});