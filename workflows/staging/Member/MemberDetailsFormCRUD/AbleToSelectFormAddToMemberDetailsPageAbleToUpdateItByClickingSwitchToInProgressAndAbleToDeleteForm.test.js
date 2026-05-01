/*

import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

test(
    'Able to select form, add to Member Details, update via Switch to In Progress, and delete form',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemDetsForm`;

        const member = {
            firstName: `Judy`,
            lastName: `Marks`,
        };

        const form = `General Form`;

        const today = Date.now();
        const startDate = dateFns.format(today, 'MM dd yyyy');
        const startDateFormat = dateFns.format(today, 'MM/dd/yyyy');

        const medicationsQ1 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const medicationsQ2 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const medicationsQ3 =
            medicationsQ2 === 'No' ? faker.lorem.sentence() : '';

        const clinicalList = [
            "Alzheimer's Disease",
            'Asthma',
            'Cancer',
            'Cardiac Disease',
            'Congenital Condition',
            'Coronary Artery Disease',
            'COPD',
            'CVA-Stroke',
            'Diabetes',
            'Heart Failure',
            'Mental Health Issues',
            'Kidney Disease',
            'Respiratory Disease',
            'Spinal Cord Injury',
        ];

        const clinicalQ1 = faker.helpers.arrayElements(clinicalList, 4);
        const clinicalQ2 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const clinicalQ3 =
            clinicalQ2 === 'Yes'
                ? `${faker.person.firstName()} ${faker.person.lastName()}`
                : '';
        const clinicalQ4 =
            clinicalQ2 === 'Yes'
                ? faker.helpers.arrayElements(clinicalList, 4)
                : [];

        const safetyQ1 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const safetyQ2 =
            safetyQ1 === 'Yes'
                ? String(faker.number.int({ min: 1, max: 10 }))
                : '';
        const safetyQ3 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const safetyQ4 = faker.lorem.sentence();
        const safetyQ5 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const safetyQ6 =
            safetyQ5 === 'No' ? faker.lorem.sentence() : '';

        const satisfactionQ1 = faker.lorem.sentence();

        const { page } = await logIn({ loginID });
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Members → Member Detail → Forms
        //--------------------------------
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(`${member.lastName}, ${member.firstName}`);
        await page.locator('#lookup-search-button:visible').click();

        await page
            .getByRole('gridcell', {
                name: `${member.lastName}, ${member.firstName}`,
            })
            .dblclick();

        await waitUntilLoaded(page);

        await page
            .getByRole('menuitem', { name: 'Member Detail' })
            .locator('span')
            .nth(1)
            .click();

        await page.locator('#shortcuts').getByText('Forms').click();

        //--------------------------------
        // Cleanup existing forms created by this user
        //--------------------------------
        try {
            await page
                .locator('#forms-anchor')
                .getByRole('textbox', { name: 'Search...' })
                .fill(loginID);
            await page.locator('#forms-anchor a').click();

            const rows = page.locator(
                '#forms-child-grid table tbody tr:has-text("' + loginID + '")',
            );

            for (let i = (await rows.count()) - 1; i >= 0; i--) {
                const row = rows.nth(i);
                await row.hover();
                await row.locator('[title="Delete"]').click();
                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);
            }
        } catch {
            // safe cleanup
        }

        //--------------------------------
        // Act: Add new form
        //--------------------------------
        await page.getByRole('button', { name: ' Form' }).click();

        await page
            .getByRole('dialog', { name: 'Choose Form' })
            .getByPlaceholder('Search...')
            .fill(form);

        await page
            .getByRole('dialog', { name: 'Choose Form' })
            .locator('#lookup-search-button')
            .click();

        await page.getByRole('gridcell', { name: form }).click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Fill form
        //--------------------------------
        await page.locator('[placeholder="mm/dd/yyyy"]').first().clear();
        await page
            .locator('[placeholder="mm/dd/yyyy"]')
            .first()
            .pressSequentially(startDate);

        await page.locator(`[name*="custom_11"][value="${medicationsQ1}"]`).click();
        await page.locator(`[name*="custom_12"][value="${medicationsQ2}"]`).click();

        if (medicationsQ2 === 'No') {
            await page.locator('#custom_13').fill(medicationsQ3);
        }

        for (const diag of clinicalQ1) {
            await page.locator(`[name*="custom_14"][value="${diag}"]`).check();
        }

        await page.locator(`[name*="custom_15"][value="${clinicalQ2}"]`).click();

        if (clinicalQ2 === 'Yes') {
            await page.locator('#custom_16').fill(clinicalQ3);
            for (const diag of clinicalQ4) {
                await page.locator(`[name*="custom_17"][value="${diag}"]`).check();
            }
        }

        await page.locator(`[name*="custom_18"][value="${safetyQ1}"]`).click();
        if (safetyQ1 === 'Yes') {
            await page.getByRole('spinbutton').fill(safetyQ2);
        }

        await page.locator(`[name*="custom_20"][value="${safetyQ3}"]`).click();
        await page.locator(`[name*="custom_23"]`).fill(safetyQ4);

        await page.locator(`[name*="custom_24"][value="${safetyQ5}"]`).click();
        if (safetyQ5 === 'No') {
            await page.locator('#custom_25').fill(safetyQ6);
        }

        await page.locator('#custom_21').fill(satisfactionQ1);

        await page.getByRole('button', { name: ' Save' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();

        const formId = await page.getByText('General Form #').innerText();

        //--------------------------------
        // Switch to In Progress → Edit → Save
        //--------------------------------
        await page.getByRole('button', { name: ' Close' }).click();

        const row = page.locator(
            '#forms-child-grid table tbody tr:has-text("' + loginID + '")',
        );

        await waitUntilLoaded(page);

        await row.dblclick();

        await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Switch to In Progress' }).click();
        await page
            .getByLabel('General Form #')
            .getByRole('button', { name: ' Edit' })
            .click();

        await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Save' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();

        //--------------------------------
        // Delete form
        //--------------------------------
        await page.getByRole('button', { name: ' Close' }).click();

        await waitUntilLoaded(page);

        await row.hover();
        await row.locator('[title="Delete"]').click();
        await page.getByRole('button', { name: 'Yes' }).click();

        await expect(row).not.toBeVisible();
    },
);


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

test(
    'Able to select form, add to Member Details page, update via Switch to In Progress, and delete form',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemDetsForm`;
        const member = { firstName: `Judy`, lastName: `Marks` };
        const form = `General Form`;

        const today = Date.now();
        const startDate = dateFns.format(today, 'MM dd yyyy');
        const startDateFormat = dateFns.format(today, 'MM/dd/yyyy');

        const medicationsQ1 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const medicationsQ2 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const medicationsQ3 =
            medicationsQ2 === 'No' ? faker.lorem.sentence() : '';

        const diagnoses = [
            "Alzheimer's Disease",
            'Asthma',
            'Cancer',
            'Cardiac Disease',
            'Congenital Condition',
            'Coronary Artery Disease',
            'COPD',
            'CVA-Stroke',
            'Diabetes',
            'Heart Failure',
            'Mental Health Issues',
            'Kidney Disease',
            'Respiratory Disease',
            'Spinal Cord Injury',
        ];

        const clinicalQ1 = faker.helpers.arrayElements(diagnoses, 4);
        const clinicalQ2 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const clinicalQ3 =
            clinicalQ2 === 'Yes'
                ? `${faker.person.firstName()} ${faker.person.lastName()}`
                : '';
        const clinicalQ4 =
            clinicalQ2 === 'Yes'
                ? faker.helpers.arrayElements(diagnoses, 4)
                : [];

        const safetyQ1 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const safetyQ2 =
            safetyQ1 === 'Yes'
                ? String(faker.number.int({ min: 1, max: 10 }))
                : '';
        const safetyQ3 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const safetyQ4 = faker.lorem.sentence();
        const safetyQ5 = ['Yes', 'No'][Math.floor(Math.random() * 2)];
        const safetyQ6 =
            safetyQ5 === 'No' ? faker.lorem.sentence() : '';
        const satisfactionQ1 = faker.lorem.sentence();

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });



        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Members → Member Detail → Forms
        //--------------------------------
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Search...' }),
            `${member.lastName}, ${member.firstName}`,
        );

        await clickAndWait(
            page,
            page.locator('#lookup-search-button:visible'),
        );

        await page
            .getByRole('gridcell', {
                name: `${member.lastName}, ${member.firstName}`,
            })
            .dblclick();

        await waitUntilLoaded(page);

        await clickAndWait(
            page,
            page
                .getByRole('menuitem', { name: 'Member Detail' })
                .locator('span')
                .nth(1),
        );

        await clickAndWait(
            page,
            page.locator('#shortcuts').getByText('Forms'),
        );

        //--------------------------------
        // Cleanup existing forms by loginID
        //--------------------------------
        try {
            await fillAndWait(
                page,
                page
                    .locator('#forms-anchor')
                    .getByRole('textbox', { name: 'Search...' }),
                loginID,
            );

            await clickAndWait(page, page.locator('#forms-anchor a'));

            const rows = page.locator(
                '#forms-child-grid table tbody tr:has-text("' + loginID + '")',
            );

            for (let i = (await rows.count()) - 1; i >= 0; i--) {
                await rows.nth(i).hover();
                await clickAndWait(
                    page,
                    rows.nth(i).locator('[title="Delete"]'),
                );
                await clickAndWait(
                    page,
                    page.getByRole('button', { name: 'Yes' }),
                );
                await waitUntilLoaded(page);
            }
        } catch {
            // no rows to clean up
        }

        //--------------------------------
        // Act: Add Form
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Form' }),
        );

        await fillAndWait(
            page,
            page.getByRole('dialog', { name: 'Choose Form' })
                .getByPlaceholder('Search...'),
            form,
        );

        await clickAndWait(
            page,
            page
                .getByRole('dialog', { name: 'Choose Form' })
                .locator('#lookup-search-button'),
        );

        await clickAndWait(
            page,
            page.getByRole('gridcell', { name: form }),
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Select', exact: true }),
        );

        await waitUntilLoaded(page);

        //--------------------------------
        // Fill Form
        //--------------------------------
        const startDateField = page.locator('[placeholder="mm/dd/yyyy"]').first();
        await clickAndWait(page, startDateField);
        await startDateField.clear();
        await startDateField.pressSequentially(startDate);

        await clickAndWait(
            page,
            page.locator(`[name*="custom_11"][value="${medicationsQ1}"]`),
        );

        await clickAndWait(
            page,
            page.locator(`[name*="custom_12"][value="${medicationsQ2}"]`),
        );

        if (medicationsQ2 === 'No') {
            await fillAndWait(page, page.locator('#custom_13'), medicationsQ3);
        }

        for (const diag of clinicalQ1) {
            await clickAndWait(
                page,
                page.locator(`[name*="custom_14"][value="${diag}"]`),
            );
        }

        await clickAndWait(
            page,
            page.locator(`[name*="custom_15"][value="${clinicalQ2}"]`),
        );

        if (clinicalQ2 === 'Yes') {
            await fillAndWait(page, page.locator('#custom_16'), clinicalQ3);
            for (const diag of clinicalQ4) {
                await clickAndWait(
                    page,
                    page.locator(`[name*="custom_17"][value="${diag}"]`),
                );
            }
        }

        await clickAndWait(
            page,
            page.locator(`[name*="custom_18"][value="${safetyQ1}"]`),
        );

        if (safetyQ1 === 'Yes') {
            await fillAndWait(page, page.getByRole('spinbutton'), safetyQ2);
        }

        await clickAndWait(
            page,
            page.locator(`[name*="custom_20"][value="${safetyQ3}"]`),
        );

        await fillAndWait(page, page.locator('[name*="custom_23"]'), safetyQ4);

        await clickAndWait(
            page,
            page.locator(`[name*="custom_24"][value="${safetyQ5}"]`),
        );

        if (safetyQ5 === 'No') {
            await fillAndWait(page, page.locator('#custom_25'), safetyQ6);
        }

        await fillAndWait(page, page.locator('#custom_21'), satisfactionQ1);

        //--------------------------------
        // Save Form
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        const formId = await page.getByText('General Form #').innerText();

        //--------------------------------
        // Switch to In Progress → Edit → Save
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));

        const formRow = page.locator(
            '#forms-child-grid table tbody tr:has-text("' + loginID + '")',
        );

        await formRow.dblclick();

        await clickAndWait(
            page,
            page.getByRole('button', { name: ' Switch to In Progress' }),
        );

        await clickAndWait(
            page,
            page
                .getByLabel('General Form #')
                .getByRole('button', { name: ' Edit' }),
        );

        await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        //--------------------------------
        // Delete Form
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Close' }));
        await formRow.hover();
        await clickAndWait(page, formRow.locator('[title="Delete"]'));
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        await expect(formRow).not.toBeVisible();
    },
);