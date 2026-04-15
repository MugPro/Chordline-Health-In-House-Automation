import { test, expect } from '@playwright/test';
import * as dateFns from 'date-fns';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 500;

const pause = async (page, ms = FILL_CLICK_PAUSE_MS) => {
    await page.waitForTimeout(ms);
};

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test(
    'Able to create, update, search for Work Log by Completed By and delete it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `WorkLogCRUDSearch`;
        const userFullName = `${loginID} Qaw`;

        const member = {
            firstName: 'QAWMalachi',
            lastName: 'Botsford',
            identifier: 'QAW1759180090511',
        };
        member.fullName = `${member.lastName}, ${member.firstName}`;

        const newWorkLog = {
            timeSpent: '15',
            timeSpentFormatted: '0.25',
            billable: 'No',
            activityType: 'Behavioral Health Activity',
            comments: 'Look at the wonderful work log we have created',
        };

        const todaysDate = dateFns.format(new Date(), 'MM/dd/yyyy');

        const { page } = await logIn({
            loginID,
            args: ['--kiosk-printing'],
        });
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Members → Work Logs
        //--------------------------------
        await clickAndWait(page, page.getByText('Home', { exact: true }));
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Search...' }),
            member.fullName,
        );
        await page.keyboard.press('Enter');

        await page
            .getByRole('gridcell', { name: member.fullName })
            .dblclick();
        await waitUntilLoaded(page);

        await page
            .locator('#worklogs-anchor')
            .getByText('Work Logs')
            .scrollIntoViewIfNeeded();

        //--------------------------------
        // Selectors
        //--------------------------------
        const addWorkLogButton = page.getByRole('button', {
            name: ' Work Log',
        });

        const workLogRow = page.locator(
            `#worklogs-child-grid tbody tr:has-text("${userFullName}")`,
        );

        //--------------------------------
        // Cleanup existing Work Log
        //--------------------------------
        try {
            await workLogRow.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await workLogRow.hover();
            await clickAndWait(page, workLogRow.locator('[title="Delete"]'));
            await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
            await workLogRow.waitFor({ state: 'hidden' });
        }

        const timeStamp1 = dateFns.format(new Date(), 'hh:mm:');

        //--------------------------------
        // Act: Create Work Log
        //--------------------------------
        await clickAndWait(page, addWorkLogButton);
        await page.getByText('New Work Logs').waitFor();

        await fillAndWait(
            page,
            page.locator('#work_time_spent'),
            newWorkLog.timeSpent,
        );

        // ✅ Strict-safe expand combobox
        await clickAndWait(
            page,
            page.locator(
                `[data-bind*="work_activity_type"] [aria-label="expand combobox"]`,
            ),
        );

        await clickAndWait(
            page,
            page.locator(`:text-is("${newWorkLog.activityType}")`),
        );

        const frame = page.frameLocator(
            '[title="Editable area. Press F10 for toolbar."]',
        );

        await fillAndWait(
            page,
            frame.locator('#work_comments'),
            newWorkLog.comments,
        );

        const timeStamp2 = dateFns.format(new Date(), 'hh:mm:');

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Save and Close' }),
        );

        //--------------------------------
        // Assert: Created
        //--------------------------------
        await expect(workLogRow).toBeVisible();

        let textToVerify = await workLogRow.innerText();
        [
            newWorkLog.activityType,
            newWorkLog.billable,
            newWorkLog.timeSpentFormatted,
            `${todaysDate} ${timeStamp1}`,
            `${todaysDate} ${timeStamp2}`,
        ].forEach(str => expect(textToVerify).toContain(str));

        newWorkLog.id = textToVerify.split('\t')[1];
        expect(Number(newWorkLog.id)).toBeGreaterThan(0);

        //--------------------------------
        // Act: Edit Work Log
        //--------------------------------
        const editedWorkLog = {
            timeSpent: '2',
            timeSpentFormatted: '2.00',
            billable: 'Yes',
            activityType: 'Medical Director Activity',
            comments: "You know, I think we can do better! Here's an edited version.",
            completedBy: 'Authorization Rate',
        };

        await workLogRow.hover();
        await clickAndWait(page, workLogRow.locator('[title="Edit"]'));

        await page.locator(`:text("Work Log #${newWorkLog.id}")`).waitFor();

        await clickAndWait(
            page,
            page.locator(
                `[data-bind*="work_completed_by"] [title="clear"][role="button"]`,
            ),
        );
        await fillAndWait(
            page,
            page.locator('input[name="work_completed_by_input"]'),
            editedWorkLog.completedBy,
        );
        await clickAndWait(
            page,
            page.getByRole('option', { name: editedWorkLog.completedBy }),
        );

        await fillAndWait(
            page,
            page.locator('#work_time_spent'),
            editedWorkLog.timeSpent,
        );

        await clickAndWait(
            page,
            page.getByRole('combobox').filter({ hasText: 'min' }).getByLabel('select'),
        );
        await clickAndWait(page, page.getByRole('option', { name: 'hr' }));

        await clickAndWait(
            page,
            page.locator(
                `[data-bind*="work_activity_type"] [aria-label="expand combobox"]`,
            ),
        );
        await page.keyboard.type(editedWorkLog.activityType);
        await clickAndWait(
            page,
            page.getByRole('option', { name: editedWorkLog.activityType }),
        );

        await clickAndWait(page, page.locator('[for="work_is_billable.Yes"]'));

        await fillAndWait(
            page,
            frame.locator('#work_comments'),
            editedWorkLog.comments,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Save and Close' }),
        );

        //--------------------------------
        // Act: Search by Completed By
        //--------------------------------
        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Search...' }),
            editedWorkLog.completedBy,
        );
        await page.keyboard.press('Enter');
        await expect(workLogRow).toBeVisible();

        //--------------------------------
        // Act: Delete
        //--------------------------------
        await workLogRow.hover();
        await clickAndWait(page, workLogRow.locator('[title="Delete"]'));
        await page.getByText('Are you sure you want to').waitFor();
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        //--------------------------------
        // Assert: Deleted
        //--------------------------------
        await expect(workLogRow).not.toBeVisible();
        await expect(addWorkLogButton).toBeEnabled();

        // Grid behavior differs when deleting last row
        try {
            // Other work logs exist
            await expect(
                page.locator('#worklogs-child-grid tbody'),
            ).toBeVisible({ timeout: 1000 });
        } catch {
            // Last work log was deleted
            await expect(
                page.locator('#worklogs-anchor'),
            ).toBeVisible({ timeout: 1000 });
        }
    },
);