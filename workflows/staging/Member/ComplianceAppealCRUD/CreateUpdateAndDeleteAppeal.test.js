/*

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage,
} from '../../../../helpers/Node20Helpers.js';





            //--------------------------------
            // Arrange:
            //--------------------------------
            //. Constants
            const loginID = `CompAppealCRUD`;
            const member = {
                name: `Block, QAWWilton`,
                insuranceCompany: "Excellent Health Plan",
                identifier: " QAW1767876124204",
                startDate: "08/18/2024",
            };
            const tab = "Compliance";
            const gridId = `[id="compliance-grid"]`;
            const teams = [
                "Case Team",
                "Compliance Team",
                "MD Team",
                "Review Team",
                "UM Team",
            ];
            const team = faker.helpers.arrayElement(teams);
            const reviewer = 'CompAppealCRUD';
            const appealTypes = ["Claims Appeal", "Denial Appeal"];
            const appealType = faker.helpers.arrayElement(appealTypes);
            const appealCategories = [
                "DMR",
                "DMR Reconsideration",
                "NCP Claim",
                "NCP Reconsideration",
                "PTS Determination",
                "PTS Reconsideration",
            ];
            const appealCategory = faker.helpers.arrayElement(appealCategories);
            const appealStatuses = ["Completed", "Open", "Reopened", "Withdrawn"];
            const appealStatus = faker.helpers.arrayElement(appealStatuses);
            const today = Date.now();
            const openedDate = dateFns.format(today, "MM dd yyyy hh mm ss aa");
            const openedDateFormat = dateFns.format(today, "MM/dd/yyyy hh:mm:ss aa");
            const levels = [
                "First Level",
                "Fourth Level",
                "Judicial Review",
                "Third Level",
            ];
            const level = faker.helpers.arrayElement(levels);
            const priorities = [
                "Concurrent",
                "PTS-Expedited",
                "PTS-Standard",
                "Retro",
            ];
            const priority = faker.helpers.arrayElement(priorities);
            const dueDateExtTypes = ["Extension", "None", "Tolled"];
            const dueDateExtType = faker.helpers.arrayElement(dueDateExtTypes);
            const tollingStartDate = dateFns.format(today, "MM dd yyyy hh mm ss aa");
            const tollingStartDateFormat = dateFns.format(
                today,
                "MM/dd/yyyy hh:mm:ss aa",
            );
            const appealNumSelector = `Appeal #`;





            test("creat,uodate and delete appeal", async () => {




                // Sign in to the app
                const { page } = await logIn({ loginID });













                await page.getByText(`Home`, { exact: true }).click();
                await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

                // Fill search bar
                await page.getByRole(`textbox`, { name: `Search...` }).fill(`Block, QAWWilton`);
                await page.keyboard.press("Enter");

                await waitUntilLoaded(page);

                // Double click the member name row
                try {
                    await page.getByRole(`gridcell`, { name: `Block, QAWWilton` }).dblclick();
                    await waitUntilLoaded(page);
                } catch {
                    await page.getByRole(`gridcell`, { name: `Block, QAWWilton` }).dblclick();
                    await waitUntilLoaded(page);
                }


                // Navigate to tab on members page
                await page
                    .getByLabel(`Block, QAWWilton`)
                    .getByText(tab, { exact: true })
                    .first()
                    .click();

                    await waitUntilLoaded(page);


// Grab the count of rows visible that are created by our user
const rowsLocator = await page
    .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`);



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


                    await expect (page
                        .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`),

                    ).toHaveCount(0);



                    await waitUntilLoaded(page);











                //--------------------------------
                // Act:
                //--------------------------------
                // Hover over the "+ Compliance" button
                await page
                    .getByRole(`button`)
                    .filter({ hasText: `Compliance Appeal` })
                    .hover();

                // Select option Appeal
                await page.getByRole(`menu`).getByText(`Appeal`).click();
                await waitUntilLoaded(page);

                // Fill in Team and select option
                await page
                    .locator(`input[name="cpch_team_reference_id_input"]`)
                    .fill(team);
                await page.getByText(team).click();


                    await waitUntilLoaded(page);






                await page.getByRole('button', { name: '...' }).nth(2).click();
                await page.getByRole('textbox', { name: 'Search...' }).fill('CompAppealCRUD');
                await page.locator('.quick-search-medium.right > .k-input > .k-input-suffix > #lookup-search-button').click();


                await page.getByRole('gridcell', { name: 'CompAppealCRUD', exact: true }).click();
                await page.getByRole('button', { name: 'Select', exact: true }).click();


                    await waitUntilLoaded(page);


















                // Fill in Appeal Type and select option
                await page.locator(`input[name="cpch_type_input"]`).fill(appealType);
                await page.getByText(appealType).click();

                    await waitUntilLoaded(page);

                // Fill in Appeal Category and select option
                await page
                    .locator(`input[name="cpch_appeal_category_input"]`)
                    .fill(appealCategory);
                await page
                    .getByRole(`option`, { name: appealCategory, exact: true })
                    .click();

                    await waitUntilLoaded(page);

                // Fill in Appeal Status
                await page.locator(`input[name="cpch_status_input"]`).clear();
                    await waitUntilLoaded(page);
                await page.locator(`input[name="cpch_status_input"]`).fill(appealStatus);
                await page
                    .getByRole(`option`, { name: appealStatus, exact: true })
                    .click();

                    await waitUntilLoaded(page);

                // Fill in Opened Date
                await page.locator(`#cpch_opened_date`).clear();
                    await waitUntilLoaded(page);
                await page.locator(`#cpch_opened_date`).pressSequentially(openedDate);

                    await waitUntilLoaded(page);

                // Fill in Level and select option
                await page.locator(`input[name="cpch_level_input"]`).fill(level);
                await page.getByRole(`option`, { name: level, exact: true }).click();

                    await waitUntilLoaded(page);

                // Fill in Priority and select option
                await page.locator(`input[name="cpch_priority_input"]`).fill(priority);
                await page.getByRole(`option`, { name: priority, exact: true }).click();


                    await waitUntilLoaded(page);

                // Click the Due Date Extension Type radio button
                await page
                    .locator(`#cpch_due_date_extension_type div`)
                    .filter({ hasText: dueDateExtType })
                    .click();

                    await waitUntilLoaded(page);

                // Fill in the Tolling Start Date
                if (dueDateExtType === "Tolled") {
                    await page.locator(`#cpch_tolling_from`).clear();
                    await waitUntilLoaded(page);
                    await page
                        .locator(`#cpch_tolling_from`)
                        .pressSequentially(tollingStartDate);
                }

                    await waitUntilLoaded(page);

                // Grab the Date Appeal Received date
                const dateAppealReceived = await page
                    .locator(`#cpch_date_received`)
                    .evaluate((e) => e.value);

                    await waitUntilLoaded(page);

                // Click the "Save" button
                await page.getByRole(`button`, { name: ` Save` }).click();
                await waitUntilLoaded(page);

                // Wait for the "New Work Log" to be displayed
                await page.getByText(`New Work Log`).waitFor();

                // Click the "Save and Close" button
                await page.getByRole(`button`, { name: ` Save and Close` }).click();

                // Grab the Appeal #
                const appealNum = await page.getByText(appealNumSelector).innerText();

                //--------------------------------
                // Assert:
                //--------------------------------
                // Assert the Team persists
                await expect(page.locator(`#cpch_team_reference_id`)).toHaveText(team);

                // Assert the Reviewer persists
                await expect(page.locator(`#cpch_reviewer_user_id`)).toHaveText('CompAppealCRUD Qaw');

                // Assert the Appeal Type persists
                await expect(page.locator(`#cpch_type`)).toHaveText(appealType);

                // Assert the Appeal Category persists
                await expect(page.locator(`#cpch_appeal_category`)).toHaveText(
                    appealCategory,
                );

                // Assert the Appeal Status persists
                await expect(page.locator(`#cpch_status`)).toHaveText(appealStatus);

                // Assert the Opened Date persists
                await expect(page.locator(`#cpch_opened_date`)).toHaveText(
                    openedDateFormat,
                );

                // Assert the Level persists
                await expect(page.locator(`#cpch_level`)).toHaveText(level);

                // Assert the Priority persists
                await expect(page.locator(`#cpch_priority`)).toHaveText(priority);

                // Assert the Due Date Extension Type persists
                await expect(page.locator(`#cpch_due_date_extension_type`)).toHaveText(
                    dueDateExtType,
                );

                if (dueDateExtType === "Tolled") {
                    await expect(page.locator(`#cpch_tolling_from`)).toHaveText(
                        tollingStartDateFormat,
                    );
                }

                // Assert the Date Appeal Received persists
                await expect(page.locator(`#cpch_date_received`)).toHaveText(
                    dateAppealReceived,
                );










                //--------------------------------
                // Arrange:
                //--------------------------------
                // Constants
                const teamEdit = faker.helpers.arrayElement(teams);
                const appealTypeEdit = faker.helpers.arrayElement(appealTypes);
                const appealCategoryEdit = faker.helpers.arrayElement(appealCategories);
                const appealStatusEdit = faker.helpers.arrayElement(appealStatuses);
                const todayEdit = Date.now();
                const openedDateEdit = dateFns.format(
                    todayEdit,
                    "MM dd yyyy hh mm ss aa",
                );
                const openedDateFormatEdit = dateFns.format(
                    todayEdit,
                    "MM/dd/yyyy hh:mm:ss aa",
                );
                const levelEdit = faker.helpers.arrayElement(levels);
                const priorityEdit = faker.helpers.arrayElement(priorities);
                const dueDateExtTypeEdit = faker.helpers.arrayElement(dueDateExtTypes);
                const tollingStartDateEdit = dateFns.format(
                    todayEdit,
                    "MM dd yyyy hh mm ss aa",
                );
                const tollingStartDateFormatEdit = dateFns.format(
                    todayEdit,
                    "MM/dd/yyyy hh:mm:ss aa",
                );
                const reason = faker.lorem.sentence();
                const resolution = faker.lorem.sentence();

                // Click the Edit button
                await page.getByRole(`button`, {name: ` Edit`}).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Act:
                //--------------------------------
                // Fill in Team and select option
                await page.locator(`input[name="cpch_team_reference_id_input"]`).clear();
                    await waitUntilLoaded(page);
                await page
                    .locator(`input[name="cpch_team_reference_id_input"]`)
                    .fill(teamEdit);
                await page
                    .getByRole(`option`, {name: teamEdit})
                    .locator(`span`)
                    .click();

                    await waitUntilLoaded(page);

                // Fill in Appeal Type and select option
                await page.locator(`input[name="cpch_type_input"]`).clear();
                    await waitUntilLoaded(page);
                await page.locator(`input[name="cpch_type_input"]`).fill(appealTypeEdit);
                    await waitUntilLoaded(page);
                await page
                    .getByRole(`option`, {name: appealTypeEdit})
                    .locator(`span`)
                    .click();
                    await waitUntilLoaded(page);

                // Fill in Appeal Category and select option
                await page.locator(`input[name="cpch_appeal_category_input"]`).clear();
                    await waitUntilLoaded(page);
                await page
                    .locator(`input[name="cpch_appeal_category_input"]`)
                    .fill(appealCategoryEdit);
                    //await waitUntilLoaded(page);
                await page
                    .getByRole(`option`, {name: appealCategoryEdit, exact: true})
                    .click();

                    await waitUntilLoaded(page);

                // Fill in Appeal Status
                await page.locator(`input[name="cpch_status_input"]`).clear();
                    await waitUntilLoaded(page);
                await page
                    .locator(`input[name="cpch_status_input"]`)
                    .fill(appealStatusEdit);
                    //await waitUntilLoaded(page);
                await page
                    .getByRole(`option`, {name: appealStatusEdit, exact: true})
                    .click();

                    await waitUntilLoaded(page);

                // Fill in Opened Date
                await page.locator(`#cpch_opened_date`).clear();
                    await waitUntilLoaded(page);
                await page.locator(`#cpch_opened_date`).pressSequentially(openedDateEdit);

                    await waitUntilLoaded(page);

                // Fill in Level and select option
                await page.locator(`input[name="cpch_level_input"]`).clear();
                    await waitUntilLoaded(page);
                await page.locator(`input[name="cpch_level_input"]`).fill(levelEdit);
                    //await waitUntilLoaded(page);
                await page.getByRole(`option`, {name: levelEdit, exact: true}).click();

                    await waitUntilLoaded(page);

                // Fill in Priority and select option
                await page.locator(`input[name="cpch_priority_input"]`).clear();
                    await waitUntilLoaded(page);
                await page
                    .locator(`input[name="cpch_priority_input"]`)
                    .fill(priorityEdit);
                await page
                    .getByRole(`option`, {name: priorityEdit, exact: true})
                    .click();

                    await waitUntilLoaded(page);

                // Click the Due Date Extension Type radio button
                await page
                    .locator(`#cpch_due_date_extension_type div`)
                    .filter({hasText: dueDateExtTypeEdit})
                    .click();

                    await waitUntilLoaded(page);

                // Fill in the Tolling Start Date
                if (dueDateExtTypeEdit === "Tolled") {
                    await page.locator(`#cpch_tolling_from`).clear();
                    await waitUntilLoaded(page);
                    await page
                        .locator(`#cpch_tolling_from`)
                        .pressSequentially(tollingStartDateEdit);
                    await waitUntilLoaded(page);
                }

                // Grab the frame for the Reason for Appeal text box and fill in reason
                const reasonFrame = page
                    .frameLocator(`[title="Editable area. Press F10 for toolbar."]`)
                    .first();
                await reasonFrame.locator(`[id="cpch_reason"]`).fill(reason);

                // Grab the frame for the Appeal for Resolution text box and fill in Appeal Resolution
                const resolutionFrame = page
                    .frameLocator(`[title="Editable area. Press F10 for toolbar."]`)
                    .nth(1);
                await resolutionFrame
                    .locator(`[id="cpch_outcome_resolution"]`)
                    .fill(resolution);


                    await waitUntilLoaded(page);

                // Click the "Save" button
                await page.getByRole(`button`, {name: ` Save`}).click();
                await waitUntilLoaded(page);

                // Wait for the "New Work Log" to be displayed
                await page.getByText(`New Work Log`).waitFor();

                // Click the "Save and Close" button
                await page.getByRole(`button`, {name: ` Save and Close`}).click();

                    await waitUntilLoaded(page);

                //--------------------------------
                // Assert:
                //--------------------------------
                // Assert the Team persists
                await expect(page.locator(`#cpch_team_reference_id`)).toHaveText(
                    teamEdit,
                );

                // Assert the Reviewer persists
                //await expect(page.locator(`#cpch_reviewer_user_id`)).toHaveText(reviewer);

                // Assert the Appeal Type persists
                await expect(page.locator(`#cpch_type`)).toHaveText(appealTypeEdit);

                // Assert the Appeal Category persists
                await expect(page.locator(`#cpch_appeal_category`)).toHaveText(
                    appealCategoryEdit,
                );

                // Assert the Appeal Status persists
                await expect(page.locator(`#cpch_status`)).toHaveText(appealStatusEdit);

                // Assert the Opened Date persists
                await expect(page.locator(`#cpch_opened_date`)).toHaveText(
                    openedDateFormatEdit,
                );

                // Assert the Level persists
                await expect(page.locator(`#cpch_level`)).toHaveText(levelEdit);

                // Assert the Priority persists
                await expect(page.locator(`#cpch_priority`)).toHaveText(priorityEdit);

                // Assert the Due Date Extension Type persists
                await expect(page.locator(`#cpch_due_date_extension_type`)).toHaveText(
                    dueDateExtTypeEdit,
                );

                if (dueDateExtTypeEdit === "Tolled") {
                    await expect(page.locator(`#cpch_tolling_from`)).toHaveText(
                        tollingStartDateFormatEdit,
                    );
                }

                // Assert the Date Appeal Received persists
                await expect(page.locator(`#cpch_date_received`)).toHaveText(
                    dateAppealReceived,
                );

                // Assert the Reason for Appeal persists
                await expect(page.locator(`[id="cpch_reason"]`)).toHaveText(reason);

                // Assert the Appeal Resolution persists
                await expect(page.locator(`[id="cpch_outcome_resolution"]`)).toHaveText(
                    resolution,
                );

                // Assert the Appeal number hasn't changed
                await expect(page.getByText(appealNumSelector)).toHaveText(appealNum);



            //------------
            // Arrange:
            //--------------------------------
            // Click the All Compliance button
            await page.getByRole(`button`, {name: ` All Compliance`}).click();

                    await waitUntilLoaded(page);

            //--------------------------------
            // Act:
            //--------------------------------
            // Search for the Reviewer
            await page.getByRole(`textbox`, {name: `Search...`}).fill(reviewer);
            await page.keyboard.press("Enter");

                    await waitUntilLoaded(page);







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


                await expect (page
                    .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`),

                ).toHaveCount(0);

            });


 */



























import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

import {
    logIn, logIn3,
    waitUntilLoaded,
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

test('create, update and delete appeal', async () => {
    //--------------------------------
    // Arrange: constants
    //--------------------------------
    const loginID = 'CompAppealCRUD';
    const memberName = 'Block, QAWWilton';
    const tab = 'Compliance';
    const gridId = '#compliance-grid';
    const appealNumSelector = 'Appeal #';

    const teams = ['Case Team', 'Compliance Team', 'MD Team', 'Review Team', 'UM Team'];
    const appealTypes = ['Claims Appeal', 'Denial Appeal'];
    const appealCategories = [
        'DMR',
        'DMR Reconsideration',
        'NCP Claim',
        'NCP Reconsideration',
        'PTS Determination',
        'PTS Reconsideration',
    ];
    const appealStatuses = ['Completed', 'Reopened', 'Withdrawn'];
    const levels = ['First Level', 'Fourth Level', 'Judicial Review', 'Third Level'];
    const priorities = ['Concurrent', 'PTS-Expedited', 'PTS-Standard', 'Retro'];
    const dueDateExtTypes = ['Extension', 'None', 'Tolled'];

    //--------------------------------
    // Login & navigation
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
    // CREATE APPEAL
    //--------------------------------
    const team = faker.helpers.arrayElement(teams);
    const appealType = faker.helpers.arrayElement(appealTypes);
    const appealCategory = faker.helpers.arrayElement(appealCategories);
    const appealStatus = faker.helpers.arrayElement(appealStatuses);
    const level = faker.helpers.arrayElement(levels);
    const priority = faker.helpers.arrayElement(priorities);
    const dueDateExtType = faker.helpers.arrayElement(dueDateExtTypes);

    const now = Date.now();
    const openedDate = dateFns.format(now, 'MM dd yyyy hh mm ss aa');
    const openedDateFormat = dateFns.format(now, 'MM/dd/yyyy hh:mm:ss aa');

    await clickAndWait(
        page,
        page.getByRole('button').filter({ hasText: 'Compliance Appeal' }),
    );
    await clickAndWait(page, page.getByRole('menu').getByText('Appeal'));
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
        appealType,
    );
    await clickAndWait(page, page.getByText(appealType));

    await fillAndWait(
        page,
        page.locator('input[name="cpch_appeal_category_input"]'),
        appealCategory,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: appealCategory, exact: true }),
    );

    await fillAndWait(
        page,
        page.locator('input[name="cpch_status_input"]'),
        appealStatus,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: appealStatus, exact: true }),
    );

    await page.locator('#cpch_opened_date').clear();
    await pause(page);
    await page.locator('#cpch_opened_date').pressSequentially(openedDate);
    await pause(page);

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
        await page
            .locator('#cpch_tolling_from')
            .pressSequentially(openedDate);
    }

    const dateAppealReceived = await page
        .locator('#cpch_date_received')
        .evaluate(e => e.value);

    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await page.getByText('New Work Log').waitFor();

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    const appealNum = await page.getByText(appealNumSelector).innerText();















    //--------------------------------
// Assert: Create persisted
//--------------------------------
    await expect(page.locator('#cpch_team_reference_id')).toHaveText(team);

    await expect(page.locator('#cpch_type')).toHaveText(appealType);

    await expect(page.locator('#cpch_appeal_category')).toHaveText(
        appealCategory,
    );

    await expect(page.locator('#cpch_status')).toHaveText(appealStatus);

    await expect(page.locator('#cpch_opened_date')).toHaveText(
        openedDateFormat,
    );

    await expect(page.locator('#cpch_level')).toHaveText(level);

    await expect(page.locator('#cpch_priority')).toHaveText(priority);

    await expect(page.locator('#cpch_due_date_extension_type')).toHaveText(
        dueDateExtType,
    );

    if (dueDateExtType === 'Tolled') {
        await expect(page.locator('#cpch_tolling_from')).toHaveText(
            openedDateFormat,
        );
    }

// Date Appeal Received is system‑set → assert unchanged
    await expect(page.locator('#cpch_date_received')).toHaveText(
        dateAppealReceived,
    );

// Appeal number exists
    await expect(page.getByText(appealNumSelector)).toHaveText(appealNum);














    //--------------------------------
    // UPDATE APPEAL
    //--------------------------------
    const teamEdit = faker.helpers.arrayElement(teams);
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
// Assert: Update persisted
//--------------------------------
    await expect(page.locator('#cpch_team_reference_id')).toHaveText(
        teamEdit,
    );

    await expect(page.locator('#cpch_type')).toHaveText(appealType);

    await expect(page.locator('#cpch_appeal_category')).toHaveText(
        appealCategory,
    );

    await expect(page.locator('#cpch_status')).toHaveText(appealStatus);

    await expect(page.locator('#cpch_opened_date')).toHaveText(
        openedDateFormat,
    );

    await expect(page.locator('#cpch_level')).toHaveText(level);

    await expect(page.locator('#cpch_priority')).toHaveText(priority);

// Reason (iframe)
    await expect(
        page.locator('#cpch_reason'),
    ).toHaveText(reason);

// Resolution (iframe)
    await expect(
        page.locator('#cpch_outcome_resolution'),
    ).toHaveText(resolution);

// Appeal number must NOT change
    await expect(page.getByText(appealNumSelector)).toHaveText(appealNum);












    //--------------------------------
    // DELETE APPEAL
    //--------------------------------
    await clickAndWait(page, page.getByRole('button', { name: ' All Compliance' }));
    await waitUntilLoaded(page);

    /*
    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Search...' }),
        loginID,
    );
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);

     */

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