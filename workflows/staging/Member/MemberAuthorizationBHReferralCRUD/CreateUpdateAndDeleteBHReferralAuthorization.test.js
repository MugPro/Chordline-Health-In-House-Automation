
import { test, expect } from '@playwright/test';
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage2, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";


const PAUSE_MS = 2000;
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
    const popup = page.getByText('This record uses the same', { exact: false });
    if (await popup.isVisible({ timeout: 3000 })) {
        await page.getByRole('button', { name: 'Okay' }).click();
    }
};

const lookupAndSelectProvider = async (page, lookupButtonSelector, providerName) => {
    await page.locator(lookupButtonSelector).click();
    await waitUntilLoaded(page);

    const outOfNetwork = page.getByRole('checkbox', { name: 'Out of Network' });
    const inNetwork = page.getByRole('checkbox', { name: 'In Network' });
    if (await outOfNetwork.isVisible().catch(() => false)) await outOfNetwork.check();
    if (await inNetwork.isVisible().catch(() => false)) await inNetwork.check();

    const lookupDialog = page.getByRole('dialog', { name: 'Lookup' });
    await lookupDialog.getByRole('textbox', { name: 'Search...' }).fill(providerName);
    await lookupDialog.locator('#lookup-search-button').click();
    await waitUntilLoaded(page);

    await lookupDialog.getByRole('gridcell', { name: providerName }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();
    await waitUntilLoaded(page);

    await handleDuplicateProviderPopupIfPresent(page);
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
            await page.getByRole(`gridcell`, { name: memberStartDate }).dblclick();
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










test('Create, Update, and Delete a BH Referral Authorization', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `AuthBHRefCrud`;





    const member = {
        name: `Jones, Mark`,
        insuranceCompany: `Wonderful Health Plan`,
        memberId: `QAWINS1771591823127`,
        plan: ``,
        startDate: `02/20/2026`,
    };









    const tab = `Authorizations`;
    const gridId = `[id="authorizations-grid"]`;
    const authorizationType = `BH Referral`;
    const authType = `RF-BH`;
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const team2 = `Compliance Team`;
    const provider = `St. Catherine's Hospital`;

    const expectedID = 'QAWINS1776978923971';
    const expectedInsuCo = 'Excellent Health Plan';
    const expectedStartDate = '04/23/2026';

    const todaysDate = new Date().toLocaleDateString('en-us', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    const authNumText = `Referral Auth - BH #`;
    const workLogTitle = `New Work Log`;

    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });





    // Cleanup existing Referral auths for idempotency
    await cleanupTabOnMembersPage01(page, {
        tab,
        memberName: member.name,
        memberStartDate: member.startDate,
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






    //await page.getByText('In Progress').click();



    //await page.getByText('In Progress').click();

    //await page.locator(`input[name="aush_status_id__1_input"]`).click();










    // Team
    await fillAndWait(
        page,
        page.locator(`input[name="auth_team_reference_id_input"]`),
        team,
    );
    await page.getByRole('option', { name: team }).click();

    // Requesting Provider
    await lookupAndSelectProvider(
        page,
        `[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`,
        provider,
    );

    // Servicing Provider
    await lookupAndSelectProvider(
        page,
        'div:nth-child(4) > .formField.fieldcol1.rowFirst .lookup-search-button',
        provider,
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
    } catch {}

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: CREATE
    //--------------------------------
    await expect(page.getByText(authNumText)).toBeVisible();
    const authNumber = (await page.getByText(authNumText).innerText()).split('#')[1];
    expect(Number(authNumber)).toBeGreaterThan(1);

    // Primary banner








    await expect(
        page.getByText(
            `Primary: ${expectedID} - ${expectedInsuCo} - ${expectedStartDate} -`,
        ),
    ).toBeVisible();









    // Summary fields

    // Assert entered data is correct
    await expect(
        page.getByText(`* Referral Status: ${authStatus}`),
    ).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    //await expect(page.getByText(`* Reviewer: ${loginID}`)).toBeVisible();
    await expect(
        page.getByText(`* Referring Provider: ${provider}`),
    ).toBeVisible();
    await expect(
        page.getByText(`* Servicing Provider: ${provider}`),
    ).toBeVisible();

    // Assert "Entry By" user is correct
    await expect(
        page.getByText(`Entered By: ${loginID}`).first(),
    ).toBeVisible();

    // Assert Referral decision is "Pending" by default
    await expect(
        page.getByText(`* Referral Decision: Pending`),
    ).toBeVisible();
    //--------------------------------
    // Verify grid row
    //--------------------------------
    await page.getByRole('button', { name: ' All Auths' }).click();
    await waitUntilLoaded(page);

    const rowByNumber = `${gridId} table tbody tr:visible:has-text("${authNumber}")`;
    let rowText = await page.locator(rowByNumber).innerText();

    [
        authNumber,
        expectedID,
        authType,
        team,
        'Pending',
        provider,
    ].forEach((str) => expect(rowText).toContain(str));

    //--------------------------------
    // Act: UPDATE
    //--------------------------------
    const saveButton = page.getByRole('button', { name: ' Save' });

    await page.locator(rowByNumber).hover();
    await page.locator(`${rowByNumber} .k-grid-editAction`).click();
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

    // Optional work log
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

    rowText = await page.locator(rowByNumber).innerText();
    [
        authNumber,
        expectedID,
        authType,
        team2,
        'Pending',
        provider,
    ].forEach((str) => {
        expect(str).toBeDefined(); // catches bugs early
        expect(rowText).toContain(str);
    });

    //--------------------------------
    // Act: DELETE
    //--------------------------------
    const rowsToDelete = page.locator(
        `${gridId} table tbody tr:visible:has-text("${authNumber}")`,
    );

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
        page.getByRole('button').filter({ hasText: 'Authorization Inpatient' }),
    ).toBeEnabled();
});


