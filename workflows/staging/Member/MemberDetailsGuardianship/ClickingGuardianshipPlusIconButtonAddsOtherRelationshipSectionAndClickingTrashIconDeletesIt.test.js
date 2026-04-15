import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
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
    'Clicking Guardianship plus icon adds other relationship section and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `AddDeleteGuardianShip`;

        const member = {
            firstName: 'QAWCarley',
            lastName: 'Rosenbaum',
            identifier: 'QAW1760117942257',
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

        const guardianshipType = 'Family Member';

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
            .fill(member.name);
        await page.keyboard.press('Enter');

        // Open member
        await page
            .getByRole('gridcell', { name: member.name })
            .dblclick();

        await waitUntilLoaded(page);

        //--------------------------------
        // Selectors
        //--------------------------------
        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });

        const addGuardianshipButton = page.getByRole('button', {
            name: ' Guardianship',
        });

        const guardianshipSection = page.locator(
            '.formCollection:has-text("* Member is a guardian to:")',
        );

        const contactInfoCard = page.locator('.collectionField .card');

        //--------------------------------
        // Cleanup existing guardianship if present
        //--------------------------------
        try {
            await guardianshipSection.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
            await guardianshipSection
                .locator('.collection-delete-button')
                .click();

            await guardianshipSection.waitFor({ state: 'hidden' });

            await saveButton.click();
            await saveAndCloseButton.click();

            await guardianshipSection.waitFor({ state: 'hidden' });
            await page.waitForTimeout(3000);
        }

        //--------------------------------
        // Act: ADD Guardianship
        //--------------------------------
        await addGuardianshipButton.click();
        await guardianshipSection.waitFor();

        // Open member lookup
        await page
            .locator(
                '.formField:has-text("Member is a Guardian to:") button:visible',
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

        // Ensure member selection completed
        await page
            .locator(
                `[name*="_link_id__1"]:has-text("${memberBeingCaredFor.firstName} ${memberBeingCaredFor.lastName}")`,
            )
            .waitFor();

        // Verify contact info card
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

        // Select Guardianship Type
        await page
            .locator(
                '.collectionField:has-text("* Guardianship Type:") [type="button"]',
            )
            .click();

        await page.getByRole('option', { name: guardianshipType }).click();

        // Save
        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await guardianshipSection.scrollIntoViewIfNeeded();

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(guardianshipSection).toBeVisible();

        await expect(
            page.locator('[id*="_link_id__1"]'),
        ).toHaveText(`${memberBeingCaredFor.firstName} ${memberBeingCaredFor.lastName}`);

        await expect(
            page.locator('[id*="_guardianship_type_id__1"]'),
        ).toHaveText(guardianshipType);

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

        await expect(addGuardianshipButton).toBeEnabled();

        //--------------------------------
        // Arrange: DELETE
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
        await saveButton.waitFor();

        //--------------------------------
        // Act: DELETE Guardianship
        //--------------------------------
        await guardianshipSection
            .locator('.collection-delete-button')
            .click();

        await guardianshipSection.waitFor({ state: 'hidden' });

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(guardianshipSection).not.toBeVisible();
        await expect(contactInfoCard).not.toBeVisible();
        await expect(addGuardianshipButton).toBeEnabled();
    },
);