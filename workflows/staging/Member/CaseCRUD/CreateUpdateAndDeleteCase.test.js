/*

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

// ✅ Match helpers used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed,
} from '../../../../helpers/Node20Helpers.js';




const FILL_CLICK_PAUSE_MS = 400;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Create, Update, and Delete a Case', async () => {
    //--------------------------------
    // Arrange: Create Case
    //--------------------------------
    const loginID = `CaseCRUD`;
    const memberName = `Deets, QAWMerge`;
    const program = `Case Management`;
    const caseManager = `${loginID} Qaw`;
    const status1 = `Identified`;

    const today = Date.now();
    const statusDate = dateFns.format(today, 'MM dd yyyy hh mm ss aa');
    const statusDateFormat = dateFns.format(today, 'MM/dd/yyyy hh:mm:ss aa');

    // Log in
    const { page } = await logIn({ loginID });




    //--------------------------------
    // Act: Create Case
    //--------------------------------
    // Navigate Home > Members
    await clickAndWait(page, page.getByText('Home', { exact: true }));
    await clickAndWait(page, page.locator('#home-tabs-tab-4'));

    // Search member
    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Search...' }),
        memberName,
    );
    await page.keyboard.press('Enter');

    //await waitUntilLoaded(page);

    // Open member
    //await page.getByRole('gridcell', { name: memberName }).dblclick();

    await page
        .getByRole('row', { name: memberName })
        .first()
        .dblclick();

    await waitUntilLoaded(page);

    // Open Case tab
    await clickAndWait(page, page.getByText('Case', { exact: true }).first());

    await waitUntilLoaded(page);

    // Add Case
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Case' }),
    );
    await waitUntilLoaded(page);

    // Program
    await clickAndWait(
        page,
        page.locator(
            `[data-bind="attr: { class: fields.case_program_reference_id.inputClass }"] [role="button"]`,
        ).first(),
    );
    await fillAndWait(
        page,
        page.locator('input[name="case_program_reference_id_input"]'),
        program,
    );
    await clickAndWait(page, page.getByRole('option', { name: program }));

    // Case Manager
    await clickAndWait(
        page,
        page.locator(
            `[data-bind="attr: { data-table-code: fields.case_manager.lookupTableCode, data-filter-code: fields.case_manager.lookupFilterCode }"] [role="button"]`,
        ).first(),
    );
    await fillAndWait(
        page,
        page.locator('input[name="case_manager_input"]'),
        caseManager,
    );
    await clickAndWait(page, page.getByRole('option', { name: caseManager }));

    await waitUntilLoaded(page);

    // Status Date
    const statusDateInput = page.locator('#case_status_date');
    await statusDateInput.clear();
    await waitUntilLoaded(page);
    await statusDateInput.pressSequentially(statusDate);

    await waitUntilLoaded(page);

    // Status
    await clickAndWait(
        page,
        page.locator(
            `[data-bind="attr: { class: fields.case_status_reference_id.inputClass }"] [role="button"]`,
        ).first(),
    );

    await waitUntilLoaded(page);

    await fillAndWait(
        page,
        page.locator('input[name="case_status_reference_id_input"]'),
        status1,
    );

    await waitUntilLoaded(page);

    await clickAndWait(page, page.getByRole('option', { name: status1 }));

    await waitUntilLoaded(page);

    // Save Case
    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await waitUntilLoaded(page);
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    await waitUntilLoaded(page);

    // Capture Case Number
    const caseNum = await page
        .locator('#form-header .headerLabel')
        .innerText();

    //--------------------------------
    // Assert: Case Created
    //--------------------------------
    await expect(page.locator('#case_program_reference_id')).toContainText(program);
    await expect(page.locator('#case_manager')).toContainText(caseManager);
    await expect(page.locator('#case_status_reference_id')).toContainText(status1);

    //--------------------------------
    // Arrange: Update Case
    //--------------------------------
    const programEdit = 'Coordination of Care';
    const status1Edit = ['Closed', 'Identified'][
        Math.floor(Math.random() * 4)
        ];
    const priority = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
    const risk = String(Math.floor(Math.random() * 5) + 1);

    const todayEdit = Date.now();
    const statusDateEdit = dateFns.format(todayEdit, 'MM dd yyyy hh mm ss aa');
    const statusDateFormatEdit = dateFns.format(
        todayEdit,
        'MM/dd/yyyy hh:mm:ss aa',
    );

    //--------------------------------
    // Act: Update Case
    //--------------------------------
    await clickAndWait(page, page.getByRole('button', { name: ' Edit' }));
    await waitUntilLoaded(page);

    // Clear Program
    await clickAndWait(page, page.getByRole('button', { name: '' }).nth(1));
    await fillAndWait(
        page,
        page.locator('input[name="case_program_reference_id_input"]'),
        programEdit,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: programEdit, exact: true }).locator('span'),
    );

    await waitUntilLoaded(page);

    // Clear Status
    await clickAndWait(page, page.getByRole('button', { name: '' }).nth(3));
    await waitUntilLoaded(page);

    await fillAndWait(
        page,
        page.locator('input[name="case_status_reference_id_input"]'),
        status1Edit,
    );

    await waitUntilLoaded(page);

    await clickAndWait(
        page,
        page.getByRole('option', { name: status1Edit }).locator('span'),
    );

    await waitUntilLoaded(page);



    // Status Date
    await page.locator('#case_status_date').clear();
    await waitUntilLoaded(page);
    await page.locator('#case_status_date').pressSequentially(statusDateEdit);

    await waitUntilLoaded(page);

    // Priority
    await fillAndWait(
        page,
        page.locator('input[name="case_priority_reference_id_input"]'),
        priority,
    );
    await clickAndWait(page, page.getByRole('option', { name: priority }));

    // Risk
    await fillAndWait(
        page,
        page.locator('input[name="case_risk_reference_id_input"]'),
        risk,
    );
    await clickAndWait(page, page.getByRole('option', { name: risk }));

    await waitUntilLoaded(page);

    // Save Updates
    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await waitUntilLoaded(page);
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Case Updated
    //--------------------------------
    await expect(page.locator('#case_program_reference_id')).toHaveText(programEdit);
    await expect(page.locator('#case_status_reference_id')).toHaveText(status1Edit);
    await expect(page.locator('#case_priority_reference_id')).toHaveText(priority);
    await expect(page.locator('#case_risk_reference_id')).toHaveText(risk);
    await expect(page.locator('#case_status_date')).toHaveText(
        statusDateFormatEdit,
    );

    //--------------------------------
    // Act: Delete Case
    //--------------------------------
    await clickAndWait(page, page.getByRole('button', { name: ' All Cases' }));
    await waitUntilLoaded(page);

    const rowsLocator = page.locator(
        `[id="member-case-grid"] table tbody tr:has-text("${caseManager}")`,
    );

    while (await rowsLocator.count() > 0) {
        // Always target the FIRST matching row
        const row = rowsLocator.first();

        // Hover to reveal delete button
        await row.hover();

        // Click Delete button in that row
        await row
            .locator('td >> nth=0 >> button[title="Delete"]')
            .click();

        // Confirm deletion
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        // Wait for grid to refresh
        await waitUntilLoaded(page);
    }


    await expect(
        page.locator(
            `[id="member-case-grid"] table tbody tr:has-text("${caseManager}")`,
        ),
    ).toHaveCount(0);

});


 */





import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

// ✅ Match helpers used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
    reportCleanupFailed, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";





test('Create, Update, and Delete a Case', async () => {
    //--------------------------------
    // Arrange: Create Case
    //--------------------------------
    const loginID = `CaseCRUD`;
    const memberName = `Deets, QAWMerge`;
    const program = `Case Management`;
    const caseManager = `${loginID} Qaw`;
    const status1 = `Identified`;

    const today = Date.now();
    const statusDate = dateFns.format(today, 'MM dd yyyy hh mm ss aa');
    const statusDateFormat = dateFns.format(today, 'MM/dd/yyyy hh:mm:ss aa');

    // Log in
   // const { page } = await logIn({ loginID });



    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    //--------------------------------
    // Act: Create Case
    //--------------------------------
    // Navigate Home > Members
    await page.getByText('Home', { exact: true }).click();
    await page.locator('#home-tabs-tab-4').click();

    // Search member
    await (
        page.getByRole('textbox', { name: 'Search...' }).fill(memberName)
    );
    await page.keyboard.press('Enter');

    await waitUntilLoaded(page);

    // Open member
    //await page.getByRole('gridcell', { name: memberName }).dblclick();

    await page
        .getByRole('row', { name: memberName })
        .first()
        .dblclick();

    await waitUntilLoaded(page);

    // Open Case tab
    await page.getByText('Case', { exact: true }).first().click();

    await waitUntilLoaded(page);

    // Add Case
    await page.getByRole('button', { name: ' Case' }).click();
    await waitUntilLoaded(page);


    await page.locator('input[name="case_program_reference_id_input"]').fill(program);

    //await page.getByRole('option', { name: program }).click();



    await page.locator('input[name="case_manager_input"]').fill(caseManager);

    //await  page.getByRole('option', { name: caseManager }).click();

    //await waitUntilLoaded(page);

    // Status Date

   // await statusDateInput.clear();
    //await waitUntilLoaded(page);
    //await statusDateInput.pressSequentially(statusDate);


    await page.locator('#case_status_date').fill(statusDate);


    //await waitUntilLoaded(page);


    //await waitUntilLoaded(page);

    await page.locator('input[name="case_status_reference_id_input"]').fill(status1);

    //await waitUntilLoaded(page);

    //await page.getByRole('option', { name: status1 }).click();

    await waitUntilLoaded(page);

    // Save Case
    await page.getByRole('button', { name: ' Save' }).click();
    await waitUntilLoaded(page);
    await page.getByRole('button', { name: ' Save and Close' }).click();

    await waitUntilLoaded(page);

    // Capture Case Number
    const caseNum = await page
        .locator('#form-header .headerLabel')
        .innerText();

    //--------------------------------
    // Assert: Case Created
    //--------------------------------
    await expect(page.locator('#case_program_reference_id')).toContainText(program);
    await expect(page.locator('#case_manager')).toContainText(caseManager);
    await expect(page.locator('#case_status_reference_id')).toContainText(status1);

    //--------------------------------
    // Arrange: Update Case
    //--------------------------------
    const programEdit = 'Coordination of Care';
    const status1Edit = 'Closed';
    const priority = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
    const risk = String(Math.floor(Math.random() * 5) + 1);

    const todayEdit = Date.now();
    const statusDateEdit = dateFns.format(todayEdit, 'MM dd yyyy hh mm ss aa');
    const statusDateFormatEdit = dateFns.format(
        todayEdit,
        'MM/dd/yyyy hh:mm:ss aa',
    );

    //--------------------------------
    // Act: Update Case
    //--------------------------------
    await waitUntilLoaded(page);
    await page.getByRole('button', { name: ' Edit' }).click();
    await waitUntilLoaded(page);

    await page.locator('input[name="case_program_reference_id_input"]').fill(programEdit);

    await page.getByRole('option', { name: programEdit, exact: true }).locator('span').click();

    //await waitUntilLoaded(page);

    // Clear Status
   // await clickAndWait(page, page.getByRole('button', { name: '' }).nth(3));
    //await waitUntilLoaded(page);

    await waitUntilLoaded(page);

    await page.locator('input[name="case_status_reference_id_input"]').fill(status1Edit);

    //await waitUntilLoaded(page);

    await page.getByRole('option', { name: status1Edit }).locator('span').click();

    await waitUntilLoaded(page);



    await page.locator('#case_status_date').fill(statusDateEdit);

    // Status Date
    //await page.locator('#case_status_date').clear();
   //await waitUntilLoaded(page);
    //await page.locator('#case_status_date').pressSequentially(statusDateEdit);

    await waitUntilLoaded(page);

    // Priority
    await page.locator('input[name="case_priority_reference_id_input"]').fill(priority);

    await page.getByRole('option', { name: priority }).click();

    await waitUntilLoaded(page);

    // Risk
    await page.locator('input[name="case_risk_reference_id_input"]').fill(risk);

    await page.getByRole('option', { name: risk }).click();

    await waitUntilLoaded(page);

    // Save Updates
    await page.getByRole('button', { name: ' Save' }).click();
    await waitUntilLoaded(page);
    await page.getByRole('button', { name: ' Save and Close' }).click();

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Case Updated
    //--------------------------------
    await expect(page.locator('#case_program_reference_id')).toHaveText(programEdit);
    await expect(page.locator('#case_status_reference_id')).toHaveText(status1Edit);
    await expect(page.locator('#case_priority_reference_id')).toHaveText(priority);
    await expect(page.locator('#case_risk_reference_id')).toHaveText(risk);



    //--------------------------------
    // Act: Delete Case
    //--------------------------------
    await page.getByRole('button', { name: ' All Cases' }).click();
    await waitUntilLoaded(page);

    const rowsLocator = page.locator(
        `[id="member-case-grid"] table tbody tr:has-text("${caseManager}")`,
    );

    while (await rowsLocator.count() > 0) {
        // Always target the FIRST matching row
        const row = rowsLocator.first();

        // Hover to reveal delete button
        await row.hover();

        // Click Delete button in that row
        await row
            .locator('td >> nth=0 >> button[title="Delete"]')
            .click();

        // Confirm deletion
        await page.getByRole('button', { name: 'Yes' }).click();

        // Wait for grid to refresh
        await waitUntilLoaded(page);
    }


    await expect(
        page.locator(
            `[id="member-case-grid"] table tbody tr:has-text("${caseManager}")`,
        ),
    ).toHaveCount(0);

});