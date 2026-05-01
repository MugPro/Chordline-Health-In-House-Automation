import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Pause helpers
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 1000;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator) => {
    await locator.click();
    await pause(page);
};

const fillAndWait = async (page, locator, value) => {
    await locator.fill(value);
    await pause(page);
};

test('Add, Update, and Delete Medication', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `MemberMedication`;
    const member = {
        firstName: `QAWAdriel`,
        lastName: `Bernhard`,
        lastFirst: `Bernhard, QAWAdriel`,
    };

    const medication = {};

    const inputType = faker.helpers.arrayElement([
        'Case Manager',
        'Medication Load',
    ]);

    const medInfo = [
        'packageCode',
        'productCode',
        'brandName',
        'genericName',
        'route',
        'strength',
        'dosageForm',
        'pharmacyClass',
        'deaSchedule',
    ];

    const route = faker.helpers.arrayElement([
        'Extracorporeal',
        'Infiltration',
        'Inhaler',
        'Intra-Arterial',
        'Intra-Articular',
        'Intrabronchial',
        'Intracardiac',
        'Intracaudal',
        'Intracavernous',
        'Intracavitary',
        'Intradermal',
        'Intragastric',
    ]);

    const frequency = faker.helpers.arrayElement([
        "AC",
        "BID",
        "PC",
        "PRN",
        "Q1H",
        "Q2H",
        "Q3H",
        "Q4H",
        "Q5H",
    ]);

    const status1 = faker.helpers.arrayElement([
        'Taking',
        'Not Taking',
        'Not Taking as Indicated',
    ]);

    //--------------------------------
    // Login & Navigate
    //--------------------------------
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    await clickAndWait(
        page,
        page.locator('#home-tabs-tab-4').getByText('Members'),
    );

    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Search...' }),
        member.lastFirst,
    );

    await clickAndWait(
        page,
        page.locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button'),
    );

    await page.getByRole('gridcell', { name: member.lastFirst }).dblclick();
    await waitUntilLoaded(page);

    await clickAndWait(page, page.locator('#medications-menu'));
    await waitUntilLoaded(page);

    //--------------------------------
    // Cleanup existing medications
    //--------------------------------
    const medsRows = page.locator('#medications-grid table tbody tr');

    while (await medsRows.count() > 0) {
        const row = medsRows.first();
        await row.click();
        await clickAndWait(page, row.locator('[title="Delete"]'));
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
        await waitUntilLoaded(page);
    }

    //--------------------------------
    // CREATE MEDICATION
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Medication' }),
    );
    await waitUntilLoaded(page);









    await page.locator('span').filter({ hasText: 'Case Manager 1' }).getByLabel('expand combobox').click();


    await fillAndWait(
        page,
        page.locator('input[name="pmed_input_type_input"]'),
        inputType,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: inputType, exact: true }),
    );







    const idx = faker.number.int({ min: 0, max: 49 });

    await clickAndWait(
        page,
        page.locator('[data-bind*="pmed_medication_id"] [title="Lookup"]'),
    );

    await clickAndWait(
        page,
        page.locator(`#lookup-div-MEDS table tbody tr`).nth(idx),
    );

    for (let i = 0; i < medInfo.length; i++) {
        medication[medInfo[i]] = await page
            .locator(`#lookup-div-MEDS table tbody tr >> nth=${idx} >> td >> nth=${i + 1}`)
            .innerText();
    }

    await clickAndWait(page, page.getByRole('button', { name: 'Select', exact: true }));

    medication.pageName = await page.locator('#pmed_medication_id').innerText();

    await fillAndWait(
        page,
        page.locator('#pmed_dose'),
        `${medication.strength} mg ${medication.dosageForm}`,
    );








    //await page.locator('span').filter({ hasText: 'Case Manager 1' }).getByLabel('expand combobox').click();


    await fillAndWait(
        page,
        page.locator('input[name="pmed_frequency_id_input"]'),
        frequency,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: frequency, exact: true }),
    );











/*
    await fillAndWait(
        page,
        page.locator('input[name="pmed_medication_route_id_input"]'),
        route,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: route, exact: true }),
    );


 */





    await page.getByRole('button', { name: '...' }).nth(2).click();

    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: route }).click();

    await waitUntilLoaded(page);

    await page.getByRole('button', { name: 'Select', exact: true }).click();

    await waitUntilLoaded(page);








/*

    await fillAndWait(
        page,
        page.locator('input[name="pmed_medication_route_id_input"]'),
        status1,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: status1, exact: true }),
    );

 */





    await page
        .getByRole(`combobox`)
        .filter({ hasText: `TakingNot TakingNot Taking as` })
        .locator(`span`)
        .nth(1)
        .click();
    await page
        .getByRole(`option`, { name: status1, exact: true })
        .locator(`span`)
        .click();











    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await waitUntilLoaded(page);

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    //--------------------------------
    // ASSERT: CREATE
    //--------------------------------
    await expect(page.locator('#pmed_input_type')).toHaveText(inputType);
    await expect(page.locator('#pmed_medication_id')).toHaveText(medication.pageName);
    await expect(page.locator('#pmed_frequency_id')).toHaveText(frequency);
    await expect(page.locator('#pmed_medication_route_id')).toHaveText(route);
    await expect(page.locator('#pmed_status_code')).toHaveText(status1);

    //--------------------------------
    // UPDATE MEDICATION
    //--------------------------------
    const routeEdit = faker.helpers.arrayElement([
        'Auricular (Otic)',
        'Buccal',
        'Conjunctival',
        'Cutaneous',
        'Dental',
        'Endotracheal',
        'Enteral',
        'Epidural',
    ]);

    const frequencyEdit = faker.helpers.arrayElement([
        "QD",
        "QHS",
        "QID",
        "QMONTH",
        "QOD",
        "QWEEK",
        "TID",
    ]);
    const status1Edit = faker.helpers.arrayElement([
        'Taking',
        'Not Taking',
        'Not Taking as Indicated',
    ]);







    await page.getByRole('button', { name: ' All Medications' }).click();

    await waitUntilLoaded(page);



    await page.getByRole('gridcell', { name: medication.pageName }).dblclick();

    await waitUntilLoaded(page);

    await clickAndWait(page, page.getByRole('button', { name: ' Edit' }));

    await waitUntilLoaded(page);

    medication.strength = `${Number(medication.strength) * 2}`;

    await fillAndWait(
        page,
        page.locator('#pmed_dose'),
        `${medication.strength} mg ${medication.dosageForm}`,
    );










    await fillAndWait(
        page,
        page.locator('input[name="pmed_frequency_id_input"]'),
        frequencyEdit,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: frequencyEdit, exact: true }),
    );
















    await page.getByRole('button', { name: '...' }).nth(1).click();

    await waitUntilLoaded(page);

    await page.getByRole('textbox', { name: 'Search...' }).click();
    await page.getByRole('textbox', { name: 'Search...' }).fill(routeEdit);

    //await waitUntilLoaded(page);

    await page.locator('.quick-search-medium.right > .k-input > .k-input-suffix > #lookup-search-button').click();

    await waitUntilLoaded(page);

    await page.getByRole('gridcell', { name: routeEdit, exact: true }).click();

    await waitUntilLoaded(page);

    await page.getByRole('button', { name: 'Select', exact: true }).click();

    await waitUntilLoaded(page);



















    //await page.locator('span').filter({ hasText: '59 ...' }).getByLabel('expand combobox').click();









    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await waitUntilLoaded(page);

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );





        //--------------------------------
    // ASSERT: UPDATE
    //--------------------------------
    await expect(page.locator('#pmed_medication_route_id')).toHaveText(routeEdit);
    await expect(page.locator('#pmed_frequency_id')).toHaveText(frequencyEdit);





    await page.getByRole('button', { name: ' All Medications' }).click();


    await waitUntilLoaded(page);





    //--------------------------------
    // DELETE MEDICATION
    //--------------------------------
    await clickAndWait(
        page,
        page.locator(`#medications-grid table tbody tr:has-text("${medication.pageName}")`),
    );

    await clickAndWait(
        page,
        page.locator(
            `#medications-grid table tbody tr:has-text("${medication.pageName}") [title="Delete"]`,
        ),
    );

    await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
    await waitUntilLoaded(page);

    //--------------------------------
    // ASSERT: DELETE
    //--------------------------------
    await expect(
        page.locator(
            `#medications-grid table tbody tr:has-text("${medication.pageName}")`,
        ),
    ).not.toBeVisible();
});