import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
    cleanUpOrganDonor,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers
------------------------------------------- */
const pause = (page, ms = 0) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = 0) => {
    await locator.click();
    await pause(page, ms);
};

test(
    'Clicking Add Organ Donor icon adds organ donor section and clicking trash icon deletes new organ donor section',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemberDonor`;
        const memberName = `Abbott, QAWBrenda`;

        const { page } = await logIn({ loginID });

        // Navigate Home > Members
        await clickAndWait(page, page.getByText('Home', { exact: true }));
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        // Search member
        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(memberName);

        await page
            .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
            .click();

        // Open member
        await page
            .getByRole('gridcell', { name: memberName })
            .dblclick();

        await waitUntilLoaded(page);

        //--------------------------------
        // Cleanup existing organ donor if present
        //--------------------------------
        await cleanUpOrganDonor(page, { memberName });

        //--------------------------------
        // Selectors
        //--------------------------------
        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });

        const addOrganDonorButton = page.getByRole('button', {
            name: ' Organ Donor',
        });

        const organDonorStatusField = page.locator(
            '#porg_organ_donor_status_id__1',
        );

        //--------------------------------
        // Act: ADD Organ Donor
        //--------------------------------
        await addOrganDonorButton.click();

        await waitUntilLoaded(page);

        try {
            await page.locator('[data-table-code="RODS"] button').first().click();
            await page
                .getByRole('option', { name: 'Organ Donor', exact: true })
                .locator('span')
                .click();
        } catch {
            await page.locator('[data-table-code="RODS"] button').first().click();
            await page
                .getByRole('option', { name: 'Organ Donor', exact: true })
                .locator('span')
                .click();
        }


        await waitUntilLoaded(page);

        // Type of Organ Transplant
        await page.locator('[data-table-code="ROTT"] button').first().click();
        await page
            .locator('#porg_organ_transplant_type_id__1-autocomplete_listbox')
            .getByText('Cornea')
            .click();

        // Organ Transplant Status
        await page.locator('[data-table-code="ROTS"] button').first().click();
        await page
            .locator('#porg_organ_transplant_status_id__1-autocomplete_listbox')
            .getByText('Organ Transplant Donor')
            .click();

        await waitUntilLoaded(page);

        // Save
        await saveButton.click();
        await page.getByText('New Work Log').waitFor();

        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(page.getByText('Cornea')).toBeVisible();
        await expect(organDonorStatusField).toBeVisible();
        await expect(page.getByText('Organ Transplant Donor')).toBeVisible();

        //--------------------------------
        // Arrange: DELETE
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: ' Edit' }));

        // Navigate to Health Status section
        await page.locator('[data-value="healthstatus-anchor"]').click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Act: DELETE Organ Donor
        //--------------------------------
        await page
            .locator(
                'div[class*="formCollection"]:has-text("Organ Donor Status:") button[title="Delete"]',
            )
            .click();

        await waitUntilLoaded(page);

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();

        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(organDonorStatusField).not.toBeVisible();
        await expect(
            page.getByText('Organ Transplant Donor'),
        ).not.toBeVisible();

        // Sanity check unrelated data still visible
        await expect(page.getByText('HIV', { exact: true })).toBeVisible();
    },
);