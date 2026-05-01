import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';


/*



test('Create Outpatient Authorization', async ({ page: _page }) => {

//--------------------------------
// Arrange:
//--------------------------------

    const loginID = `OutpatientCRUD`;

    const member = {
        name: `Blackwell, Megan`,
        insuranceCompany: "Excellent Health Plan",
        identifier: "B9824538",
        plan: "PLAN B",
        startDate: "07/14/2024",
    };

    const tab = "Authorizations";
    const gridId = `[id="authorizations-grid"]`;
    const authorizationType = "Outpatient";
    const authType = "OP";
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const provider = "St. Catherine's Hospital";

    const patientStatus = "Admitted";

    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString("en-us", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });

// Sign in
    const { page, context, browser } = await helpers.logIn({
        loginID,
        url: env.DEFAULT_URL_2
    });

// Cleanup existing authorization records
    await helpers.cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

//--------------------------------
// Act:
//--------------------------------

    await page.getByRole(`button`)
        .filter({ hasText: `Authorization Inpatient` })
        .hover();

    await page
        .getByLabel(member.name)
        .getByText(authorizationType, { exact: true })
        .click();

    await page.locator(`.input [title="clear"][role="button"]`).first().click();

    await page.locator(`input[name="aush_status_id__1_input"]`).clear();




    const authStatusInput = page.locator('input[name="aush_status_id__1_input"]');

    await authStatusInput.click();
    await authStatusInput.fill(authStatus);

// Wait for dropdown to render
    await page.getByRole('option', { name: authStatus, exact: true })
        .waitFor({ state: 'visible' });

    await page.getByRole('option', { name: authStatus, exact: true })
        .first()
        .click();






    await page.locator(`input[name="auth_team_reference_id_input"]`).fill(team);
    await page.getByRole(`option`, { name: team }).click();



    const reviewerInput = page.locator('input[name="auth_reviewer_user_id_input"]');

    await reviewerInput.click();
    await reviewerInput.fill(loginID);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');





// Requesting Provider
    await page
        .locator(`[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`)
        .click();

    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    await page.getByRole(`textbox`, { name: `Search...` }).fill(provider);
    await page.getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();

    await page.getByRole(`gridcell`, { name: provider }).first().click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

// Servicing Provider
    try {
        await page
            .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
            .click({ timeout: 3000 });
    } catch {
        await expect(page.getByText(`Notification`, { exact: true }))
            .toBeVisible({ timeout: 3000 });


await page.getByRole(`button`, { name: `Okay` }).click();

await page
  .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
  .click();


    }

    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    await page.getByRole(`textbox`, { name: `Search...` }).fill(provider);
    await page.getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();

    await page.getByRole(`gridcell`, { name: provider }).first().click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    await page.getByRole(`button`, { name: ` Save` }).click();
    await helpers.waitUntilLoaded(page);








// Work log handling
    let worklogActivityDate = "N/A";
    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        worklogActivityDate = await page.locator(`#work_activity_date`).evaluate((e) => e.value);
        worklogActivityDate = worklogActivityDate.substring(0, 14);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({ timeout: 3000 });
    }

    await helpers.waitUntilLoaded(page);

    // Grab auth number
    const authNumber = (await page.getByText(`Outpatient Auth #`).innerText()).split("#")[1];
    const worklogRow = "#worklogs-child-grid tbody tr:visible";
    const row = `${gridId} table tbody tr:visible:has-text("${loginID}")`;

    //--------------------------------
    // Assert
    //--------------------------------

    await expect(page.getByText(`Outpatient Auth #`)).toBeVisible();
    expect(Number(authNumber)).toBeGreaterThan(1);
    await expect(page.getByText(
        `Primary: ${member.identifier} - ${member.insuranceCompany} - ${member.plan} - ${member.startDate} -`
    )).toBeVisible();

    if (worklogActivityDate !== "N/A") {
        await expect(page.getByText(`* Auth Request Date: ${worklogActivityDate}`)).toBeVisible();
    }

    await expect(page.getByText(`* Outpatient Status: ${patientStatus}`)).toBeVisible();
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();
    await expect(page.getByText(`* Outpatient Start Date: ${todaysDate} 12:00:00 AM`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    await expect(page.getByText(`* Reviewer: ${loginID}`)).toBeVisible();
    await expect(page.getByText(`* Facility: ${provider}`)).toBeVisible();
    await expect(page.getByText(`* Admitting Provider: ${provider}`)).toBeVisible();
    await expect(page.getByText(`* Auth Decision: Pending`)).toBeVisible();

    // Work log assertions
    if (worklogActivityDate !== "N/A") {
        await expect(page.locator(`${worklogRow}`)).toHaveCount(1);
        const textToVerify = await page.locator(`${worklogRow}`).innerText();
        [loginID, "0.00 hr", "No", worklogActivityDate].forEach(str => expect(textToVerify).toContain(str));
        const worklogID = await page.locator(`${worklogRow} td >> nth=1`).innerText();
        expect(Number(worklogID)).toBeGreaterThan(1);
    } else {
        await expect(page.locator(`${worklogRow}`)).not.toBeVisible();
    }

    // Auth summary checks
    await expect(page.getByText(`* Next Review Date:`)).toBeVisible();
    await expect(page.getByText(`* Requested Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Approved Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Pending Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Not Approved Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Closed Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Total Days Used: 1`)).toBeVisible();
    await expect(page.getByText(`* Total Days Used but Not Approved: 1`)).toBeVisible();
    await expect(page.getByText(`* Last Approved Day:`)).toBeVisible();

    // Authorizations table row
    await page.getByRole(`button`, { name: ` All Auths` }).click();
    const authRowText = await page.locator(`${row}`).innerText();
    [authNumber, member.identifier, authType, patientStatus, `${todaysDate} 12:00:00 AM`, team, "Pending", provider]
        .forEach(str => expect(authRowText).toContain(str));

    if (worklogActivityDate !== "N/A") {
        await expect(page.locator(`${gridId} table tbody tr:has-text("${loginID}") :text("${worklogActivityDate}")`))
            .not.toHaveCount(0);
    }

    // Close browser
    await browser.close();
});



*/





/*


//--------------------------------
// Local helper: robust dropdown selection for required fields
//--------------------------------
async function selectRequiredDropdown(page, inputSelector, optionText) {
    const input = page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 }); // wait until visible
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true }); // focus the input
    await input.fill(optionText);       // type option text
    await page.waitForTimeout(300);     // allow dropdown to populate
    await input.press('ArrowDown');     // highlight first matching option
    await input.press('Enter');         // select it
    await input.evaluate(el => el.blur()); // trigger change event
}

//--------------------------------
// Local helper: provider selection
//--------------------------------
async function selectProvider(page, providerFieldName, providerName) {
    const lookupButtonSelector = `[name="${providerFieldName}"] ~ button[title="Lookup"]`;

    try {
        await page.locator(lookupButtonSelector).click({ timeout: 3000 });
    } catch {
        // Handle possible notification pop-up
        try {
            await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({ timeout: 3000 });
            await page.getByRole(`button`, { name: `Okay` }).click({ timeout: 3000 });
            await page.locator(lookupButtonSelector).click({ timeout: 3000 });
        } catch {}
    }

    // Check In/Out of Network
    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    // Search for provider
    await page.getByRole(`textbox`, { name: `Search...` }).fill(providerName);
    await page.getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();

    // Select first matching provider
    await page.getByRole(`gridcell`, { name: providerName }).first().click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();
}

//--------------------------------
// Test
//--------------------------------
test('Create Outpatient Authorization', async ({ page: _page }) => {
    //--------------------------------
    // Arrange
    //--------------------------------

    const loginID = `OutpatientCRUD`;

    const member = {
        name: `Blackwell, Megan`,
        insuranceCompany: "Excellent Health Plan",
        identifier: "B9824538",
        plan: "PLAN B",
        startDate: "07/14/2024",
    };

    const tab = "Authorizations";
    const gridId = `[id="authorizations-grid"]`;
    const authorizationType = "Outpatient";
    const authType = "OP";
    const authStatus = `In Progress`;
    const team = `Case Team`;
    const provider = "St. Catherine's Hospital";









    const patientStatus = "Admitted";
    const todaysDateDay = new Date().getDate();
    const todaysDate = new Date().toLocaleDateString("en-us", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });

    // Sign in
    const { page, context, browser } = await helpers.logIn({
        loginID,
        url: env.DEFAULT_URL_2
    });

    // Clean-up previous authorizations
    await helpers.cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Act
    //--------------------------------

    // Hover "+ Authorization" and select type
    await page.getByRole(`button`).filter({ hasText: `Authorization Outpatient` }).hover();
    await page.getByLabel(member.name).getByText(authorizationType, { exact: true }).click();

    // Inpatient Status
    await selectRequiredDropdown(page, `input[name="aush_inpatient_status_id__1_input"]`, patientStatus);

    // Click X button
    await page.getByRole(`button`, { name: `` }).nth(2).click();

    // Auth Status
    await selectRequiredDropdown(page, `input[name="aush_status_id__1_input"]`, authStatus);

    // Observation start date
    await page.locator(`button:near(#aush_admit_date__1) >> nth=0`).click();
    await page.getByLabel(`Current focused date is`).getByText(`${todaysDateDay}`).click();

    // Team
    await selectRequiredDropdown(page, `input[name="auth_team_reference_id_input"]`, team);

    // Reviewer
    await selectRequiredDropdown(page, `input[name="auth_reviewer_user_id_input"]`, loginID);

    // Provider 1
    await selectProvider(page, "auth_provider_1_site_id", provider);

    // Provider 2 (Admitting)
    await selectProvider(page, "auth_provider_2_site_id", provider);

    // Save
    await page.getByRole(`button`, { name: ` Save` }).click();
    await helpers.waitUntilLoaded(page);

    // Work log handling
    let worklogActivityDate = "N/A";
    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        worklogActivityDate = await page.locator(`#work_activity_date`).evaluate((e) => e.value);
        worklogActivityDate = worklogActivityDate.substring(0, 14);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({ timeout: 3000 });
    }

    await helpers.waitUntilLoaded(page);

    // Grab auth number
    const authNumber = (await page.getByText(`Outpatient Auth #`).innerText()).split("#")[1];
    const worklogRow = "#worklogs-child-grid tbody tr:visible";
    const row = `${gridId} table tbody tr:visible:has-text("${loginID}")`;

    //--------------------------------
    // Assert
    //--------------------------------

    await expect(page.getByText(`Outpatient Auth #`)).toBeVisible();
    expect(Number(authNumber)).toBeGreaterThan(1);
    await expect(page.getByText(
        `Primary: ${member.identifier} - ${member.insuranceCompany} - ${member.plan} - ${member.startDate} -`
    )).toBeVisible();

    if (worklogActivityDate !== "N/A") {
        await expect(page.getByText(`* Auth Request Date: ${worklogActivityDate}`)).toBeVisible();
    }

    await expect(page.getByText(`* Outpatient Status: ${patientStatus}`)).toBeVisible();
    await expect(page.getByText(`* Auth Status: ${authStatus}`)).toBeVisible();
    await expect(page.getByText(`* Outpatient Start Date: ${todaysDate} 12:00:00 AM`)).toBeVisible();
    await expect(page.getByText(`* Team: ${team}`)).toBeVisible();
    await expect(page.getByText(`* Reviewer: ${loginID}`)).toBeVisible();
    await expect(page.getByText(`* Facility: ${provider}`)).toBeVisible();
    await expect(page.getByText(`* Admitting Provider: ${provider}`)).toBeVisible();
    await expect(page.getByText(`* Auth Decision: Pending`)).toBeVisible();

    // Work log assertions
    if (worklogActivityDate !== "N/A") {
        await expect(page.locator(`${worklogRow}`)).toHaveCount(1);
        const textToVerify = await page.locator(`${worklogRow}`).innerText();
        [loginID, "0.00 hr", "No", worklogActivityDate].forEach(str => expect(textToVerify).toContain(str));
        const worklogID = await page.locator(`${worklogRow} td >> nth=1`).innerText();
        expect(Number(worklogID)).toBeGreaterThan(1);
    } else {
        await expect(page.locator(`${worklogRow}`)).not.toBeVisible();
    }

    // Auth summary checks
    await expect(page.getByText(`* Next Review Date:`)).toBeVisible();
    await expect(page.getByText(`* Requested Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Approved Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Pending Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Not Approved Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Closed Days: 0`)).toBeVisible();
    await expect(page.getByText(`* Total Days Used: 1`)).toBeVisible();
    await expect(page.getByText(`* Total Days Used but Not Approved: 1`)).toBeVisible();
    await expect(page.getByText(`* Last Approved Day:`)).toBeVisible();

    // Authorizations table row
    await page.getByRole(`button`, { name: ` All Auths` }).click();
    const authRowText = await page.locator(`${row}`).innerText();
    [authNumber, member.identifier, authType, patientStatus, `${todaysDate} 12:00:00 AM`, team, "Pending", provider]
        .forEach(str => expect(authRowText).toContain(str));

    if (worklogActivityDate !== "N/A") {
        await expect(page.locator(`${gridId} table tbody tr:has-text("${loginID}") :text("${worklogActivityDate}")`))
            .not.toHaveCount(0);
    }

    // Close browser
    await browser.close();
});



 */











//--------------------------------
// Local helper: robust dropdown selection
//--------------------------------
async function selectRequiredDropdown(page, inputSelector, optionText) {
    const input = page.locator(inputSelector);
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.scrollIntoViewIfNeeded();
    await input.click({ force: true });
    await input.fill(optionText);
    await page.waitForTimeout(300);
    await input.press('ArrowDown');
    await input.press('Enter');
    await input.evaluate(el => el.blur());
}

//--------------------------------
// Local helper: provider selection
//--------------------------------
async function selectProvider(page, providerFieldName, providerName) {
    const lookupButtonSelector = `[name="${providerFieldName}"] ~ button[title="Lookup"]`;

    try {
        await page.locator(lookupButtonSelector).click({ timeout: 3000 });
    } catch {
        try {
            const notif = page.getByText('Notification', { exact: true });
            if (await notif.isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.getByRole('button', { name: 'Okay' }).click();
                await page.locator(lookupButtonSelector).click({ timeout: 3000 });
            }
        } catch {}
    }

    await page.getByRole('checkbox', { name: 'Out of Network' }).check();
    await page.getByRole('checkbox', { name: 'In Network' }).check();

    await page.getByRole('textbox', { name: 'Search...' }).fill(providerName);
    await page.getByRole('dialog', { name: 'Lookup' })
        .locator('#lookup-search-button')
        .click();

    await page.getByRole('gridcell', { name: providerName }).first().click();
    await page.getByRole('button', { name: 'Select', exact: true }).click();
}

//--------------------------------
// Test
//--------------------------------
test('Create Outpatient Authorization', async () => {

    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'AdvancedSearch';
    const password = process.env.DEFAULT_PASS_OCT_2025;

    const member = {
        name: 'Blackwell, Megan',
        insuranceCompany: 'Excellent Health Plan',
        identifier: 'B9824538',
        plan: 'PLAN B',
        startDate: '07/14/2024',
    };

    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';
    const authorizationType = 'Outpatient';
    const authType = 'OP';
    const authStatus = 'In Progress';
    const team = 'Case Team';
    const provider = "St. Catherine's Hospital";

    //--------------------------------
    // Login
    //--------------------------------
    const { page, browser } = await helpers.logIn3({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Clean-up previous authorizations
    //--------------------------------
    await helpers.cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    //--------------------------------
    // Act: Create Authorization
    //--------------------------------
    await page.getByRole('button')
        .filter({ hasText: 'Authorization Inpatient' })
        .hover();

    await page.getByLabel(member.name)
        .getByText(authorizationType, { exact: true })
        .click();

    // Auth Status
    await selectRequiredDropdown(
        page,
        'input[name="aush_status_id__1_input"]',
        authStatus
    );

    // Team
    await selectRequiredDropdown(
        page,
        'input[name="auth_team_reference_id_input"]',
        team
    );

    // Reviewer
    await selectRequiredDropdown(
        page,
        'input[name="auth_reviewer_user_id_input"]',
        loginID
    );

    // Providers
    await selectProvider(page, 'auth_provider_1_site_id', provider);
    await selectProvider(page, 'auth_provider_2_site_id', provider);

    // Save
    await page.getByRole('button', { name: ' Save' }).click();
    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Handle Worklog (if appears)
    //--------------------------------
    let worklogActivityDate = 'N/A';

    try {
        await expect(page.getByText('New Work Log')).toBeVisible({ timeout: 3000 });

        worklogActivityDate = await page
            .locator('#work_activity_date')
            .evaluate(e => e.value);

        worklogActivityDate = worklogActivityDate.substring(0, 14);

        await page.getByRole('button', { name: ' Save and Close' }).click();
    } catch {
        await expect(page.getByText('New Work Log')).not.toBeVisible({ timeout: 3000 });
    }

    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Grab Auth Number
    //--------------------------------
    const authNumber = (
        await page.getByText('Outpatient Auth #').innerText()
    ).split('#')[1];

    expect(Number(authNumber)).toBeGreaterThan(1);

    //--------------------------------
    // Assert: Authorization exists in grid
    //--------------------------------
    await page.getByRole('button', { name: ' All Auths' }).click();
    await helpers.waitUntilLoaded(page);

    const authRow = page.locator(
        `${gridId} table tbody tr:visible:has-text("${authNumber}")`
    );

    await authRow.waitFor({ state: 'visible', timeout: 5000 });

    const authRowText = await authRow.innerText();

    [
        authNumber,
        member.identifier,
        authType,
        team,
        'Pending',
        provider
    ].forEach(str => expect(authRowText).toContain(str));



});
