/*
// tests/authorization.test.js
import { test, expect } from '@playwright/test';
import { logIn } from '../../../../helpers/Node20Helpers.js';
import * as dateFns from "date-fns";
import { format } from 'date-fns';




async function waitUntilLoaded2(page, options = {}) {

    try {
        // Wait for the loading modal to appear (optional step - might not always show up)
        await expect(page.locator(`[id="loading"]`)).toBeVisible({
            timeout: 5000,
        });

        // Wait for the loading modal to disappear (indicates full page load)
        await expect(page.locator(`[id="loading"]`)).not.toBeVisible({
            timeout: 6 * 60 * 1000,
        });
    } catch {
        console.log(`Loading modal is not visible on the page`);
    }
}





test('Inpatient authorization creates next action and bed day correctly', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `AuthConfigAANACom`;
    const lastFirstName = `Johnson, Jane`;
    const authorizationType = `Inpatient`;
    const patientStatus = `Admitted`;
    const today = Date.now();
    const admitDate = dateFns.format(today, "MM dd yyyy hh mm ss aa"); // Example: 07 25 2025 12 00 00 AM
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const reviewer = `${loginID} Qaw`;
    const bedLevel = `ICU`;

    // Sign in
    const { page, browser } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
    });
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
        // Ensure "Create Next Action When Auto Approved" is toggled to Yes
        await expect(page.locator('#AuthConfig_AutoApprovedCreateNextAction_Yes')).toBeChecked();
    } catch {
        await page.locator('#AuthConfig_AutoApprovedCreateNextAction_Yes').check();
    }

    // Edit comment
    await page.getByRole('button', { name: 'Edit Comment' }).nth(1).click();
    await expect(page.getByText('Not Auto Approved Next Action Comment', { exact: true })).toBeVisible();

    // Grab comment
    const frame = page.frameLocator('[id="flyout-div"] [title="Editable area. Press F10 for toolbar."]');
    const nextActionComment = await frame.locator('#flyout-textarea').innerText({ timeout: 3000 });



    // Click the Save and Close inside the Auto Approved Next Action comment
    await page.getByLabel('Auto Approved Next Action')
        .getByRole('button', { name: 'Save and Close' })
        .click();

// Click the Save and Close in System Options (if needed)
    await page.getByLabel('System Options')
        .getByRole('button', { name: 'Save and Close' })
        .click();
    await waitUntilLoaded2(page);












    //--------------------------------
    // Act - Create Authorization
    //--------------------------------
    // Navigate to Home > Members
    await page.getByText('Home', { exact: true }).click();
    await page.locator('#home-tabs-tab-4').getByText('Members').click();
    await page.getByRole('textbox', { name: 'Search...' }).fill(lastFirstName);
    await page.keyboard.press('Enter');

    // Open member page
    await page.getByRole('gridcell', { name: lastFirstName }).dblclick();
    await waitUntilLoaded2(page);

    await page.locator('#authorizations-menu').click();

    // Click "+ Authorization" >> Inpatient
    await page.getByRole('button').filter({ hasText: `Authorization Inpatient` }).hover();
    await page.getByLabel(lastFirstName).getByText(authorizationType, { exact: true }).click();

    await waitUntilLoaded2(page);
    // Fill patient status
    if (authorizationType === "Inpatient" || authorizationType === "Observation") {
        await page.locator('input[name="aush_inpatient_status_id__1_input"]').fill(patientStatus);
        await page.getByRole('option', { name: patientStatus }).locator('span').click();
    }

    await waitUntilLoaded2(page);
    // Fill admit date
    if (authorizationType === "Inpatient") {
        await page.locator('#aush_admit_date__1').click();
        await page.locator('#aush_admit_date__1').clear();
        await page.locator('#aush_admit_date__1').pressSequentially(admitDate);
    }





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
            .click({ timeout: 3000 });
    } catch {
        // Handle the "Notification" pop up for admitting hospital duplicate
        await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({
            timeout: 3000,
        });
        await page.getByRole(`button`, { name: `Okay` }).click({ timeout: 3000 });

        await page
            .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
            .click({ timeout: 3000 });
    }



    // Try to dimiss the notification
    try{
        await page.getByText(`Notification`, { exact: true, timeout: 5000 }).waitFor();
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
    await waitUntilLoaded2(page);

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
    await waitUntilLoaded2(page);

    // Grab the "Auth #"
    await page.locator(`#form-header .headerLabel`).waitFor();
    const authNum = await page.locator(`#form-header .headerLabel`).innerText();

    // Return the authNum for cleanup later
    return { authNum, worklogActivityDate };






//--------------------------------
    // Act - Add Bed Day
    //--------------------------------
    await page.getByRole('button', { name: '  Bed Day' }).click();
    await waitUntilLoaded2(page);

    await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
    await page.getByText(bedLevel, { exact: true }).click();

    await page.getByRole('spinbutton').click();
    await page.keyboard.press('1');

    await page.getByRole('button', { name: ' Save', exact: true }).click();
    await waitUntilLoaded2(page);
    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.getByText('Bed Days #')).toBeVisible();
    await page.getByLabel('Bed Days #').locator('#nextactions-anchor').getByText('Next Actions').scrollIntoViewIfNeeded();
    await expect(page.getByLabel('Bed Days #').getByText('Some line items were auto approved. Please review.')).toBeVisible();

    await page.getByRole('button', { name: ' Close' }).click();
    await page.locator('[id="shortcuts"] [data-value="nextactions-anchor"]:visible').click();
    await expect(page.getByRole('gridcell', { name: 'Some line items were auto approved. Please review.' })).toBeVisible();















    // Add Bed Day
    await page.getByRole('button', { name: '  Bed Day' }).click();
    await waitUntilLoaded2(page);

    await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
    await page.getByText(bedLevel, { exact: true }).click();

    await page.getByRole('spinbutton').click();
    await page.keyboard.press('1');

    await page.getByRole('button', { name: ' Save', exact: true }).click();
    await waitUntilLoaded2(page);

    await page.getByRole('button', { name: ' Save and Close' }).click();

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.getByText('Bed Days #')).toBeVisible();

    await page.getByLabel('Bed Days #').locator('#nextactions-anchor').getByText('Next Actions').scrollIntoViewIfNeeded();

    await expect(page.getByLabel('Bed Days #').getByText('Some line items were auto approved. Please review.')).toBeVisible();

    await page.getByRole('button', { name: ' Close' }).click();

    await page.locator('[id="shortcuts"] [data-value="nextactions-anchor"]:visible').click();
    await expect(page.getByRole('gridcell', { name: 'Some line items were auto approved. Please review.' })).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await page.getByRole('button', { name: ' All Auths' }).click();



    // Close browser context

    await browser.close();
});

 */



























// tests/authorization.test.js
import { test, expect } from '@playwright/test';
import { logIn, createAuthorizationForMember, waitUntilLoaded, cleanupTabOnMembersPage, reportCleanupFailed } from '../../../../helpers/Node20Helpers.js';
import * as dateFns from "date-fns";
import { format } from 'date-fns';



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


test('Inpatient authorization creates next action and bed day correctly', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `AuthConfigAANACom`;
    const lastFirstName = `Johnson, Jane`;
    const authorizationType = `Inpatient`;
    const patientStatus = `Admitted`;
    const today = Date.now();
    const admitDate = dateFns.format(today, "MM dd yyyy hh mm ss aa"); // Example: 07 25 2025 12 00 00 AM
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const reviewer = `${loginID} Qaw`;
    const bedLevel = `ICU`;

    // Sign in
    const { page, browser } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
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
    await waitUntilLoaded2(page);
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
    await waitUntilLoaded(page);

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

    await waitUntilLoaded(page);

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
    await waitUntilLoaded(page);

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
    await waitUntilLoaded(page);

    // Grab the "Auth #"
    await page.locator(`#form-header .headerLabel`).waitFor();
    const authNum = await page.locator(`#form-header .headerLabel`).innerText();





















    // Add Bed Day
    await page.getByRole('button', { name: '  Bed Day' }).click();
    await waitUntilLoaded(page);

    /*
    await page.locator('input[name="auli_requested_bed_level_input"]').fill(bedLevel);
    await page.getByText(bedLevel, { exact: true }).click();

    await page.getByRole('spinbutton').click();
    await page.keyboard.press('1');
    await waitUntilLoaded(page);

    await page.getByRole('button', { name: ' Save', exact: true }).click();
    await waitUntilLoaded(page);

     */


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

// Now fill Requested Units
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('1');







    //await waitUntilLoaded(page);




    await page.getByRole('button', { name: ' Save and Close' }).click();

    await waitUntilLoaded(page);





    await expect(page.getByText(`New Work Log`)).toBeVisible();
    await waitUntilLoaded2(page);
    await page.getByRole(`button`, { name: ` Save and Close` }).click();



    await waitUntilLoaded2(page);






    //------------------------------

    // Close browser context

    await browser.close();
});