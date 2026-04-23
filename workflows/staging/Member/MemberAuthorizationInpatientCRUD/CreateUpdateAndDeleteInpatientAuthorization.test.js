import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    cleanupTabOnMembersPage2,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers (match your existing pattern)
-------------------------------------------- */
const PAUSE_MS = 1500;
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







async function cleanupTabOnMembersPage01(page, options = {}) {
    const tab = options.tab || `Compliance`;
    const gridId = options.gridId || `[id="compliance-grid"]`;
    const memberName = options.memberName || `Blackwell, Megan`;
    const memberPlan = options.memberPlan || ``;
    const memberId = options.memberId || ``;
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;
    const memberStartDate = options.memberStartDate || ``;

    await waitUntilLoaded(page);

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText(`Home`, { exact: true }).click();
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Search for member
        await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
        await page.keyboard.press(`Enter`);
        await waitUntilLoaded(page);

        // Open member
        try {
            await page.getByRole(`gridcell`, { name: memberName }).dblclick();
        } catch {
            await page.getByRole(`gridcell`, { name: memberPlan }).dblclick();
        }

        await waitUntilLoaded(page);

        // Navigate to target tab
        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();

        await waitUntilLoaded(page);
    }

    // ✅ Locator for ALL matching rows
    const rows = page.locator(
        `${gridId} table tbody tr:visible:has-text("${loginID}")`
    );

    // ✅ Delete rows UNTIL none remain
    while (await rows.count() > 0) {
        const row = rows.first();

        // Stabilize row
        await row.scrollIntoViewIfNeeded();
        await row.hover();

        // Click delete
        await row.locator('[title="Delete"]').click();

        // Confirm delete
        await page.getByRole(`button`, { name: `Yes` }).click();

        // ✅ CRITICAL: wait for THIS row to be gone
        //await expect(row).toBeHidden({ timeout: 5000 });

        // Allow grid to fully re-render
        await waitUntilLoaded(page);
    }
}


test('Create, Update, and Delete an Inpatient Authorization', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `AuthBHInpCRUD`;

    const member = {
        name: `Jones, Mark`,
        insuranceCompany: `Wonderful Health Plan`,
        identifier: `A9876541`,
        plan: `PLAN A`,
        startDate: `09/11/2024`,
    };

    const tab = `Authorizations`;
    const gridId = `[id="authorizations-grid"]`;
    const authorizationType = `Inpatient`;
    const authType = `IP`;
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

    const authNumText = 'Inpatient Auth #';
    const workLogTitle = `New Work Log`;
    const midnight = `12:00:00 AM`;

    const { page } = await logIn({ loginID });

    // Clean up any existing authorizations for idempotency
    /*
    await cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

     */




    await cleanupTabOnMembersPage01(page, {
        tab,
        memberName: member.name,
        memberPlan: member.plan,
        loginID,
        gridId,
    });




    //--------------------------------
    // Act: CREATE
    //--------------------------------
    await page
        .getByRole(`button`)
        .filter({ hasText: `Authorization Inpatient` })
        .hover();

    await page
        .getByLabel(member.name)
        .getByText(authorizationType, { exact: true })
        .click();

    await waitUntilLoaded(page);

    // Inpatient Status
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

    // Provider lookup
    await page
        .locator(`[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`)
        .click();

    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    await fillAndWait(
        page,
        page.getByRole(`textbox`, { name: `Search...` }),
        provider,
    );

    //await page.locator(`#lookup-search-button`).click();
    await page
        .getByRole('dialog', { name: 'Lookup' })
        .locator('#lookup-search-button')
        .click();

    await waitUntilLoaded(page);
    await page.getByRole(`gridcell`, { name: provider }).first().click();
    // await waitUntilLoaded(page);
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    await waitUntilLoaded(page);

    await handleDuplicateProviderPopupIfPresent(page);









    await page.locator('div:nth-child(4) > .formField.fieldcol1.rowFirst > .divclass > .left.outerfielddiv > .right > .input > span > .k-button.k-button-solid.k-button-md.k-rounded-md.lookup-search-button').click();
    await waitUntilLoaded(page);
    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('textbox', { name: 'Search...' }).click();
    await page.getByRole('textbox', { name: 'Search...' }).fill('St. Catherine\'s Hospital');
    await page.locator('.quick-search-medium.right > .k-input > .k-input-suffix > #lookup-search-button').click();
    await waitUntilLoaded(page);
    await page.getByRole('gridcell', { name: 'St. Catherine\'s Hospital' }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();










    await waitUntilLoaded(page);


    await handleDuplicateProviderPopupIfPresent(page);

    await waitUntilLoaded(page);

    // Save
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save` }));
    //await waitUntilLoaded(page);

    //--------------------------------
    // Handle Work Log (optional)
    //--------------------------------
    let worklogDate = null;
    try {
        await expect(page.getByText(workLogTitle)).toBeVisible({ timeout: 3000 });
        worklogDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value.substring(0, 14));
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        // No work log
    }

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: CREATE
    //--------------------------------
    const authNumber = (await page.getByText(authNumText).innerText()).split(`#`)[1];
    expect(Number(authNumber)).toBeGreaterThan(1);

    await expect(page.getByText(`* Inpatient Status: ${patientStatus}`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    await expect(page.getByText(`* Auth Decision: Pending`)).toBeVisible();



    await page.getByRole('button', { name: ' All Auths' }).click();

    await waitUntilLoaded(page);


    //--------------------------------
    // Act: UPDATE
    //--------------------------------
    //const row = `${gridId} table tbody tr:visible:has-text("${loginID}")`;
    const row = `${gridId} table tbody tr:visible:has-text("${authNumber}")`;
    const saveButton = page.getByRole(`button`, { name: ` Save` });

    await page.locator(row).hover();
    await page.locator(`${row} .k-grid-editAction`).click();

    await waitUntilLoaded(page);

    // Team
    await fillAndWait(
        page,
        page.locator(`input[name="auth_team_reference_id_input"]`),
        team2,
    );
    await page.getByRole(`option`, { name: team2 }).click();



    //await waitUntilLoaded(page);

    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await waitUntilLoaded(page);




    //--------------------------------
    // Assert: UPDATE
    //--------------------------------
    await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();
    await expect(page.getByText(`${authNumText}${authNumber}`)).toBeVisible();







    //let worklogDate = null;
    try {
        await expect(page.getByText(workLogTitle)).toBeVisible({ timeout: 3000 });
        worklogDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value.substring(0, 14));
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        // No work log
    }



    await waitUntilLoaded(page);












    await page.getByRole('button', { name: ' All Auths' }).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Act: DELETE
    //--------------------------------
    /*
    await page.locator(row).hover();
    await page.locator(`${row} [title="Delete"]`).click();
    await page.getByRole(`button`, { name: `Yes` }).click();
    await waitUntilLoaded(page);

     */




    const rowLocator = page.locator(
        `${gridId} table tbody tr:visible:has-text("${authNumber}")`
    );

    while (await rowLocator.count() > 0) {
        const row = rowLocator.first();

        await row.hover();

        await row.locator('[title="Delete"]').click();

        await page.getByRole('button', { name: 'Yes' }).click();

        // ✅ Critical: wait for THIS row to be removed
        //await expect(row).toBeHidden({ timeout: 5000 });

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