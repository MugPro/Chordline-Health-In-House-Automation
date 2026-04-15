import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanUpMedications,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Pause helpers
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 1500;

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

test('Reconcile a Medication', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `ReconcileAMedication`;
    const userFirstAndLastName = `Reconcile AMedication`;
    const memberIdentifier = `QAW1766505025398`;
    const reconciliation = `QA Wolf Reconciliation`;
    const medication = `0.9% SODIUM CHLORIDE 900 mg/100mL INJECTION, SOLUTION`;
    const frequency = `AC`;
    const dose = `40`;
    const comment = `QA Wolf Comment`;

    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(
        today.getDate(),
    ).padStart(2, '0')}/${today.getFullYear()}`;

    //--------------------------------
    // Login & Cleanup
    //--------------------------------
    const { page } = await logIn({
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    await cleanUpMedications(page, userFirstAndLastName, memberIdentifier);

    //--------------------------------
    // ACT: Navigate to Member
    //--------------------------------
    await clickAndWait(
        page,
        page.locator('#home-tabs-tab-4').getByText('Members'),
    );

    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Search...' }),
        memberIdentifier,
    );

    await clickAndWait(
        page,
        page.locator('#lookup-search-button:visible'),
    );

    await page
        .getByRole('gridcell', { name: memberIdentifier })
        .dblclick();

    await waitUntilLoaded(page);

    //--------------------------------
    // ACT: Medication Reconciliation
    //--------------------------------
    await clickAndWait(
        page,
        page.locator('[data-module="medications-menu"][role="menuitem"]'),
    );

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Reconciliation' }),
    );

    await page.keyboard.type(reconciliation);
    await pause(page);

    //--------------------------------
    // ADD MEDICATION
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Medication' }),
    );

    await clickAndWait(
        page,
        page.locator('[data-table-code="MEDS"] [type="button"]'),
    );






    await waitUntilLoaded(page);

    /*
    await fillAndWait(
        page,
        page.locator('input[name="pmed_medication_id_input"]'),
        medication,
    );

    await clickAndWait(
        page,
        page.getByText(medication),
    );

     */



    await fillAndWait(
        page,
        page.locator('input[name="pmed_medication_id_input"]'),
        medication,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: medication, exact: true }),
    );










    //--------------------------------
    // Status
    //--------------------------------






    await clickAndWait(
        page,
        page.getByRole('button', { name: 'select' }).nth(1)
    );

    await clickAndWait(
        page,
        page.getByRole('option', { name: 'Taking', exact: true }),
    );










    //--------------------------------
    // Frequency
    //--------------------------------




    await fillAndWait(
        page,
        page.locator('input[name="pmed_frequency_id_input"]'),
        frequency,
    );
    await clickAndWait(
        page,
        page.getByRole('option', { name: frequency, exact: true }),
    );








    //--------------------------------
    // Dose
    //--------------------------------
    await clickAndWait(
        page,
        page.locator('#pmed_dose'),
    );

    await page.keyboard.type(dose);
    await pause(page);

    //--------------------------------
    // SAVE MEDICATION
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    await waitUntilLoaded(page);

    //--------------------------------
    // RECONCILE
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('gridcell', { name: 'Reconcile' }).first(),
    );







    await page.keyboard.type(comment);
    await pause(page);

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save' }),
    );

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert that the reconciled medication is correct and visible on the page
    await expect(
        page.getByRole("gridcell", { name: medication }).first(),
    ).toBeVisible();

    // Assert that the Dose value '40' is visible and correct on the page
    await expect(
        page.getByRole("gridcell", { name: dose, exact: true }).first(),
    ).toBeVisible();

    // Assert that the Frequency value 'AC' is visible and correct on the page
    await expect(
        page.getByRole("gridcell", { name: frequency, exact: true }).first(),
    ).toBeVisible();

    // Assert that the Reviewer value `Reconcile AMedication' is visible and correct on the page
    /*
    await expect(
        page.getByRole("gridcell", { name: userFirstAndLastName, exact: true }),
    ).toBeVisible();

     */

    //--------------------------------
    // CLEANUP
    //--------------------------------


    await waitUntilLoaded(page);

        // --------------------------------
        // Delete all rows for this reviewer
        // --------------------------------
        const reviewerCells = page.getByRole('gridcell', {
            name: userFirstAndLastName,
            exact: true,
        });

        // ✅ Delete UNTIL no matching rows remain
        while (await reviewerCells.count() > 0) {
            const cell = reviewerCells.first();

            await waitUntilLoaded(page);

            // Find the row containing this cell
            const row = cell.locator('xpath=ancestor::tr[1]');

            // Ensure visibility (critical in headed mode)
            await row.scrollIntoViewIfNeeded();

            await waitUntilLoaded(page);

            // Select row
            await row.click();

            await waitUntilLoaded(page);

            // Click delete button IN THIS ROW
            await row
                .locator('[title="Delete"], button:has-text("")')
                .first()
                .click();

            await waitUntilLoaded(page);

            // Confirm delete
            await page.getByRole('button', { name: 'Yes' }).click();

            await waitUntilLoaded(page);
        }

        // --------------------------------
        // Close member card (if open)
        // --------------------------------
        const closeBtn = page.locator('.k-icon.k-font-icon.k-i-close').first();
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        }

});