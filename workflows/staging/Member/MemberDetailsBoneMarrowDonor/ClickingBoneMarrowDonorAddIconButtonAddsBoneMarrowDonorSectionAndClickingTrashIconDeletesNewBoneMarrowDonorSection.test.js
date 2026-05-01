import { test, expect } from '@playwright/test';
import { format } from 'date-fns';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers
------------------------------------------- */
const pause = (page, ms = 400) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = 400) => {
    await locator.click();
    await pause(page, ms);
};

test(
    'Clicking Bone Marrow Donor add icon adds section and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `AddDeleteBoneMarrowDonor`;

        const member = {
            firstName: 'QAWCordelia',
            lastName: 'Lockman',
            identifier: 'QAW1758119442468',
        };
        member.fullName = `${member.lastName}, ${member.firstName}`;

        const enteredData = {
            donorStatus: 'Not a Bone Marrow Donor',
            transplantStatus: 'Bone Marrow Transplant Recipient',
            date1: format(
                new Date(Date.now() - 24 * 60 * 60 * 1000),
                'MM/dd/yyyy',
            ),
            date2: format(
                new Date(Date.now() - 24 * 60 * 60 * 1000),
                'eeee, MMMM dd, yyyy',
            ),
        };

        //const { page } = await logIn({ loginID });

        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });





        // Navigate Home > Members
        await clickAndWait(page, page.getByText('Home', { exact: true }));
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        // Search member
        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member.fullName);
        await page.keyboard.press('Enter');

        await waitUntilLoaded(page);

        // Open member
        await page
            .getByRole('gridcell', { name: member.fullName })
            .dblclick();
        await waitUntilLoaded(page);

        // Selectors
        const boneMarrowSection = page.locator(
            '.formCollection:has-text("Bone Marrow Donor Status:")',
        );

        const addBoneMarrowButton = page.getByRole('button', {
            name: '  Bone Marrow Donor',
        });

        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });

        //--------------------------------
        // Cleanup any existing donor section
        //--------------------------------
        try {
            await boneMarrowSection.waitFor({
                state: 'hidden',
                timeout: 3000,
            });
        } catch {
            await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));

            await waitUntilLoaded(page);

            await page
                .locator(
                    '.formCollection:has-text("Bone Marrow Donor") >> nth=0 >> button >> nth=-1',
                )
                .click();

            await boneMarrowSection.waitFor({ state: 'hidden' });

            await waitUntilLoaded(page);

            await saveButton.click();
            await waitUntilLoaded(page);
            await saveAndCloseButton.click();

            await boneMarrowSection.waitFor({ state: 'hidden' });
            await page.waitForTimeout(3000);
        }

        //--------------------------------
        // Act: ADD Bone Marrow Donor
        //--------------------------------
        await addBoneMarrowButton.click();

        await waitUntilLoaded(page);

        // Donor Status
        await page
            .locator(
                '[class*="input-button"]:right-of(:text("Bone Marrow Donor Status:")) >> nth=0',
            )
            .click();
        await page
            .getByRole('option', { name: enteredData.donorStatus })
            .click();

        // Transplant Status
        await page
            .locator(
                '[class*="input-button"]:right-of(:text("Bone Marrow Transplant Status:")) >> nth=0',
            )
            .click();
        await page
            .getByRole('option', { name: enteredData.transplantStatus })
            .click();

        // Transplant Date
        await page
            .locator('#record-div div')
            .filter({ hasText: 'Health Status * Advanced' })
            .getByLabel('select')
            .click();

        await page
            .locator(`[title="${enteredData.date2}"]`)
            .click({ timeout: 5000 });

        await waitUntilLoaded(page);

        // Save
        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(boneMarrowSection).toBeVisible();

        await expect(
            boneMarrowSection.getByText(enteredData.donorStatus),
        ).toBeVisible();

        await expect(
            boneMarrowSection.getByText(enteredData.transplantStatus),
        ).toBeVisible();

        await expect(
            boneMarrowSection.getByText(enteredData.date1),
        ).toBeVisible();

        await expect(addBoneMarrowButton).toBeEnabled();

        //--------------------------------
        // Arrange: DELETE
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
        await saveButton.waitFor();

        //--------------------------------
        // Act: DELETE Bone Marrow Donor
        //--------------------------------
        await page
            .locator(
                '.formCollection:has-text("Bone Marrow Donor") >> nth=0 >> button >> nth=-1',
            )
            .click();

        await boneMarrowSection.waitFor({ state: 'hidden' });

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(boneMarrowSection).not.toBeVisible();
        await expect(addBoneMarrowButton).toBeEnabled();
    },
);