import { test, expect } from '@playwright/test';
import { format, addDays } from 'date-fns';

import {
        logIn,
        cleanUpDisabilities, waitUntilLoaded, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test(
    'Clicking Disability plus icon adds disability section and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemberDisability`;
        const memberName = `Abbott, QAWBrenda`;

        const today = new Date();
        const fullDate = format(today, 'MM/dd/yyyy');

        const disabilityType = `Behavioral, Mental Health`;

        const tomorrow = addDays(today, 1);
        const formattedTomorrowNumbers = format(tomorrow, 'MM/dd/yyyy');
        const formattedTodayCalendar = format(today, 'eeee, MMMM dd, yyyy');

        // Log in
        //const { page } = await logIn({ loginID });

            const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
            const url = env.DEFAULT_URL;





            // Sign in to the app
            const { page, context, browser } = await logIn3({ loginID, password,
                    url });




        // Navigate to Members
        await page
            .locator('#home-tabs-tab-4')
            .getByText('Members')
            .click();

        // Search member
        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(memberName);

        await page
            .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
            .click();

       // await waitUntilLoaded(page);

        // Open member
        await page
            .getByRole('gridcell', { name: memberName })
            .dblclick();

        await waitUntilLoaded(page);

        // Open Disability tab
        await page.locator('#shortcuts').getByText('Disability').click();

        //await waitUntilLoaded(page);

        // Cleanup existing disabilities
        await cleanUpDisabilities(page, { memberName });

        //--------------------------------
        // Act: ADD Disability
        //--------------------------------
        await page
            .getByRole('button', { name: '  Disability' })
            .click();

        await page.getByText('Disability Type:').waitFor();

        await waitUntilLoaded(page);

        // Select Disability Type
        await page
            .locator('#record-div div')
            .filter({ hasText: 'Disability Disability *' })
            .getByLabel('expand combobox')
            .click();

        await page.getByText(disabilityType).click();

        // Start date calendar
        await page
            .locator('.collectionField [aria-label="select"]')
            .first()
            .click();

        await page
            .locator(`[role="grid"] [title="${formattedTodayCalendar}"]`)
            .click();

        // End date calendar (tomorrow via Enter key)
        await page
            .locator('.collectionField [aria-label="select"]')
            .last()
            .click();

        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Save
        await page.getByRole('button', { name: ' Save' }).click();
        await page.getByText('New Work Log').waitFor();
        await page.getByRole('button', { name: ' Save and Close' }).click();

        await waitUntilLoaded(page);

        // Re-open Disability tab
        await page.locator('#shortcuts').getByText('Disability').click();

       // await waitUntilLoaded(page);

        const entrySelector = page.locator(
            '.formSection:has-text("Disability") .formSectionContent',
        );

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(
            entrySelector.getByText(disabilityType),
        ).toBeVisible();

        await expect(
            entrySelector.getByText(fullDate, { exact: true }).last(),
        ).toBeVisible();

        //--------------------------------
        // Act: DELETE Disability
        //--------------------------------
        await page
            .getByRole('button', { name: ' Edit' })
            .click();

        await waitUntilLoaded(page);

        await page.locator('#shortcuts').getByText('Disability').click();

        //await waitUntilLoaded(page);

        await page
            .locator(
                'div[class*="formCollection"]:has-text("Disability Type:") button[title="Delete"]',
            )
            .click();

        //await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Save' }).click();
        await page.getByText('New Work Log').waitFor();
        await page.getByRole('button', { name: ' Save and Close' }).click();

        //await waitUntilLoaded(page);

        await page.locator('#shortcuts').getByText('Disability').click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(
            entrySelector.getByText(disabilityType),
        ).not.toBeVisible();

        await expect(
            entrySelector.getByText(fullDate, { exact: true }),
        ).not.toBeVisible();

        await expect(
            entrySelector.getByText(formattedTomorrowNumbers, { exact: true }),
        ).not.toBeVisible();
    },
);
