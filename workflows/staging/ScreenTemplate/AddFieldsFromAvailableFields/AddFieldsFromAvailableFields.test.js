/*


import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    copyDefaultScreenTemplate,
    cleanupScreenTemplateCopy,
} from '../../../../helpers/Node20Helpers.js';


const FILL_CLICK_PAUSE_MS = 1400;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

test.describe(
    'Add Fields From Available Fields',
    () => {
        test('Can add fields from New Fields and Available Fields across templates', async () => {
            //--------------------------------
            // Arrange
            //--------------------------------
            const loginID = `AddAvailableField`;

            const screenTemplateGroup = `Compliance Notice - Grievance`;
            const defaultTemplate = `${screenTemplateGroup} - Default`;
            const copyScreenName = `${defaultTemplate} - Copy`;
            const screenName = `AddFieldFromAvail${Date.now()}`;

            const screenTemplateGroup2 = `Compliance Notice - Appeal`;
            const defaultTemplate2 = `${screenTemplateGroup2} - Default`;
            const copyScreenName2 = `${defaultTemplate2} - Copy`;
            const screenName2 = `AddFieldFromAvailV2_${Date.now()}`;

            const { page } = await logIn({ loginID });
            await waitUntilLoaded(page);

            //--------------------------------
            // Cleanup (pre‑test)
            //--------------------------------
            await cleanupScreenTemplateCopy(page, {
                screenName: copyScreenName,
                screenTemplateGroup,
                defaultTemplate,
                dontClose: true,
            });

            await waitUntilLoaded(page);

            await cleanupScreenTemplateCopy(page, {
                screenName: 'AddFieldFromAvail',
                screenTemplateGroup,
                defaultTemplate,
                onScreen: true,
            });

            await waitUntilLoaded(page);

            await cleanupScreenTemplateCopy(page, {
                screenName: copyScreenName2,
                screenTemplateGroup: screenTemplateGroup2,
                defaultTemplate: defaultTemplate2,
                dontClose: true,
            });

            await waitUntilLoaded(page);

            await cleanupScreenTemplateCopy(page, {
                screenName: 'AddFieldFromAvailV2_',
                screenTemplateGroup: screenTemplateGroup2,
                defaultTemplate: defaultTemplate2,
                onScreen: true,
            });

            await waitUntilLoaded(page);

            //--------------------------------
            // Create copy of first template
            //--------------------------------




            //await waitUntilLoaded(page);

            // Navigate Tools > Screen Templates
            await page.getByText('Tools').hover();
            await page.getByText('Screen Templates').click();

            await waitUntilLoaded(page);

            // Expand group
            await page
                .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
                .locator('span')
                .nth(1).click();

            await waitUntilLoaded(page);

            // Hover default template & click copy
            await page.getByRole('gridcell', { name: defaultTemplate, exact: true }).hover();
            await page.locator(`[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`).click({ timeout: 500 });
            await waitUntilLoaded(page);
            await page.getByRole('button', { name: 'Yes' }).click();

            // Fill custom screen name if provided

                await waitUntilLoaded(page);
                await page.getByRole('textbox', { name: 'Screen Name:' }).fill(screenName);


            await waitUntilLoaded(page);

            await page.getByRole('button', { name: 'Save' }).click();
            await waitUntilLoaded(page);



            //--------------------------------
            // Act – Add field from New Fields
            //--------------------------------
            await clickAndWait(
                page,
                page.getByText('Available Fields'),
            );

            await clickAndWait(
                page,
                page.getByText('New Fields'),
            );

            const dropDownField = page.locator(
                '.new-field-option[data-type="Dropdown Menu"]',
            );

            const noticeSection = page
                .locator('#record-div .formSection')
                .first();

            await dropDownField.first().dragTo(noticeSection);

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.getByRole('button', { name: ' Close' }),
            );

            await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page
                    .getByLabel('New Screen - Internal')
                    .getByText('Close'),
            );



            await waitUntilLoaded(page);


            //--------------------------------
            // Create copy of second template
            //--------------------------------








            // Navigate Tools > Screen Templates
            await page.getByText('Tools').hover();
            await page.getByText('Screen Templates').click();
            await waitUntilLoaded(page);

            // Expand group
            await page
                .getByRole('treeitem', { name: screenTemplateGroup2, exact: true })
                .locator('span')
                .nth(1)
                .click();

            await waitUntilLoaded(page);

            // Hover default template & click copy
            await page.getByRole('gridcell', { name: defaultTemplate2, exact: true }).hover();
            await page.locator(`[role="row"]:has(:text-is("${defaultTemplate2}")) [title="Copy"]`).click({ timeout: 500 });
            await waitUntilLoaded(page);
            await page.getByRole('button', { name: 'Yes' }).click();

            // Fill custom screen name if provided

            await waitUntilLoaded(page);
            await page.getByRole('textbox', { name: 'Screen Name:' }).fill(screenName2);


             await waitUntilLoaded(page);

            await page.getByRole('button', { name: 'Save' }).click();
            await waitUntilLoaded(page);





            //--------------------------------
            // Act – Add field from Available Fields
            //--------------------------------
            await clickAndWait(
                page,
                page.getByText('Available Fields'),
            );

            await waitUntilLoaded(page);

            const dropDownAvailableField = page
                .locator(
                    '#manage-rules-fields-unused .new-field-option[data-type="Dropdown Menu"]',
                )
                .first();

            const noticeSection2 = page
                .locator('#record-div .formSection')
                .first();

            await dropDownAvailableField.dragTo(noticeSection2);

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Save' }),
            );

           await waitUntilLoaded(page);

            await clickAndWait(
                page,
                page.getByRole('button', { name: 'Preview' }),
            );

            //--------------------------------
            // Assert
            //--------------------------------
            await expect(
                page
                    .locator(
                        '.formSection .k-picker.k-dropdownlist.dropdownlist.editfield',
                    )
                    .first(),
            ).toBeVisible();

            await clickAndWait(
                page,
                page.locator(
                    '[class="left outerfielddiv"]:has-text("Drop Down") span[role="button"]:visible',
                ),
            );

            await expect(
                page.locator('[role="region"] .k-no-data'),
            ).toHaveText('No data found.');

            //--------------------------------
            // Cleanup
            //--------------------------------
            await page.getByRole('button', { name: ' Close' }).click();

            await waitUntilLoaded(page);

            await page
                    .getByLabel('New Screen - Internal')
                    .getByText('Close', { exact: true }).click();






            console.log(
                '✅ Fields can be added from New Fields and Available Fields successfully',
            );
        });
    },
);

 */



























import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanupScreenTemplateCopy,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 1400;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

/* -------------------------------------------
   SAFE click helper for Close buttons
------------------------------------------- */
const safeClick = async (page, locator, timeout = 3000) => {
    try {
        if (await locator.isVisible({ timeout })) {
            await locator.click();
            await pause(page, 200);
        }
    } catch {
        // element already gone — ignore
    }
};

test.describe(
    'Add Fields From Available Fields',
    () => {
        test(
            'Can add fields from New Fields and Available Fields across templates',
            async () => {
                //--------------------------------
                // Arrange
                //--------------------------------
                const loginID = `AddAvailableField`;

                const screenTemplateGroup = `Compliance Notice - Grievance`;
                const defaultTemplate = `${screenTemplateGroup} - Default`;
                const copyScreenName = `${defaultTemplate} - Copy`;
                const screenName = `AddFieldFromAvail${Date.now()}`;

                const screenTemplateGroup2 = `Compliance Notice - Appeal`;
                const defaultTemplate2 = `${screenTemplateGroup2} - Default`;
                const copyScreenName2 = `${defaultTemplate2} - Copy`;
                const screenName2 = `AddFieldFromAvailV2_${Date.now()}`;

                const { page } = await logIn({ loginID });
                await waitUntilLoaded(page);

                //--------------------------------
                // Cleanup (pre-test)
                //--------------------------------
                await cleanupScreenTemplateCopy(page, {
                    screenName: copyScreenName,
                    screenTemplateGroup,
                    defaultTemplate,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: 'AddFieldFromAvail',
                    screenTemplateGroup,
                    defaultTemplate,
                    onScreen: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: copyScreenName2,
                    screenTemplateGroup: screenTemplateGroup2,
                    defaultTemplate: defaultTemplate2,
                    dontClose: true,
                });

                await cleanupScreenTemplateCopy(page, {
                    screenName: 'AddFieldFromAvailV2_',
                    screenTemplateGroup: screenTemplateGroup2,
                    defaultTemplate: defaultTemplate2,
                    onScreen: true,
                });

                //--------------------------------
                // Create copy of first template
                //--------------------------------
                await page.getByText('Tools').hover();
                await page.getByText('Screen Templates').click();
                await waitUntilLoaded(page);

                await page
                    .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
                    .locator('span')
                    .nth(1)
                    .click();

                await waitUntilLoaded(page);

                await page
                    .getByRole('gridcell', { name: defaultTemplate, exact: true })
                    .hover();

                await page
                    .locator(
                        `[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`,
                    )
                    .click({ timeout: 500 });

                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);

                await page
                    .getByRole('textbox', { name: 'Screen Name:' })
                    .fill(screenName);

                await page.getByRole('button', { name: 'Save' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Add field from New Fields
                //--------------------------------
                await clickAndWait(page, page.getByText('Available Fields'));
                await clickAndWait(page, page.getByText('New Fields'));

                const dropDownField = page.locator(
                    '.new-field-option[data-type="Dropdown Menu"]',
                );

                const noticeSection = page
                    .locator('#record-div .formSection')
                    .first();

                await dropDownField.first().dragTo(noticeSection);
                await waitUntilLoaded(page);






                await page.getByRole('button', { name: 'Save' }).click();
                await waitUntilLoaded(page);
                    await page.getByLabel('New Screen - Internal').getByText('Close', { exact: true }).click();

                await waitUntilLoaded(page);
                    await page.getByText('Close', { exact: true }).click();

                await waitUntilLoaded(page);






/*

                await safeClick(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                await safeClick(
                    page,
                    page
                        .getByLabel('New Screen - Internal')
                        .getByText('Close'),
                );

 */

                //--------------------------------
                // Create copy of second template
                //--------------------------------
                await page.getByText('Tools').hover();
                await page.getByText('Screen Templates').click();
                await waitUntilLoaded(page);

                await page
                    .getByRole('treeitem', { name: screenTemplateGroup2, exact: true })
                    .locator('span')
                    .nth(1)
                    .click();

                await waitUntilLoaded(page);

                await page
                    .getByRole('gridcell', {
                        name: defaultTemplate2,
                        exact: true,
                    })
                    .hover();

                await page
                    .locator(
                        `[role="row"]:has(:text-is("${defaultTemplate2}")) [title="Copy"]`,
                    )
                    .click({ timeout: 500 });

                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);

                await page
                    .getByRole('textbox', { name: 'Screen Name:' })
                    .fill(screenName2);

                await page.getByRole('button', { name: 'Save' }).click();
                await waitUntilLoaded(page);

                //--------------------------------
                // Act – Add field from Available Fields
                //--------------------------------
                await clickAndWait(page, page.getByText('Available Fields'));

                const dropDownAvailableField = page
                    .locator(
                        '#manage-rules-fields-unused .new-field-option[data-type="Dropdown Menu"]',
                    )
                    .first();

                const noticeSection2 = page
                    .locator('#record-div .formSection')
                    .first();

                await dropDownAvailableField.dragTo(noticeSection2);

                /*

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Save' }),
                );

                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Preview' }),
                );

                 */






                await page.getByRole('button', { name: 'Save' }).click();
                await waitUntilLoaded(page);
                await page.getByLabel('New Screen - Internal').getByText('Preview', { exact: true }).click();

                await waitUntilLoaded(page);









                //--------------------------------
                // Assert
                //--------------------------------
                await expect(
                    page
                        .locator(
                            '.formSection .k-picker.k-dropdownlist.dropdownlist.editfield',
                        )
                        .first(),
                ).toBeVisible();

                await clickAndWait(
                    page,
                    page.locator(
                        '[class="left outerfielddiv"]:has-text("Drop Down") span[role="button"]:visible',
                    ),
                );

                await expect(
                    page.locator('[role="region"] .k-no-data'),
                ).toHaveText('No data found.');

                //--------------------------------
                // Cleanup
                //--------------------------------

                /*
                await safeClick(
                    page,
                    page.getByRole('button', { name: ' Close' }),
                );

                await safeClick(
                    page,
                    page
                        .getByLabel('New Screen - Internal')
                        .getByText('Close', { exact: true }),
                );

                 */



/*
                await waitUntilLoaded(page);
                await page.getByLabel('New Screen - Internal').getByText('Close', { exact: true }).click();

                await waitUntilLoaded(page);
                await page.getByText('Close', { exact: true }).click();

               // await waitUntilLoaded(page);

 */







                console.log(
                    '✅ Fields can be added from New Fields and Available Fields successfully',
                );
            },
        );
    },
);