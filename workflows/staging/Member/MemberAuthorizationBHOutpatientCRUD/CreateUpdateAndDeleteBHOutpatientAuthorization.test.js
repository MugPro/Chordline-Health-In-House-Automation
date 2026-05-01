import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage2, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helper pauses (use sparingly)
-------------------------------------------- */
const PAUSE_MS = 1700;
const pause = (page, ms = PAUSE_MS) => page.waitForTimeout(ms);
const clickAndWait = async (page, locator) => {
    await locator.click();
    await pause(page);
};
const fillAndWait = async (page, locator, value) => {
    await locator.fill(value);
    await pause(page);
};

/* -------------------------------------------
   Reusable helpers
-------------------------------------------- */
const handleDuplicateProviderPopupIfPresent = async (page) => {
    const popup = page.getByText('This record uses the same', { exact: false });
    if (await popup.isVisible({ timeout: 3000 })) {
        await page.getByRole('button', { name: 'Okay' }).click();
    }
};

const lookupAndSelectProvider = async (page, lookupButtonSelector, providerName) => {
    // Open lookup
    await page.locator(lookupButtonSelector).click();
    await waitUntilLoaded(page);

    // Some UIs show both checkboxes — check if visible, then set them
    const outOfNetwork = page.getByRole('checkbox', { name: 'Out of Network' });
    const inNetwork = page.getByRole('checkbox', { name: 'In Network' });
    if (await outOfNetwork.isVisible().catch(() => false)) await outOfNetwork.check();
    if (await inNetwork.isVisible().catch(() => false)) await inNetwork.check();

    // Scope all actions to the Lookup dialog (strict-mode safe)
    const lookupDialog = page.getByRole('dialog', { name: 'Lookup' });
    await lookupDialog.getByRole('textbox', { name: 'Search...' }).fill(providerName);
    await lookupDialog.locator('#lookup-search-button').click();
    await waitUntilLoaded(page);

    await lookupDialog.getByRole('gridcell', { name: providerName }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();
    await waitUntilLoaded(page);

    // If duplicate notification appears — handle and continue
    await handleDuplicateProviderPopupIfPresent(page);
};

test('Create, Update, and Delete a BH Outpatient Authorization', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `BHOutpatientCRUD`;

    const member = {
        name: `Carter, QAWolf`,
        insuranceCompany: `Excellent Health Plan`,
        identifier: `B1029384`,
        plan: `PLAN B`,
        startDate: `12/14/2024`,
    };

    const tab = `Authorizations`;
    const gridId = `[id="authorizations-grid"]`;
    const authorizationType = `BH Outpatient`;
    const authType = `OP-BH`;
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const team2 = `Compliance Team`;
    const provider = `St. Catherine's Hospital`;

    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    const authNumText = `Outpatient Auth - BH #`;
    const workLogTitle = `New Work Log`;

    // Sign in
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    // Idempotent cleanup
    await cleanupTabOnMembersPage2(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Act: CREATE
    //--------------------------------
    // Hover +Authorization and choose BH Outpatient
    await page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }).hover();
    await page.getByLabel(member.name).getByText(authorizationType, { exact: true }).click();
    await waitUntilLoaded(page);

    /*

    // Auth Status
    await fillAndWait(
        page,
        page.locator(`input[name="aush_status_id__1_input"]`),
        authStatus
    );
    await page.getByRole('option', { name: authStatus }).locator('span').click();

     */

    // Team
    await fillAndWait(
        page,
        page.locator(`input[name="auth_team_reference_id_input"]`),
        team
    );
    await page.getByRole('option', { name: team }).click();

    /*
    // Reviewer
    await fillAndWait(
        page,
        page.locator(`input[name="auth_reviewer_user_id_input"]`),
        loginID
    );
    await page.getByRole('option', { name: loginID }).locator('span').click();

     */

    // Facility / Provider (primary)
    await lookupAndSelectProvider(
        page,
        `[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`,
        provider
    );



    await lookupAndSelectProvider(
        page,
        'div:nth-child(4) > .formField.fieldcol1.rowFirst > .divclass > .left.outerfielddiv > .right > .input > span > .k-button.k-button-solid.k-button-md.k-rounded-md.lookup-search-button',
        provider
    );

    // Save
    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
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
    } catch {
        // no popup — continue
    }
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: CREATE
    //--------------------------------
    // Numbered banner present and parse the number
    const authNumber = (await page.getByText(authNumText).innerText()).split('#')[1];
    expect(Number(authNumber)).toBeGreaterThan(1);

    // Top primary strip
    await expect(
        page.getByText(
            `Primary: ${member.identifier} - ${member.insuranceCompany} - ${member.plan} - ${member.startDate} -`
        )
    ).toBeVisible();


    /*

    // Summary values (OP typically shows these fields)
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    //await expect(page.getByText(`* Reviewer: ${loginID}`)).toBeVisible();
    await expect(page.getByText(`* Facility: ${provider}`)).toBeVisible();
    await expect(page.getByText(`* Auth Decision: Pending`)).toBeVisible();

     */






    //--------------------------------
    // Assert:
    //--------------------------------

    // Assert BH outpatient authorization was created successfully
    await expect(page.getByText(`Outpatient Auth - BH #`)).toBeVisible();

    // Assert BH outpatient authorization was assigned a number
    expect(Number(authNumber)).toBeGreaterThan(1);


    // Assert entered data is correct
    await expect(
        page.getByText(`* Auth Status: ${authStatus}`),
    ).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    await expect(
        page.getByText(`* Requesting Provider: ${provider}`),
    ).toBeVisible();
    await expect(
        page.getByText(`* Servicing Provider: ${provider}`),
    ).toBeVisible();

    // Assert "Entry By" user is correct
    await expect(
        page.getByText(`Entered By: ${loginID}`).first(),
    ).toBeVisible();

    // Assert Auth decision is "Pending" by default
    await expect(page.getByText(`Auth Decision: Pending`)).toBeVisible();















    // Worklog count (if created)
    if (worklogActivityDate != null) {
        await expect(page.locator(`span`).filter({ hasText: `Work Logs 1` })).not.toHaveCount(0);
    } else {
        await expect(page.locator(`span`).filter({ hasText: `Work Logs 1` })).not.toBeVisible();
        await expect(page.locator(`span`).filter({ hasText: `Work Logs` })).not.toHaveCount(0);
    }

    // Verify row in All Auths grid
    await page.getByRole('button', { name: ' All Auths' }).click();
    await waitUntilLoaded(page);

    const rowByNumber = `${gridId} table tbody tr:visible:has-text("${authNumber}")`;
    let textToVerify = await page.locator(rowByNumber).innerText();
    [
        authNumber,
        member.identifier,
        authType,
        team,
        'Pending',
        provider,
    ].forEach((str) => expect(textToVerify).toContain(str));

    if (worklogActivityDate != null) {
        await expect(
            page.locator(
                `${gridId} table tbody tr:has-text("${authNumber}") :text("${worklogActivityDate}")`
            )
        ).not.toHaveCount(0);
    }

    //--------------------------------
    // Act: UPDATE (change Team)
    //--------------------------------
    const saveButton = page.getByRole('button', { name: ' Save' });

    await page.locator(rowByNumber).hover();
    await page.locator(`${rowByNumber} .k-grid-editAction`).click();
    await waitUntilLoaded(page);

    await page
        .locator(
            `[data-bind="attr: { class: fields.auth_team_reference_id.inputClass }"] [type="button"]`
        )
        .click();
    await page.getByRole('option', { name: team2 }).click();

    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await waitUntilLoaded(page);

    // Optional work log on update
    try {
        await expect(page.getByText(workLogTitle)).toBeVisible({ timeout: 3000 });
        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {}
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: UPDATE
    //--------------------------------
    await expect(page.getByText(`${authNumText}${authNumber}`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team2}`)).toBeVisible();

    // Verify in All Auths grid
    await page.getByRole('button', { name: ' All Auths' }).click();
    await waitUntilLoaded(page);

    textToVerify = await page.locator(rowByNumber).innerText();
    [
        authNumber,
        member.identifier,
        authType,
        team2,
        'Pending',
        provider,
    ].forEach((str) => expect(textToVerify).toContain(str));

    //--------------------------------
    // Act: DELETE (state-driven loop in case of duplicates)
    //--------------------------------
    const rowsToDelete = page.locator(`${gridId} table tbody tr:visible:has-text("${authNumber}")`);
    while (await rowsToDelete.count() > 0) {
        const r = rowsToDelete.first();
        await r.hover();
        await r.locator('[title="Delete"]').click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await expect(r).toBeHidden({ timeout: 5000 });
        await waitUntilLoaded(page);
    }

    //--------------------------------
    // Assert: DELETE
    //--------------------------------
    await expect(page.locator(rowByNumber)).not.toBeVisible();
    await expect(
        page.getByRole('button').filter({ hasText: 'Authorization Inpatient' })
    ).toBeEnabled();

    // Optional: verify not found by searching user
    await page.getByRole('textbox', { name: 'Search...' }).fill(loginID);
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);
    await expect(page.locator(rowByNumber)).not.toBeVisible();
});