import { test, expect } from '@playwright/test';
import { format, subDays } from 'date-fns';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test(
    'Clicking Immunization plus icon button adds immunization section and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `DetailsImmunization`;

        const member = {
            name: `Jones, Mark`,
            insuranceCompany: 'Wonderful Health Plan',
            identifier: 'A9876541',
            plan: 'PLAN A',
            startDate: '09/11/2024',
        };

        const tab = 'Member Detail';

        const yesterday = subDays(new Date(), 1);
        const vaccination = {
            name: 'Hepatitis A (HepA)',
            date: format(yesterday, 'MM/dd/yyyy'),
            dateFormatted: format(yesterday, 'EEEE, MMMM dd, yyyy'),
        };

        // Sign in
        //const { page } = await logIn({ loginID, slowMo: 800 });


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url, slowMo: 800 });




        await waitUntilLoaded(page);

        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        // Search member
        await page.getByRole('textbox', { name: 'Search...' }).fill(member.name);
        await page.keyboard.press('Enter');

        // Open member
        await page.getByRole('gridcell', { name: member.plan }).dblclick();
        //await waitUntilLoaded(page);

        // Navigate to tab on members page
        await page
            .getByLabel(member.name)
            .getByText(tab, { exact: true })
            .first()
            .click();

        // Selectors
        const addedRow = `.formCollection:has-text("Vaccination")`;
        const rowSelector = page.locator(`${addedRow}`);
        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', { name: ' Save and Close' });
        const addImmunizationButton = page.getByRole('button', {
            name: '  Immunization', // NBSP between icon and label
        });

        // Ensure page controls are ready
        await addImmunizationButton.waitFor();

        // Cleanup previously created immunization if present
        try {
            await rowSelector.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await page.getByRole('button', { name: ' Edit' }).click();
            await page.locator(`${addedRow} [title="Delete"]`).click();
            await rowSelector.waitFor({ state: 'hidden' });
            await saveButton.click();
            await page.getByText('New Work Log').waitFor();
            await saveAndCloseButton.click();
            await saveButton.waitFor({ state: 'hidden' });
            await rowSelector.waitFor({ state: 'hidden' });
        }

        //--------------------------------
        // Act: ADD Immunization
        //--------------------------------
        await addImmunizationButton.click();

        // Ensure new row fields are present
        await page
            .locator(`${addedRow} [class="label required"]:has-text("Vaccination Name:")`)
            .waitFor();
        await page.locator(`${addedRow} :text("Vaccination Date:")`).waitFor();

        // Ensure button and delete icon are visible
        await addImmunizationButton.waitFor();
        await page.locator(`${addedRow} [title="Delete"]`).waitFor();

        // Try to save without required fields to verify validation
        await saveButton.click();

        await page
            .locator(`#notificationWindow :text("Please fill in all required fields.")`)
            .waitFor();
        await page.locator(`#notificationWindow :text("Vaccination Name")`).waitFor();

        // Dismiss validation and return to edit
        await page.getByRole('button', { name: 'Okay' }).click();
        await saveButton.waitFor();

        //await waitUntilLoaded(page);

        // Fill vaccination name and select option
        await page.locator(`input[name="pvac_vaccine_id__1_input"]`).fill(vaccination.name);
        await page.getByRole('option', { name: vaccination.name }).click();

        // Fill vaccination date (yesterday)
        await rowSelector.getByLabel('select').click();
        await page.getByTitle(`${vaccination.dateFormatted}`).click();

        // Save and close
        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(saveButton).not.toBeVisible();

        await expect(
            page.locator(`${addedRow} :text("${vaccination.name}")`)
        ).toBeVisible();

        await expect(
            page.locator(`${addedRow} :text("${vaccination.date}")`)
        ).toBeVisible();

        await expect(addImmunizationButton).toBeEnabled();

        //--------------------------------
        // Arrange: prepare to DELETE
        //--------------------------------
        await page.getByRole('button', { name: ' Edit' }).click();

        //--------------------------------
        // Act: DELETE Immunization
        //--------------------------------
        await page.locator(`${addedRow} [title="Delete"]`).click();
        await rowSelector.waitFor({ state: 'hidden' });
        await addImmunizationButton.waitFor(); // still visible

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(rowSelector).not.toBeVisible();
        await expect(addImmunizationButton).toBeEnabled();
    },
);
