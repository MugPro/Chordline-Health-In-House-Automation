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
const FILL_CLICK_PAUSE_MS = 500;

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
    'Add New Fields – Left Sidebar Add, Update, and Delete',
    () => {
        test('User can add, update, and delete a Large Text field from the left sidebar', async () => {

            //--------------------------------
            // Arrange
            //--------------------------------
            const screenTemplateGroup = `Authorization Service - RF`;
            const defaultTemplate = `${screenTemplateGroup} - Default`;
            const screenName = `${defaultTemplate} - Copy`;
            const updatedFieldText = `Large Text - edited`;
            const loginID = `AddNewLeftSidebar`;

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
                    screenName,
                    screenTemplateGroup,
                    defaultTemplate,
                });
            } catch (e) {
                await reportCleanupFailed({
                    dedupKey: 'cleanupScreenTemplateCopy',
                    errorMsg: e.message,
                });
            }


           // await waitUntilLoaded(page);
            //--------------------------------
            // Create copy of default template
            //--------------------------------
            await copyDefaultScreenTemplate(page, {
                defaultTemplate,
                screenTemplateGroup,
                screenName,
            });

           // await waitUntilLoaded(page);

            //--------------------------------
            // Navigate to Screen Templates
            //--------------------------------
            await clickAndWait(page, page.getByText('Tools'));
            await clickAndWait(page, page.getByText('Screen Templates').first());
            await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText(screenTemplateGroup));
            await clickAndWait(
                page,
                page.getByRole('gridcell', { name: screenName }),
            );

            await waitUntilLoaded(page);

            //--------------------------------
            // Open Left Sidebar (New Fields)
            //--------------------------------
            await clickAndWait(
                page,
                page.getByRole('button', { name: '' }),
            );
           // await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText('New Fields'));

            //--------------------------------
            // Act – Drag Large Text into screen
            //--------------------------------
            await clickAndWait(page, page.getByText('Large Text').first());

            const largeTextDraggable = page.locator(
                '.new-field-option[data-type="Large Text"]',
            );

            const serviceSectionDropArea = page.getByText(
                'Request Field * Requested',
            );

            await largeTextDraggable.dragTo(serviceSectionDropArea);

            //--------------------------------
            // Save and Preview
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            //await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the "Large Text" field is visible in the modal window\
            await expect(
                page.getByLabel(`Edit Screen - Internal (`).getByText(`Large Text:`),
            ).toBeVisible();

            // Verify that the Large Text area is visible on the page
            await expect(
                page.getByText(`* Large Text: TemplateFormat`),
            ).toBeVisible();
            await expect(
                page.getByLabel(`Edit Screen - Internal (`).getByText(`Large Text:`),
            ).toBeVisible();

            // Assert the page has text "* Large Text: TemplateFormat"
            await expect(
                page.getByText(`* Large Text: TemplateFormat`),
            ).toBeVisible();

            //--------------------------------
            // Act – Update field text
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

            //await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.locator('#auli_custom_field_1_overlay'),
            );

            await fillAndWait(
                page,
                page.locator('#question-text'),
                updatedFieldText,
            );

            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
           // await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the "Large Text" field is visible in the modal window\
            await expect(
                page
                    .getByLabel(`Edit Screen - Internal (`)
                    .getByText(`${updatedFieldText}:`),
            ).toBeVisible();

            // Verify that the Large Text are is visible on the page
            await expect(
                page.getByText(`* Large Text - edited: TemplateFormat`),
            ).toBeVisible();


            //--------------------------------
            // Act – Delete field
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

            //await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.locator('#auli_custom_field_1_overlay'),
            );

            await clickAndWait(
                page,
                page.locator('[data-type="Large Text"] [title="Remove"]').first(),
            );

            await clickAndWait(page, page.getByRole('button', { name: 'Save' }));
            //await waitUntilLoaded(page);
            await clickAndWait(page, page.getByRole('button', { name: 'Preview' }));
            //await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert the "Large Text - edited" field is visible in the modal window\
            await expect(
                page
                    .getByLabel(`Edit Screen - Internal (`)
                    .getByText(`${updatedFieldText}:`),
            ).not.toBeVisible();

            // Verify that the Large Text are is visible on the page
            await expect(
                page.getByText(`* Large Text - edited: TemplateFormat`),
            ).not.toBeVisible();

            //--------------------------------
            // Final Cleanup
            //--------------------------------
            await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

            //await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page
                    .getByLabel('Edit Screen - Internal')
                    .getByText('Close', { exact: true }),
            );

            //await waitUntilLoaded(page);

            await clickAndWait(page, page.getByText('Close', { exact: true }));

            //await waitUntilLoaded(page);

            await cleanupScreenTemplateCopy(page, {
                screenName,
                screenTemplateGroup,
                defaultTemplate,
            });

            //await page.close();

            console.log(
                '✅ Left sidebar Large Text field added, updated, and deleted successfully',
            );
        });
    },
);