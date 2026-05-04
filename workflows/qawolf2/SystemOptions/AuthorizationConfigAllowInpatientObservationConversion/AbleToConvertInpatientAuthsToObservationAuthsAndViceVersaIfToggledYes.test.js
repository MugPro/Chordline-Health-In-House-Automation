import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
    createAuthorizationForMember,
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




async function NewCreateAuthorizationForMember(page, options = {}) {
    // Constants
    //const { dateFns } = npmImports;
    const today = Date.now();
    const lastFirstName = options.lastFirstName || `Ace, Clancy`;
    const authorizationType = options.authorizationType || `Inpatient`;
    const patientStatus = options.patientStatus || `Admitted`;
    /*const admitDate =
        options.admitDate || dateFns.format(today, "MM dd yyyy hh mm ss aa");*/

    const admitDate =
        options.admitDate || format(today, "MM dd yyyy hh mm ss aa");

    const authStatus = options.authStatus || `In Progress`;
    const team = options.team || `Case Team`;
    const reviewer = options.reviewer;
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
    //await waitUntilLoaded(page);

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

    //await waitUntilLoaded(page);

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

    // TODO: Need to make this dynamic possibly
    // Select Admitting Provider
    try {
        await page
            .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
            .click();
    } catch {
        // Handle the "Notification" pop up for admitting hospital duplicate
        await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({
        });
        await page.getByRole(`button`, { name: `Okay` }).click();

        await page
            .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
            .click();
    }



    // Try to dimiss the notification
    try{
        await page.getByText(`Notification`, { exact: true}).waitFor();
        await page.getByRole(`button`, { name: `Okay` }).click();
    }catch{
        console.log("Notification did not appear.");
    }



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
    await waitUntilLoaded(page);

    // Grab the "Auth #"
    await page.locator(`#form-header .headerLabel`).waitFor();
    const authNum = await page.locator(`#form-header .headerLabel`).innerText();

    // Return the authNum for cleanup later
    return { authNum, worklogActivityDate };
}









test('AbleToConvertObservationAuthsIntoInpatientAuthsAndViceVera', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const today = Date.now();
    //const loginID = `AuthConfigAANACom`;
    const lastFirstName = `Ace, Clancy`;
    const authorizationType = `Inpatient`;
    const patientStatus = `Admitted`;
    const admitDate = format(today, "MM dd yyyy hh mm ss aa");
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const reviewer = `${loginID} Qaw`;

    //--------------------------------
    // Login
    //--------------------------------

   // const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 1000,
    });





    //const { page } = await logIn({ url: process.env.DEFAULT_URL_2, loginID });


    //--------------------------------
    // Cleanup (pre-test)
    //--------------------------------
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
    // Act - Enable Conversion Setting
    //--------------------------------
    await page.getByText(`Tools`).click();
    await page.getByText(`System Options`).click();
    await page.getByText(`Configuration`, { exact: true }).click();

    await page.getByText(`Authorization Configuration`).scrollIntoViewIfNeeded();

    try {
        await expect(page.locator(`#AuthConfig_AuthConversion_Yes`)).toBeChecked();
    } catch {
        await page.locator(`#AuthConfig_AuthConversion_Yes`).check();
    }

    await page.getByRole(`button`, { name: `Save and Close` }).click();
    //await waitUntilLoaded2(page);

    //--------------------------------
    // Create Inpatient Authorization
    //--------------------------------
    const { authNum } = await NewCreateAuthorizationForMember(page, {
        lastFirstName,
        authorizationType,
        patientStatus,
        admitDate,
        authStatus,
        team,
        reviewer,
    });









    //await waitUntilLoaded(page);





    //--------------------------------
    // Convert Inpatient → Observation
    //--------------------------------
    await page
        .getByRole(`button`)
        .filter({ hasText: `More... Convert to Inpatient` })
        .hover();

    await page.getByText(`Convert to Observation`).click();

    //await waitUntilLoaded2(page);


    await expect(page.getByText(`Auth Conversion`)).toBeVisible();


    /*

    const authReqDate = format(Date.now(), "MMddyyyyhhmmssaa");

    await page.locator(`input[name="auth_request_date"]`).fill(authReqDate);
    await page.locator(`#auth_admit_date`).fill(authReqDate);
*/


    const popup = page.locator('.k-window:visible');

    const authReqInput = popup.locator('input[name="auth_request_date"]');
    const admitInput = popup.locator('#auth_admit_date');

    const authReqDate = dateFns.format(
        new Date(),
        "MM/dd/yyyy hh:mm:ss aa"
    );


/*
// Auth Request Date
    await authReqInput.click();
    await authReqInput.press('Control+A');
    await authReqInput.press('Backspace');
    await authReqInput.pressSequentially(authReqDate);
    await authReqInput.press('Tab');


    //await waitUntilLoaded(page);


// Observation Start Date
    await admitInput.click();
    await admitInput.press('Control+A');
    await admitInput.press('Backspace');
    await admitInput.pressSequentially(authReqDate);
    await admitInput.press('Tab');
*/


    const today2 = Date.now();
    const d2 = format(today2, "MM dd yyyy hh mm ss aa");


    // Auth Request Date
    await authReqInput.click();
    await authReqInput.clear();
    await authReqInput.pressSequentially(d2);
    //await authReqInput.press('Tab');


    //await waitUntilLoaded(page);


// Observation Start Date
    await admitInput.click();
    await admitInput.clear();
    await admitInput.pressSequentially(d2);
   // await admitInput.press('Tab');







    //await waitUntilLoaded2(page);









    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    //await waitUntilLoaded2(page);






    await expect(page.getByText(`New Work Log`)).toBeVisible();
    //await waitUntilLoaded2(page);
    await page.getByRole(`button`, { name: ` Save and Close` }).click();






    await expect(
        page.locator(`#observationstatus-anchor div`).filter({ hasText: `Observation Status` })
    ).toBeVisible();











    const obsAuthNum = await page.locator(`#form-header .headerLabel`).innerText();

    //--------------------------------
    // Convert Observation → Inpatient
    //--------------------------------
    await page
        .getByRole(`button`)
        .filter({ hasText: `More... Convert to Inpatient` })
        .hover();











    await page.getByText(`Convert to Inpatient`).click();
    await expect(page.getByText(`Auth Conversion`)).toBeVisible();




});