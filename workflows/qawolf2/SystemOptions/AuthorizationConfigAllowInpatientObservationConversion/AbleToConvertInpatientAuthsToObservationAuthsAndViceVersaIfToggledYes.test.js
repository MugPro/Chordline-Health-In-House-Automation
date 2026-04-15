import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded, cleanupTabOnMembersPage, reportCleanupFailed, createAuthorizationForMember } from '../../../../helpers/Node20Helpers.js';

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









test('AbleToConvertObservationAuthsIntoInpatientAuthsAndViceVera', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const today = Date.now();
    const loginID = `AuthConATCIATOA`;
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
    const { page, browser } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
    });

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
    await waitUntilLoaded2(page);

    //--------------------------------
    // Create Inpatient Authorization
    //--------------------------------
    const { authNum } = await createAuthorizationForMember(page, {
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

    await waitUntilLoaded2(page);


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







    await waitUntilLoaded2(page);









    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    await waitUntilLoaded2(page);






    await expect(page.getByText(`New Work Log`)).toBeVisible();
    await waitUntilLoaded2(page);
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









/*
    await page.locator(`input[name="auth_request_date"]`).fill(authReqDate);
    await page.locator(`#auth_admit_date`).fill(authReqDate);
*/
















    /*


    //--------------------------------
    // Assert Inpatient Page
    //--------------------------------
    await expect(
        page.locator(`#inpatientstatus-anchor div`).filter({ hasText: `Inpatient Status` })
    ).toBeVisible();

    const inpAuthNum = await page.locator(`#form-header .headerLabel`).innerText();

    //--------------------------------
    // Navigate back to Authorizations grid
    //--------------------------------
    await page.getByRole(`button`, { name: ` All Auths` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assertions in Grid
    //--------------------------------
    await expect(async () => {
        await page.getByText(`Auth ID`, { exact: true }).click();

        await expect(
            page.locator(
                `table tbody tr:has(td span[id="id"]:text-is("${authNum.replace("Inpatient Auth #", "")}"))`
            )
        ).toContainText("Closed");
    }).toPass({ timeout: 30000 });

    await expect(
        page.locator(
            `table tbody tr:has(td span[id="id"]:text-is("${obsAuthNum.replace("Observation Auth #", "")}"))`
        )
    ).toContainText("Closed");

    await expect(
        page.locator(
            `table tbody tr:has(td span[id="id"]:text-is("${inpAuthNum.replace("Inpatient Auth #", "")}"))`
        )
    ).toContainText("Admitted");

    //--------------------------------
    // Cleanup (post-test)
    //--------------------------------
    try {
        await cleanupTabOnMembersPage(page, {
            tab: "Authorizations",
            gridId: '[id="authorizations-grid"]',
            memberName: lastFirstName,
            loginID,
            onScreen: true,
        });
    } catch (e) {
        await reportCleanupFailed({
            dedupKey: "cleanupTabOnMembersPage",
            errorMsg: e.message,
        });
    }

    await browser.close();
});

     */

    //await browser.close();
});