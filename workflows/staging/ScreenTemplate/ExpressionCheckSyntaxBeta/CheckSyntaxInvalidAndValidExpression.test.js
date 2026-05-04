import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
    reportCleanupFailed,
    copyDefaultScreenTemplate, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 300;

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
    'Check Syntax (beta) – Invalid and Valid Expressions',
    () => {
        test('User can validate invalid and valid rule expressions using Check Syntax (beta)', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `ExpCheckSyntaxBeta`;
            const screenTemplateGroup = `Work Log`;
            const defaultTemplate = `Work Log - Default`;
            const screenName = `CheckSyntax(beta)`;
            const screenTemplateCopyName = `${screenName}${Date.now()}`;

            const invalidExpression =
                `GetBenefitPlanCode( ) Date ( string ) DaysAfter ( date1, date2 )`;

            const errorMsg = `' D' is not recognized. Invalid expression.`;

            const validExpression =
                `DaysAfter ( '2025-05-05', '2025-05-10' ) > 2`;

            //const { page } = await logIn({ loginID });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                url });

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
                    screenName: `${defaultTemplate} - Copy`,
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
            // Act – Open Rules / Expression Editor
            //--------------------------------
            await clickAndWait(
                page,
                page.locator('#work_completed_by_overlay'),
            );

            await clickAndWait(page, page.getByText('Rules'));

            await clickAndWait(
                page,
                page.locator('.default-expression'),
            );

            //--------------------------------
            // Act – Invalid Expression
            //--------------------------------
            await fillAndWait(
                page,
                page.locator('#flyout-textarea'),
                invalidExpression,
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Check Syntax (beta)' }),
            );

            //--------------------------------
            // Assert – Invalid Expression
            //--------------------------------
            await expect(
                page.locator('[role="dialog"] #notificationWindow_wnd_title'),
            ).toBeVisible();

            await expect(
                page.locator(`[role="dialog"]:has-text("${errorMsg}")`),
            ).toBeVisible();

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Okay' }),
            );

            await expect(
                page.locator('#flyout-div'),
            ).toHaveClass(/k-error-colored/);



            //--------------------------------
            // Act – Valid Expression
            //--------------------------------
            await fillAndWait(
                page,
                page.locator('#flyout-textarea'),
                validExpression,
            );

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Check Syntax (beta)' }),
            );

            //--------------------------------
            // Assert – Valid Expression
            //--------------------------------
            await expect(
                page.locator('#flyout-div'),
            ).toHaveClass(/k-success-colored/);



        });
    },
);