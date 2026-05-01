import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

// Adjust paths to match your repo structure:
import {logIn, logIn3} from '../../../../helpers/Node20Helpers.js';
import { waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { createAuthorizationForMember } from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";









// Reusable helper: handle a dialog *if* it appears, otherwise skip
async function maybeHandleNotificationOk(page, {
    dialogName = 'Notification',  // ARIA dialog name
    okButtonName = 'Okay',        // Button label inside dialog
    timeout = 3000,               // Max wait for optional modal
} = {}) {
    const dialog = page.getByRole('dialog', { name: dialogName });

    const appeared = await dialog.waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);

    if (!appeared) return false;

    // Scope to the dialog to avoid clicking the wrong "Okay"
    await dialog.getByRole('button', { name: okButtonName }).click({ timeout });

    // Optional: if closing the dialog triggers a spinner, add:
    // await waitUntilLoaded(page);

    return true;
}














test.describe('Authorization Config - Default Diagnosis = No Default', () => {
    //test.setTimeout(5 * 60 * 1000);

    let browser, context, page;

    /*
    test.beforeEach(async () => {
        const loginID = 'AuthConfigDefDiagNoD';


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url
        });

    });

     */

    test.afterEach(async () => {
        await context?.close();
        await browser?.close();
    });

    test('Creating a Bed Day should NOT pre-populate Diagnosis when default = No Default', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const today = Date.now();
        const loginID = 'AuthConfigDefDiagNoD';
        const lastFirstName = 'Nelson, William';
        const authorizationType = 'Inpatient';
        const patientStatus = 'Admitted';
        const admitDate = format(today, 'MM dd yyyy hh mm ss aa');
        const authStatus = 'In Progress';
        const team = 'Case Team';
        const reviewer = `${loginID} Qaw`;
        const diag1 = 'A00 - Cholera';
        const diag2 = 'A01.0 - Typhoid fever';
        const bedLevel = 'Medical';


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL_2;

        // Act
        const { page, browser } = await logIn3({
            loginID,
            password,
            url
        });


        //--------------------------------
        // Act:
        //--------------------------------

        // Navigate to Tools > System Options
        await page.getByText('Tools').click();
        await page.getByText('System Options').click();

        // Open Configuration tab
        await page.getByText('Configuration', { exact: true }).click();

        // Scroll to Authorization Configuration
        await page.getByText('Authorization Configuration').scrollIntoViewIfNeeded();

        // Select Default Diagnosis = No Default
        await page
            .locator('[aria-controls="AuthConfig_DefaultDiagnosis_listbox"]')
            .click();
        await page.getByRole('option', { name: 'No Default' }).click();

        // Save & Close
        await page.getByRole('button', { name: 'Save and Close' }).click();
        await waitUntilLoaded(page);


















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


        await waitUntilLoaded(page);




















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






/*
// Handle the "Notification" pop up for admitting hospital duplicate
        await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({
            timeout: 3000,
        });
        await page.getByRole(`button`, { name: `Okay` }).click({ timeout: 3000 });
*/


        // After the action that may trigger the duplicate-admitting-hospital notification
        await maybeHandleNotificationOk(page, { timeout: 3000 });



        await waitUntilLoaded(page);

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
        await waitUntilLoaded(page);

        // Grab the "Auth #"
        await page.locator(`#form-header .headerLabel`).waitFor();
        const authNum = await page.locator(`#form-header .headerLabel`).innerText();
























        // Click +Bed Day
        await page.getByRole('button', { name: /Bed Day/ }).click();
        await waitUntilLoaded(page);

        // +Diagnosis 1
        await page.getByRole('button', { name: /Diagnosis/ }).click();
        await waitUntilLoaded(page);
        await page.locator('input[name="audg_code__1_input"]').fill(diag1);
        await page
            .getByRole('option', { name: diag1, exact: true })
            .locator('span')
            .click();




        await waitUntilLoaded(page);


        // +Diagnosis 2
        await page.getByRole('button', { name: /Diagnosis/ }).click();
        await waitUntilLoaded(page);
        await page.locator('input[name="audg_code__2_input"]').fill(diag2);
        await page
            .getByRole('option', { name: diag2, exact: true })
            .locator('span')
            .click();




        //await waitUntilLoaded(page);

        // Requested Bed Level
        await page
            .locator('input[name="auli_requested_bed_level_input"]')
            .fill(bedLevel);
        await page.getByRole('option', { name: bedLevel }).click();



        //await waitUntilLoaded(page);

        // Requested Units
        const spin = page.getByRole('spinbutton').first();
        await spin.fill('1');

        // Save & Close Bed Day
        await page
            .getByRole('button', { name: ' Save and Close', exact: true })
            .click();
        await waitUntilLoaded(page);

        // Save & Close Work Log popup
        await page.getByRole('button', { name: ' Save and Close' }).click();
        await waitUntilLoaded(page);

        // Go to Bed Days shortcut
        await page
            .locator('#shortcuts-div [data-value="lineitems-anchor"]:visible')
            .click();

        // Add another Bed Day
        await page.getByRole('button', { name: /Bed Day/ }).click();

        //--------------------------------
        // Assert:
        //--------------------------------

        // Diagnosis anchor is visible
        await expect(
            page.locator('#diagnosis-anchor div').filter({ hasText: 'Diagnosis' }),
        ).toBeVisible();

        // Diagnosis list should be empty
        await expect(
            page.getByLabel('New Bed Days').getByText(diag1),
        ).not.toBeVisible();
        await expect(
            page.getByLabel('New Bed Days').getByText(diag2),
        ).not.toBeVisible();
    });
});