// File: tests/SearchForCarePlan.test.js
// Purpose: Search for a specific Care Plan ("QA Wolf assessment") in the Care Plan Library,
//          open it, and verify expected UI elements/values are present.

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

test.describe('Care Plan Library - Search & Verify Care Plan', () => {
    test('Search for "QA Wolf assessment" and validate details', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        // Static constants (per instructions)
        //const assessmentName = 'QA Wolf assessment'; // static; no cleanup required

        const assessmentName = 'Demo Care Plan';

        const loginID = 'SearchCare';

        // Sign in
        const { page, context, browser } = await logIn({ loginID });

        //--------------------------------
        // Act:
        //--------------------------------
        // Click "Tools"
        await page.getByText('Tools').click();

        // Click "Assessments"
        await page.locator('#menu-tools').getByText('Assessments').click();

        // Click "Care Plan Library"
        await page.getByText('Care Plan Library').click();

        // Fill the "Manage Assessments" search input
        await page
            .getByRole('dialog', { name: 'Manage Assessments' })
            .getByPlaceholder('Search...')
            .fill(assessmentName);

        // Click Search button
        await page.locator('#admin-search-button').click();
        await waitUntilLoaded(page);

        // Click the "QA Wolf assessment" gridcell
        await page.getByRole('gridcell', { name: assessmentName }).click();

        // Click the "" button (assumed to open/expand details)
        await page.getByRole('button', { name: '' }).click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert:
        //--------------------------------
        // Assessment name is visible somewhere on the page
        await expect(page.locator(`:text("${assessmentName}")`)).toBeVisible();


        // Assert Problems contains `Language barriers`
        await expect(page.getByText(`Language barriers.`)).toHaveText(
            `Language barriers.`,
        );

// Assert Creation input field contains "Always Ask User"
        await expect(page.getByText(`Always Ask User`).first()).toHaveText(
            `Always Ask User`,
        );





        /*

        // Problems contains "Abnormal blood lipids."
        await expect(page.getByText('Abnormal blood lipids.')).toHaveText(
            'Abnormal blood lipids.',
        );

        // Creation input field contains "Always Ask User"
        await expect(page.getByText('Always Ask User').first()).toHaveText(
            'Always Ask User',
        );

         */

        // Close resources
        await context.close();
        await browser.close();
    });
});