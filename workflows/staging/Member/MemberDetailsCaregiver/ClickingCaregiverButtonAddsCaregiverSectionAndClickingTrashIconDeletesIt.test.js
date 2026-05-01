import { test, expect } from '@playwright/test';

import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers
------------------------------------------- */
const pause = (page, ms = 0) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = 0) => {
    await locator.click();
    await pause(page, ms);
};

test(
    'Clicking Caregiver button adds caregiver section and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `AddDeleteCaregiver`;

        const member = {
            firstName: 'QAWSydnee',
            lastName: 'Bins',
            identifier: 'QAW1760117798632',
        };
        member.name = `${member.lastName}, ${member.firstName}`;

        const memberBeingCaredFor = {
            firstName: 'Mark',
            lastName: 'Jones',
            identifier: 'A9876541',
            streetAddr: '1034 Meadowbrook Court',
            city: 'Sacramento',
            state: 'CA',
            zip: '94239',
            homePhone: '+1 916-555-6541',
            cellPhone: '+1 916-555-6623',
            email: 'mark.jones@anywhere.com',
        };
        memberBeingCaredFor.name = `${memberBeingCaredFor.lastName}, ${memberBeingCaredFor.firstName}`;

        const relationship = 'Friend';
        const caregivingArrangement = 'Until the wind changes';

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
            .fill(member.name);
        await page.keyboard.press('Enter');

        // Open member
        await page
            .getByRole('gridcell', { name: member.name })
            .dblclick();

        await waitUntilLoaded(page);

        // Selectors
        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });

        const addCaregiverButton = page.getByRole('button', {
            name: '  Caregiver',
        });

        const caregiverSection = page.locator(
            '.formCollection:has-text("* Who is Member a Caregiver to?:")',
        );

        const contactInfoCard = page.locator('.collectionField .card');

        //--------------------------------
        // Cleanup: remove caregiver if present
        //--------------------------------
        try {
            await caregiverSection.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
            await caregiverSection.locator('.collection-delete-button').click();
            await caregiverSection.waitFor({ state: 'hidden' });
            await saveButton.click();
            await saveAndCloseButton.click();
            await caregiverSection.waitFor({ state: 'hidden' });
            await page.waitForTimeout(3000);
        }

        //--------------------------------
        // Act: ADD Caregiver
        //--------------------------------
        await addCaregiverButton.click();
        await caregiverSection.waitFor();

        // Open member lookup
        await page
            .locator(
                '.formField:has-text("Who is Member a Caregiver to?") button:visible',
            )
            .click();

        await page.locator('[role="dialog"]').waitFor();

        await page
            .getByRole('textbox', { name: 'Member or Alt. Identifier' })
            .fill(memberBeingCaredFor.identifier);

        await page
            .getByRole('button', { name: '  Search' })
            .click();

        await page
            .locator(`.card-heading:has-text("${memberBeingCaredFor.name}")`)
            .click();

        await page.locator('[role="dialog"]').waitFor({ state: 'hidden' });

        // Ensure selection succeeded
        await page
            .locator(
                `[name*="_caregiver_link_id__1"]:has-text("${memberBeingCaredFor.firstName} ${memberBeingCaredFor.lastName}")`,
            )
            .waitFor();

        // Verify contact info block
        await expect(async () => {
            const text = await contactInfoCard.innerText();
            [
                memberBeingCaredFor.streetAddr,
                `${memberBeingCaredFor.city}, ${memberBeingCaredFor.state} ${memberBeingCaredFor.zip}`,
                `H: ${memberBeingCaredFor.homePhone}`,
                `C: ${memberBeingCaredFor.cellPhone}`,
                memberBeingCaredFor.email,
            ].forEach((value) => {
                expect(text).toContain(value);
            });
        }).toPass({ timeout: 15_000 });

        // Relationship
        await page
            .locator('.collectionField:has-text("* Relationship:") [type="button"]')
            .click();
        await page.getByRole('option', { name: relationship }).click();

        // Arrangement
        await page
            .locator('[id*="_caregiver_arrangement__1"]')
            .fill(caregivingArrangement);

        // Save
        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await caregiverSection.scrollIntoViewIfNeeded();

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(caregiverSection).toBeVisible();

        await expect(
            page.locator('[id*="_caregiver_link_id__1"]'),
        ).toHaveText(`${memberBeingCaredFor.firstName} ${memberBeingCaredFor.lastName}`);

        await expect(
            page.locator('[id*="_caregiver_relationship_id__1"]'),
        ).toHaveText(relationship);

        await expect(
            page.locator('[id*="_caregiver_arrangement__1"]'),
        ).toHaveText(caregivingArrangement);

        const contactText = await contactInfoCard.innerText();
        [
            memberBeingCaredFor.streetAddr,
            `${memberBeingCaredFor.city}, ${memberBeingCaredFor.state} ${memberBeingCaredFor.zip}`,
            `H: ${memberBeingCaredFor.homePhone}`,
            `C: ${memberBeingCaredFor.cellPhone}`,
            memberBeingCaredFor.email,
        ].forEach((value) => {
            expect(contactText).toContain(value);
        });

        await expect(addCaregiverButton).toBeEnabled();

        //--------------------------------
        // Arrange: DELETE
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
        await saveButton.waitFor();

        //--------------------------------
        // Act: DELETE Caregiver
        //--------------------------------
        await caregiverSection.locator('.collection-delete-button').click();
        await caregiverSection.waitFor({ state: 'hidden' });

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(caregiverSection).not.toBeVisible();
        await expect(contactInfoCard).not.toBeVisible();
        await expect(addCaregiverButton).toBeEnabled();
    },
);