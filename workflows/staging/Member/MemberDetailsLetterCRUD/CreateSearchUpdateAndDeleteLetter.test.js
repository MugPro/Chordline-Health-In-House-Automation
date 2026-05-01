import { test, expect } from '@playwright/test';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
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

test(
    'Create, search, update, and delete a Letter',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
            // Constants
            const loginID = `SelectALetter`;
            const letterNameBase = `QAW Letter CRUD`;
            const letterName = letterNameBase + Date.now();
            const template = `Blank Document`;
            const member = `Brekke, QAWScottie`;
            const memberDetail = `Member Detail`;
            const consentForm = `Consent Form`;
            const descriptionUpdated = letterName + ` updated`;
            const clinical = `Clinical`;
            const caseManagement = `Case Management`;

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });


        await waitUntilLoaded(page);

        //--------------------------------
        // Act: Create Letter Template
        //--------------------------------
        await clickAndWait(page, page.getByText('Tools'));
        await clickAndWait(page, page.getByText('Reports & Letters'));
        await clickAndWait(page, page.getByText('Letters', { exact: true }));

        await clickAndWait(page, page.getByRole('button', { name: ' New' }));
        await waitUntilLoaded(page);

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Letter Name:' }),
            letterName,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'expand combobox' }),
        );
        await clickAndWait(page, page.getByText(template));

        await clickAndWait(
            page,
            page
                .getByRole('combobox')
                .filter({ hasText: 'Select a screen type...' })
                .getByLabel('select'),
        );
        await page.locator('#letterScreenType_listbox').getByText(memberDetail).click();

        await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
        await waitUntilLoaded(page);

        //--------------------------------
        // Close Letter Editor
        //--------------------------------
        await clickAndWait(
            page,
            page.getByLabel('New Letter').getByText('Close', { exact: true }),
        );
        await clickAndWait(page, page.getByText('Close', { exact: true }));

        //--------------------------------
        // Act: Apply Letter to Member
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Search...' }),
            member,
        );

        await clickAndWait(
            page,
            page.locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button'),
        );

        await page.getByRole('gridcell', { name: member }).dblclick();
        await waitUntilLoaded(page);





        await page.locator('#shortcuts').getByText('Attachments').click();


//--------------------------------
// Delete ALL letters starting with "QAW Letter"
//--------------------------------
        while (true) {
            // Find any gridcell whose text STARTS WITH "QAW Letter"
            const letterCell = page
                .getByRole('gridcell', { name: /^QAW Letter/i })
                .first();

            // Stop when no such letter exists
            if (!(await letterCell.isVisible().catch(() => false))) {
                break;
            }

            // Select the row
            await letterCell.click();

            // Ensure Delete icon is visible
            const deleteButton = page.getByTitle('Delete').nth(1);
            await expect(deleteButton).toBeVisible();

            // Click Delete
            await deleteButton.click();

            // Confirm deletion
            await page.getByRole('button', { name: 'Yes' }).click();

            // Wait for grid to refresh before next iteration
            await waitUntilLoaded(page);
        }










        await clickAndWait(
            page,
            page.getByRole('button', { name: '' }),
        );





        //await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page.getByRole('gridcell', { name: letterName, exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Select', exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Finalize' }),
        );
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

        //--------------------------------
        // Assert: Attachment created
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('gridcell', { name: letterName, exact: true }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: '', exact: true }),
        );

        await expect(
            page
                .getByLabel(`Attachment: ${letterName}.`)
                .getByText(`${letterName}.pdf`, { exact: true }),
        ).toBeVisible();

        await expect(
            page.locator('[name="atch_type_id__1_input"]'),
        ).toHaveValue(memberDetail);

        await expect(
            page.locator('[name="atch_reason_id__1_input"]'),
        ).toHaveValue(consentForm);

        //--------------------------------
        // Act: Update Attachment
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));



        //await page.getByRole('gridcell', { name: letterName }).click();

        await page.locator('#attachments-child-grid_active_cell').getByTitle('Edit').click();



/*
        await clickAndWait(
            page,
            page
                .getByLabel(`Attachment: ${letterName}.`)
                .getByRole('button', { name: ' Edit' }),
        );

 */


        await waitUntilLoaded(page);

        await fillAndWait(
            page,
            page.locator('#atch_description__1'),
            descriptionUpdated,
        );

        await clickAndWait(
            page,
            page.locator(
                'input[name="atch_type_id__1_input"] >> .. >> [title="clear"]',
            ),
        );

        await fillAndWait(
            page,
            page.locator('input[name="atch_type_id__1_input"]'),
            caseManagement,
        );
        await clickAndWait(page, page.getByText(caseManagement));

        await clickAndWait(
            page,
            page.locator(
                'input[name="atch_reason_id__1_input"] >> .. >> [title="clear"]',
            ),
        );

        await fillAndWait(
            page,
            page.locator('input[name="atch_reason_id__1_input"]'),
            clinical,
        );
        await clickAndWait(page, page.getByText(clinical));

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Save and Close' }),
        );

        //--------------------------------
        // Assert: Updated values persist
        //--------------------------------
        await page.getByRole('gridcell', { name: descriptionUpdated }).dblclick();
        await clickAndWait(page, page.locator('#edit'));

        await expect(
            page.locator('[name="atch_type_id__1_input"]'),
        ).toHaveValue(caseManagement);

        await expect(
            page.locator('[name="atch_reason_id__1_input"]'),
        ).toHaveValue(clinical);

        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));



    },
);