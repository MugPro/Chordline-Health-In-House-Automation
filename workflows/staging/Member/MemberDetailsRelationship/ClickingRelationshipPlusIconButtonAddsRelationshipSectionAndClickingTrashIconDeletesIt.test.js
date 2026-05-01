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
    'Clicking Relationship plus icon adds Relationship section and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `AddDeleteRelationship`;

        const member = {
            firstName: 'QAWArthur',
            lastName: 'Koch',
            identifier: 'QAW1758118948843',
        };
        member.fullName = `${member.lastName}, ${member.firstName}`;

        const relationship = {
            type: 'Sibling',
        };

       // const { page } = await logIn({ loginID });

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

        // Search for member
        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member.fullName);
        await page.keyboard.press('Enter');

        //await waitUntilLoaded(page);

        // Open member
        await page
            .getByRole('gridcell', { name: member.fullName })
            .dblclick();

        await waitUntilLoaded(page);

        //--------------------------------
        // Selectors
        //--------------------------------
        const relSection = page.locator(
            '.formCollection:has-text("Other Relationship:")',
        );

        const addRelButton = page.getByRole('button', {
            name: ' Relationship',
        });

        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });

        //--------------------------------
        // Cleanup existing Relationship (if present)
        //--------------------------------
        try {
            await relSection.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
            await waitUntilLoaded(page);
            await relSection.locator('.collection-delete-button').click();
            await relSection.waitFor({ state: 'hidden' });

            await saveButton.click();
            await waitUntilLoaded(page);
            await saveAndCloseButton.click();

            await relSection.waitFor({ state: 'hidden' });
            await page.waitForTimeout(3000);
        }

        //--------------------------------
        // Act: ADD Relationship
        //--------------------------------
        await addRelButton.click();

        await waitUntilLoaded(page);

        // Open lookup modal
        await relSection
            .getByRole('button', { name: '...' })
            .first()
            .click();

        //await waitUntilLoaded(page);

        // Grab any person from lookup results
        const rowArray = (
            await page
                .locator('#lookup-grid [role="row"] >> nth=1')
                .innerText()
        ).split('\t');

        relationship.firstName = rowArray[1];
        relationship.lastName = rowArray[2];
        relationship.streetAddress = rowArray[5];
        relationship.city = rowArray[6];
        relationship.zip = rowArray[8];
        relationship.preferredPhone = rowArray[9];

        // Select person
        await page
            .getByRole('row', {
                name: `${relationship.firstName} ${relationship.lastName}`,
            })
            .click();

        await page
            .getByRole('button', { name: 'Select', exact: true })
            .click();

        // Ensure relationship details load
        await relSection
            .getByText(
                `${relationship.firstName} ${relationship.lastName} (`,
            )
            .waitFor();

        await relSection.getByText(relationship.streetAddress).waitFor();
        await relSection.getByText(relationship.city).waitFor();
        await relSection.getByText(relationship.zip).waitFor();
        await relSection.getByText(`P: ${relationship.preferredPhone}`).waitFor();
        await relSection.getByText('@').waitFor();

        await waitUntilLoaded(page);

        // Select Relationship Type
        await relSection.getByLabel('expand combobox').click();
        await page
            .getByRole('option', { name: relationship.type })
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
        await expect(saveButton).not.toBeVisible();
        await expect(relSection).toBeVisible();

        await expect(
            relSection.getByText(
                `${relationship.firstName} ${relationship.lastName} (`,
            ),
        ).toBeVisible();

        await expect(
            relSection.getByText(relationship.streetAddress),
        ).toBeVisible();

        await expect(relSection.getByText(relationship.city)).toBeVisible();
        await expect(relSection.getByText(relationship.zip)).toBeVisible();

        await expect(
            relSection.getByText(`P: ${relationship.preferredPhone}`),
        ).toBeVisible();

        await expect(relSection.getByText('@')).toBeVisible();

        await expect(
            relSection.getByText(
                `Relationship Type: ${relationship.type}`,
            ),
        ).toBeVisible();

        await expect(addRelButton).toBeEnabled();

        //--------------------------------
        // Arrange: DELETE
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
        await saveButton.waitFor();

        //--------------------------------
        // Act: DELETE Relationship
        //--------------------------------
        await relSection.locator('.collection-delete-button').click();
        await relSection.waitFor({ state: 'hidden' });

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(relSection).not.toBeVisible();
        await expect(addRelButton).toBeEnabled();
    },
);
