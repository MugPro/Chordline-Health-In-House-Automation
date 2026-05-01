/*
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js'; // correct relative path
import { env } from '../../../../environments/staging.env.js';
import { format } from 'date-fns';

test('Able to generate an Invoice Report', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `RepInvRep`;
    const insuranceCompany = `Excellent Health Plan`;
    const date1 = new Date('2025-08-01');
    const date2 = new Date('2025-08-14');
    const startDate = format(date1, 'MM/dd/yyyy'); // Correct format for input
    const endDate = format(date2, 'MM/dd/yyyy');
    const serviceDates = `${startDate} - ${endDate}`;

    // Sign in using the helpers.logIn with an object argument

    const { page } = await helpers.logIn({ loginID });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText('Reports', { exact: true }).click();
    await page.getByLabel('Reports').getByTitle('Invoice Report').click();

    // Select insurance company
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: insuranceCompany }).locator('span').click();

    // Select 'Yes' for detailed report
    await page.getByText('No', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Yes' }).click();

    // Fill in start & end dates
    await page.locator('[placeholder="mm/dd/yyyy"]').first().fill(startDate);
    await page.locator('[placeholder="mm/dd/yyyy"]').nth(1).fill(endDate);

    // Submit
    await page.getByRole('button', { name: ' Submit' }).click();
    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.locator('#reportTitle').getByText('Invoice Report')).toBeVisible();
    await expect(page.getByText(serviceDates)).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();
    await expect(page.getByText('$0.00').nth(1)).toBeVisible();
    await expect(page.getByLabel('Reports').getByText(`${loginID} Qaw`)).toBeVisible();
});


 */







import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';
import { format } from 'date-fns';
import {logIn3} from "../../../../helpers/Node20Helpers.js";

test('Able to generate an Invoice Report', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'RepInvRep';
    //const insuranceCompany = 'Excellent Health Plan';
    const insuranceCompany = 'company description';

    const date1 = new Date('2025-08-01');
    const date2 = new Date('2025-08-14');

    const startDate = format(date1, 'MM/dd/yyyy');
    const endDate = format(date2, 'MM/dd/yyyy');
    const serviceDates = `${startDate} - ${endDate}`;

    const startDigits = format(date1, 'MMddyyyy');
    const endDigits = format(date2, 'MMddyyyy');

    //const { page } = await helpers.logIn({ loginID, slowMo: 400 });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url, slowMo: 400 });




    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText('Reports', { exact: true }).click();
    await page.getByLabel('Reports').getByTitle('Invoice Report').click();

    // Select insurance company
    /*
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: insuranceCompany }).locator('span').click();

     */



     await page.getByRole('combobox').first().click();
  await page.getByRole('combobox').first().fill('company description');
  await page.getByRole('combobox').first().press('Enter');


    // Select 'Yes' for detailed report
    await page.getByText('No', { exact: true }).first().click();
    await page.getByRole('option', { name: 'Yes' }).click();

    // Fill in start & end dates (masked input: digits only)
    const startInput = page.locator('[placeholder="mm/dd/yyyy"]').first();
    const endInput = page.locator('[placeholder="mm/dd/yyyy"]').nth(1);

    await startInput.click();
    await startInput.press('Control+A');
    await startInput.type(startDigits, { delay: 80 });

    await endInput.click();
    await endInput.press('Control+A');
    await endInput.type(endDigits, { delay: 80 });
    await endInput.press('Tab'); // force validation

    // Optional safety check — catches mask failures early
    await expect(startInput).toHaveValue(startDate);
    await expect(endInput).toHaveValue(endDate);

    // Submit
    await page.getByRole('button', { name: ' Submit' }).click();
    //await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    await expect(page.locator('#reportTitle').getByText('Invoice Report')).toBeVisible();
    await expect(page.getByText(serviceDates)).toBeVisible();
    await expect(page.getByText('$0.00').first()).toBeVisible();
    await expect(page.getByText('$0.00').nth(1)).toBeVisible();
    await expect(
        page.getByLabel('Reports').getByText(`${loginID} Qaw`)
    ).toBeVisible();
});
