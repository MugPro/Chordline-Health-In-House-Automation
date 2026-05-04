import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed, logIn3,
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

test.describe(
    'Plus Field Button – Add Field Before and After',
    () => {
        test('Field can be inserted BEFORE and AFTER an existing field', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `PlusFieldButton`;
            const screenTemplateGroup = `Authorization - OBS`;
            const defaultTemplate = `Authorization - OBS - Default`;
            const copyTemplate = `Authorization - OBS - Default - Copy`;
            const screenName = `AddUsingPlusField`;
            const screenTemplateCopyName = `${screenName}${Date.now()}`;

            const fieldTextAfter = `Should appear AFTER *Team`;
            const fieldTextBefore = `Should appear BEFORE *Team`;

            //const { page } = await logIn({ loginID, slowMo: 400 });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url, slowMo: 400 });


            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre-test)
            //--------------------------------
            try {
                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName,
                    //dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenTemplateGroup,
                    defaultTemplate,
                    screenName: copyTemplate,
                    onScreen: true,
                    dontClose: true,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }

            //--------------------------------
            // Navigate to Screen Templates
            //--------------------------------
            await page.getByText('Tools').hover();
            await page.getByText('Screen Templates').click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Expand group & copy default template
            //--------------------------------
            await clickAndWait(
                page,
                page
                    .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
                    .locator('span')
                    .nth(1),
            );

            await page
                .getByRole('gridcell', { name: defaultTemplate, exact: true })
                .hover();

            await clickAndWait(
                page,
                page.locator(
                    `[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`,
                ),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Yes' }),
            );

            await waitUntilLoaded(page);

            //--------------------------------
            // Rename copied screen
            //--------------------------------
            await fillAndWait(
                page,
                page.getByRole('textbox', { name: 'Screen Name:' }),
                screenTemplateCopyName,
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );
            await waitUntilLoaded(page);

            //--------------------------------
            // Act – Add field AFTER *Team
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Field' }).first(),
            );

            // Wait for radio options to be present
            await expect(page.getByLabel('After')).toBeVisible();

// Click via label (more reliable than radio input)
            await clickAndWait(
                page,
                page.getByLabel('After'),
            );


            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await fillAndWait(
                page,
                page.locator('#question-text'),
                fieldTextAfter,
            );
            await page.locator('#question-text').blur();

            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – AFTER (Edit mode)
            //--------------------------------
            const afterField = page.locator(
                `[data-table-code="TEAM"] + [data-type="Radio Button"]:has-text("${fieldTextAfter}")`,
            );
            await expect(afterField).toBeVisible();

            //--------------------------------
            // Preview – AFTER
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
            await waitUntilLoaded(page);

            const teamPreviewAfter = page.locator(
                '#AUTH_OBSERVATION-0-modal [data-table-code="TEAM"]'
            );

            const fieldPreviewAfter = page.locator(
                '#AUTH_OBSERVATION-0-modal >> text=Should appear AFTER *Team'
            );

            await expect(teamPreviewAfter).toBeVisible();
            await expect(fieldPreviewAfter).toBeVisible();

            const teamAfterBox = await teamPreviewAfter.boundingBox();
            const fieldAfterBox = await fieldPreviewAfter.boundingBox();

            expect(teamAfterBox).not.toBeNull();
            expect(fieldAfterBox).not.toBeNull();

// Field must be to the RIGHT of Team
            expect(fieldAfterBox.x).toBeGreaterThan(teamAfterBox.x);

            //--------------------------------
            // Cleanup – remove AFTER field
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));
            await clickAndWait(page, afterField);
            await clickAndWait(page, page.locator('.k-state-hover [title="Remove"]'));

            await waitUntilLoaded(page);

            //--------------------------------
            // Act – Add field BEFORE *Team
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Field' }).first(),
            );

            await clickAndWait(
                page,
                page.getByRole('radio', { name: 'Before' }),
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Add', exact: true }),
            );

            await fillAndWait(
                page,
                page.locator('#question-text'),
                fieldTextBefore,
            );
            await page.locator('#question-text').blur();

            await waitUntilLoaded(page);

            //--------------------------------
            // Assert – BEFORE (Edit mode)
            //--------------------------------
            const beforeField = page.locator(
                `[data-type="Radio Button"]:has-text("${fieldTextBefore}") + [data-table-code="TEAM"]`,
            );
            await expect(beforeField).toBeVisible();

            //--------------------------------
            // Preview – BEFORE
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
            await waitUntilLoaded(page);

            const teamPreviewBefore = page.locator(
                '#AUTH_OBSERVATION-0-modal [data-table-code="TEAM"]',
            );

            const fieldPreviewBefore = page.locator(
                '#AUTH_OBSERVATION-0-modal >> text=Should appear BEFORE *Team',
            );

            await expect(teamPreviewBefore).toBeVisible();
            await expect(fieldPreviewBefore).toBeVisible();

            const teamBeforeBox = await teamPreviewBefore.boundingBox();
            const fieldBeforeBox = await fieldPreviewBefore.boundingBox();

            expect(teamBeforeBox).not.toBeNull();
            expect(fieldBeforeBox).not.toBeNull();
            expect(fieldBeforeBox.x).toBeLessThan(teamBeforeBox.x);

            //--------------------------------
            // Final Cleanup
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));


            console.log('✅ Plus Field button BEFORE / AFTER positioning validated');
        });
    },
);
