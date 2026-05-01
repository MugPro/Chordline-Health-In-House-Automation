import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 1500;

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

test('Create, Update, and Delete Grievance', async () => {
    //--------------------------------
    // Arrange: Constants
    //--------------------------------
    const memberName = `Carter, QAWolf`;
    const loginID = `CompGrievanceCRUD`;
    const member = {
        name: `Carter, QAWolf`,
        insuranceCompany: "Excellent Health Plan",
        identifier: "B1029384",
        startDate: "07/14/2024",
    };

    const tab = 'Compliance';
    const gridId = `[id="compliance-grid"]`;
    const grievanceNumSelector = `Grievance #`;

    const teams = ['Compliance Team', 'MD Team', 'Review Team', 'UM Team'];
    const grievanceTypes = ['Standard of Care'];
    const grievanceCategories = [
        'Customer Service',
    ];
    const grievanceStatuses = ['Reopened', 'Withdrawn'];
    const levels = ['First Level', 'Fourth Level', 'Third Level'];
    const grievanceReceiptTypes = ['Oral', 'Written'];
    const priorities = ['Standard'];
    const dueDateExtTypes = ['None', 'Tolled'];

    const team = faker.helpers.arrayElement(teams);
    const grievanceType = faker.helpers.arrayElement(grievanceTypes);
    const grievanceCategory = faker.helpers.arrayElement(grievanceCategories);
    const grievanceStatus = faker.helpers.arrayElement(grievanceStatuses);
    const grievanceReceiptType = faker.helpers.arrayElement(grievanceReceiptTypes);
    const level = faker.helpers.arrayElement(levels);
    const priority = faker.helpers.arrayElement(priorities);
    const dueDateExtType = faker.helpers.arrayElement(dueDateExtTypes);

    const spacedDateString = 'MM dd yyyy hh mm ss aa';
    const dateString = 'MM/dd/yyyy hh:mm:ss aa';
    const today = Date.now();

    const openedDate = dateFns.format(today, spacedDateString);
    const openedDateFormat = dateFns.format(today, dateString);

    const tollingStartDate = dateFns.format(today, spacedDateString);
    const tollingStartDateFormat = dateFns.format(today, dateString);

    const reviewer = `CompGrievanceCRUD`;

    //--------------------------------
    // Login & Cleanup
    //--------------------------------
    //const { page } = await logIn({ loginID });


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });








    await clickAndWait(page, page.getByText('Home', { exact: true }));
    await clickAndWait(page, page.locator('#home-tabs-tab-4').getByText('Members'));

    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Search...' }),
        memberName,
    );
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: memberName }).dblclick();
    await waitUntilLoaded(page);

    await clickAndWait(
        page,
        page.getByLabel(memberName).getByText(tab, { exact: true }).first(),
    );
    await waitUntilLoaded(page);

    //--------------------------------
    // Cleanup existing appeals
    //--------------------------------
    const rowsLocator = page.locator(
        `${gridId} table tbody tr:visible:has-text("${loginID}")`,
    );

    while (await rowsLocator.count() > 0) {
        const row = rowsLocator.first();
        await row.hover();
        await pause(page);

        await clickAndWait(
            page,
            row.locator('td >> nth=0 >> button[title="Delete"]'),
        );
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        await waitUntilLoaded(page);
    }

    await expect(rowsLocator).toHaveCount(0);




















    //--------------------------------
    // CREATE GRIEVANCE
    //--------------------------------
    await page.getByRole('button').filter({ hasText: 'Compliance Appeal' }).hover();
    await clickAndWait(page, page.getByText('Grievance', { exact: true }));
    await waitUntilLoaded(page);

    await fillAndWait(
        page,
        page.locator('input[name="cpch_team_reference_id_input"]'),
        team,
    );
    await clickAndWait(page, page.getByText(team));




    await fillAndWait(
        page,
        page.locator('input[name="cpch_type_input"]'),
        grievanceType,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: grievanceType, exact: true }),
    );

    await fillAndWait(
        page,
        page.locator('input[name="cpch_grievance_category_input"]'),
        grievanceCategory,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: grievanceCategory, exact: true }),
    );

    await fillAndWait(
        page,
        page.locator('input[name="cpch_status_input"]'),
        grievanceStatus,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: grievanceStatus, exact: true }),
    );

    await page.locator('#cpch_opened_date').clear();
    await pause(page);
    await page.locator('#cpch_opened_date').pressSequentially(openedDate);

    await fillAndWait(
        page,
        page.locator('input[name="cpch_receipt_type_input"]'),
        grievanceReceiptType,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: grievanceReceiptType, exact: true }),
    );

    await fillAndWait(
        page,
        page.locator('input[name="cpch_level_input"]'),
        level,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: level, exact: true }),
    );

    await fillAndWait(
        page,
        page.locator('input[name="cpch_priority_input"]'),
        priority,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: priority, exact: true }),
    );

    await clickAndWait(
        page,
        page.locator('#cpch_due_date_extension_type div').filter({
            hasText: dueDateExtType,
        }),
    );

    if (dueDateExtType === 'Tolled') {
        await page.locator('#cpch_tolling_from').clear();
        await pause(page);
        await page.locator('#cpch_tolling_from').pressSequentially(tollingStartDate);
    }

    const dateGrievanceReceived = await page
        .locator('#cpch_date_received')
        .evaluate(e => e.value);

    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await page.getByText('New Work Log').waitFor();

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    const grievanceNum = await page.getByText(grievanceNumSelector).innerText();

    //--------------------------------
    // ASSERT: CREATE
    //--------------------------------
    await expect(page.locator('#cpch_team_reference_id')).toHaveText(team);
    //await expect(page.locator('#cpch_reviewer_user_id')).toHaveText('CompGrievanceCRUD Qaw');
    await expect(page.locator('#cpch_type')).toHaveText(grievanceType);
    await expect(page.locator('#cpch_grievance_category')).toHaveText(grievanceCategory);
    await expect(page.locator('#cpch_status')).toHaveText(grievanceStatus);
    await expect(page.locator('#cpch_opened_date')).toHaveText(openedDateFormat);
    await expect(page.locator('#cpch_receipt_type')).toHaveText(grievanceReceiptType);
    await expect(page.locator('#cpch_level')).toHaveText(level);
    await expect(page.locator('#cpch_priority')).toHaveText(priority);
    await expect(page.locator('#cpch_due_date_extension_type')).toHaveText(dueDateExtType);
    await expect(page.locator('#cpch_date_received')).toHaveText(dateGrievanceReceived);

    //--------------------------------
    // UPDATE GRIEVANCE
    //--------------------------------
    const teamEdit = 'Case Team';
    const grievanceTypeEdit = 'Quality of Care';
    const grievanceCategoryEdit = 'Access';
    const grievanceStatusEdit = 'Completed';
    const levelEdit = 'Judicial Review';
    const priorityEdit = 'Expedited';
    const dueDateExtTypeEdit = 'Extension';

    const todayEdit = Date.now();
    const openedDateEdit = dateFns.format(todayEdit, spacedDateString);
    const openedDateFormatEdit = dateFns.format(todayEdit, dateString);

    const reason = faker.lorem.sentence();
    const resolution = faker.lorem.sentence();

    await clickAndWait(page, page.getByRole('button', { name: ' Edit' }));
    await waitUntilLoaded(page);

    await fillAndWait(
        page,
        page.locator('input[name="cpch_team_reference_id_input"]'),
        teamEdit,
    );
    await clickAndWait(page, page.getByText(teamEdit));







    await fillAndWait(
        page,
        page.locator('input[name="cpch_type_input"]'),
        grievanceTypeEdit,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: grievanceTypeEdit, exact: true }),
    );









    await fillAndWait(
        page,
        page.locator('input[name="cpch_grievance_category_input"]'),
        grievanceCategoryEdit,
    );
    await clickAndWait(page, page.getByText(grievanceCategoryEdit));









    await fillAndWait(
        page,
        page.locator('input[name="cpch_status_input"]'),
        grievanceStatusEdit,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: grievanceStatusEdit, exact: true }),
    );








    await page.locator('#cpch_opened_date').clear();
    await pause(page);
    await page.locator('#cpch_opened_date').pressSequentially(openedDateEdit);

    await fillAndWait(
        page,
        page.locator('input[name="cpch_level_input"]'),
        levelEdit,
    );
    await clickAndWait(page, page.getByText(levelEdit));








    await fillAndWait(
        page,
        page.locator('input[name="cpch_priority_input"]'),
        priorityEdit,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: priorityEdit, exact: true }),
    );







    await clickAndWait(
        page,
        page.locator('#cpch_due_date_extension_type div').filter({
            hasText: dueDateExtTypeEdit,
        }),
    );

    const reasonFrame = page
        .frameLocator('[title="Editable area. Press F10 for toolbar."]')
        .first();
    await reasonFrame.locator('#cpch_reason').fill(reason);

    const resolutionFrame = page
        .frameLocator('[title="Editable area. Press F10 for toolbar."]')
        .nth(1);
    await resolutionFrame.locator('#cpch_outcome_resolution').fill(resolution);

    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await page.getByText('New Work Log').waitFor();
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    //--------------------------------
    // ASSERT: UPDATE
    //--------------------------------
    await expect(page.locator('#cpch_team_reference_id')).toHaveText(teamEdit);
    await expect(page.locator('#cpch_type')).toHaveText(grievanceTypeEdit);
    await expect(page.locator('#cpch_grievance_category')).toHaveText(grievanceCategoryEdit);
    await expect(page.locator('#cpch_status')).toHaveText(grievanceStatusEdit);
    await expect(page.locator('#cpch_opened_date')).toHaveText(openedDateFormatEdit);
    await expect(page.locator('#cpch_level')).toHaveText(levelEdit);
    await expect(page.locator('#cpch_priority')).toHaveText(priorityEdit);
    await expect(page.locator('#cpch_reason')).toHaveText(reason);
    await expect(page.locator('#cpch_outcome_resolution')).toHaveText(resolution);
    await expect(page.getByText(grievanceNumSelector)).toHaveText(grievanceNum);

    //--------------------------------
    // DELETE GRIEVANCE
    //--------------------------------
    await clickAndWait(page, page.getByRole('button', { name: ' All Compliance' }));
    await waitUntilLoaded(page);


    while (await rowsLocator.count() > 0) {
        const row = rowsLocator.first();
        await row.hover();
        await pause(page);

        await clickAndWait(
            page,
            row.locator('td >> nth=0 >> button[title="Delete"]'),
        );
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
        await waitUntilLoaded(page);
    }

    await expect(rowsLocator).toHaveCount(0);
});