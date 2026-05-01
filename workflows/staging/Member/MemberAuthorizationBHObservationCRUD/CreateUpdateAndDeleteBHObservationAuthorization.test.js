import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage2, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";






const PAUSE_MS = 1400;
const pause = (page, ms = PAUSE_MS) => page.waitForTimeout(ms);
const clickAndWait = async (page, locator) => {
    await locator.click();
    await pause(page);
};
const fillAndWait = async (page, locator, value) => {
    await locator.fill(value);
    await pause(page);
};






const handleDuplicateProviderPopupIfPresent = async (page) => {
    const popup = page.getByText(
        'This record uses the same',
        { exact: false }
    );

    if (await popup.isVisible({ timeout: 3000 })) {
        await page.getByRole('button', { name: 'Okay' }).click();
    }
};




test('Create, Update, and Delete a BH Observation Authorization', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `AuthBHObCRUD`;

    /*
    const member = {
        name: `Ayers, Ronald`,
        insuranceCompany: `Excellent Health Plan`,
        identifier: `B5749201`,
        plan: `PLAN B`,
        startDate: `12/12/2024`,
    };

     */

    const member = {
        name: `Carter, QAWolf`,
        insuranceCompany: `Excellent Health Plan`,
        identifier: `B1029384`,
        plan: `PLAN B`,
        startDate: `12/14/2024`,
    };





    const tab = `Authorizations`;
    const gridId = `[id="authorizations-grid"]`;
    const authorizationType = `BH Observation`;
    const authType = `OBS-BH`;
    const patientStatus = `Admitted`;
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const team2 = `Compliance Team`;
    const provider = `St. Catherine's Hospital`;

    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    const authNumText = `Observation Auth - BH #`;
    const workLogTitle = `New Work Log`;
    const midnight = `12:00:00 AM`;

   // const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    // Cleanup any existing Observation Auths created by this user
    await cleanupTabOnMembersPage2(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Act: CREATE
    //--------------------------------
    await page
        .getByRole('button')
        .filter({ hasText: 'Authorization Inpatient' })
        .hover();

    await page
        .getByLabel(member.name)
        .getByText(authorizationType, { exact: true })
        .click();

    await waitUntilLoaded(page);


    /*

    // Observation Status
    await page
        .locator(`input[name="aush_inpatient_status_id__1_input"]`)
        .fill(patientStatus);
    await page.getByRole('option', { name: patientStatus }).locator('span').click();

    await waitUntilLoaded(page);

    // Auth Status
    await page.locator(`input[name="aush_status_id__1_input"]`).fill(authStatus);
    await page.getByRole('option', { name: authStatus }).locator('span').click();

    await waitUntilLoaded(page);

    // Observation Start Date
    await page.locator(`button:near(#aush_admit_date__1) >> nth=0`).click();
    await page
        .getByLabel('Current focused date is')
        .getByText(`${todaysDateDay}`)
        .click();

    await waitUntilLoaded(page);

    // Team
    await page.locator(`input[name="auth_team_reference_id_input"]`).fill(team);
    await page.getByRole('option', { name: team }).click();

    await waitUntilLoaded(page);

    // Reviewer
    await page.locator(`input[name="auth_reviewer_user_id_input"]`).fill(loginID);
    await page.getByRole('option', { name: loginID }).locator('span').click();

     */













    await waitUntilLoaded(page);

    // Outpatient Status
    await fillAndWait(
        page,
        page.locator(`input[name="aush_inpatient_status_id__1_input"]`),
        patientStatus,
    );
    await page.getByRole(`option`, { name: patientStatus }).locator(`span`).click();

    // Auth Status
    //await page.getByRole(`button`, { name: `` }).nth(2).click();


    await page.locator('span').filter({ hasText: '4 ...' }).getByLabel('expand combobox').click();
    await fillAndWait(
        page,
        page.locator(`input[name="aush_status_id__1_input"]`),
        authStatus,
    );
    await page.getByRole(`option`, { name: authStatus }).locator(`span`).click();

    // Admit Date
    await page.locator(`button:near(#aush_admit_date__1) >> nth=0`).click();
    await page
        .getByLabel(`Current focused date is`)
        .getByText(`${todaysDateDay}`)
        .click();

    // Team
    await fillAndWait(
        page,
        page.locator(`input[name="auth_team_reference_id_input"]`),
        team,
    );
    await page.getByRole(`option`, { name: team }).click();

    // Reviewer
    await page.getByRole('button', { name: 'expand combobox' }).nth(3).click();

    await fillAndWait(
        page,
        page.locator(`input[name="auth_reviewer_user_id_input"]`),
        loginID,
    );
    await page
        .getByRole(`option`, { name: loginID }).click();












    //await waitUntilLoaded(page);

    // Facility Lookup
    await page
        .locator(`[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`)
        .click();

    await waitUntilLoaded(page);

    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('checkbox', { name: 'In Network' }).check();

    const lookupDialog = page.getByRole('dialog', { name: 'Lookup' });

    await lookupDialog.getByRole('textbox', { name: 'Search...' }).fill(provider);
    await lookupDialog.locator('#lookup-search-button').click();

    await waitUntilLoaded(page);

    await lookupDialog.getByRole('gridcell', { name: provider }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();

    await waitUntilLoaded(page);

    // Handle duplicate provider popup if it appears
    const duplicatePopup = page.getByText('This record uses the same', { exact: false });
    if (await duplicatePopup.isVisible({ timeout: 3000 })) {
        await page.getByRole('button', { name: 'Okay' }).click();
    }

    //await waitUntilLoaded(page);











    await page.locator('div:nth-child(4) > .formField.fieldcol1.rowFirst > .divclass > .left.outerfielddiv > .right > .input > span > .k-button.k-button-solid.k-button-md.k-rounded-md.lookup-search-button').click();
    await waitUntilLoaded(page);
    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('textbox', { name: 'Search...' }).click();
    await page.getByRole('textbox', { name: 'Search...' }).fill('St. Catherine\'s Hospital');
    await page.locator('.quick-search-medium.right > .k-input > .k-input-suffix > #lookup-search-button').click();
    await waitUntilLoaded(page);
    await page.getByRole('gridcell', { name: 'St. Catherine\'s Hospital' }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();










    //await waitUntilLoaded(page);


    await handleDuplicateProviderPopupIfPresent(page);

    await waitUntilLoaded(page);








    // Save
    await page.getByRole('button', { name: ' Save' }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Handle Work Log (optional)
    //--------------------------------
    let worklogActivityDate = null;
    try {
        await expect(page.getByText(workLogTitle)).toBeVisible({ timeout: 3000 });
        worklogActivityDate = await page
            .locator('#work_activity_date')
            .evaluate((e) => e.value.substring(0, 14));
        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {}

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: CREATE
    //--------------------------------
    const authNumber = (await page.getByText(authNumText).innerText()).split('#')[1];
    expect(Number(authNumber)).toBeGreaterThan(1);

    await expect(page.getByText(`* Observation Status: ${patientStatus}`)).toBeVisible();
    await expect(page.getByText(`* Observation Start Date: ${todaysDate} ${midnight}`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    await expect(page.getByText(`* Auth Decision: Pending`)).toBeVisible();




    await page.getByRole('button', { name: ' All Auths' }).click();

    await waitUntilLoaded(page);



    //--------------------------------
    // Act: UPDATE
    //--------------------------------
    const row = `${gridId} table tbody tr:visible:has-text("${authNumber}")`;
    const saveButton = page.getByRole('button', { name: ' Save' });

    await page.locator(row).hover();
    await page.locator(`${row} .k-grid-editAction`).click();

    await waitUntilLoaded(page);

    await page
        .locator(
            `[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`,
        )
        .click();

    await page.getByRole('option', { name: team2 }).click();
    await expect(saveButton).toBeEnabled();

    await saveButton.click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: UPDATE
    //--------------------------------
    await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();
    await expect(page.getByText(`${authNumText}${authNumber}`)).toBeVisible();








    //let worklogActivityDate = null;
    try {
        await expect(page.getByText(workLogTitle)).toBeVisible({ timeout: 3000 });
        worklogActivityDate = await page
            .locator('#work_activity_date')
            .evaluate((e) => e.value.substring(0, 14));
        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {}

    await waitUntilLoaded(page);






    await page.getByRole('button', { name: ' All Auths' }).click();

    await waitUntilLoaded(page);










    const rowLocator = page.locator(
        `${gridId} table tbody tr:visible:has-text("${authNumber}")`
    );

    while (await rowLocator.count() > 0) {
        const row = rowLocator.first();

        await row.hover();

        await row.locator('[title="Delete"]').click();

        await page.getByRole('button', { name: 'Yes' }).click();

        // ✅ Critical: wait for THIS row to be removed
        await expect(row).toBeHidden({ timeout: 5000 });

        await waitUntilLoaded(page);
    }

    //--------------------------------
    // Assert: DELETE
    //--------------------------------
    await expect(page.locator(row)).not.toBeVisible();
    await expect(
        page.getByRole(`button`).filter({ hasText: `Authorization Inpatient` }),
    ).toBeEnabled();
});