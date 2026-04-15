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
    'Clicking Alternate ID plus icon adds Alternate ID section, allows finding member by Alternate ID, and clicking trash icon deletes it',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `AddDeleteAlternateID`;

        const member = {
            firstName: 'QAWRobert',
            lastName: 'Ondricka',
            memberId: 'QAW1758235362621',
            address1: '434 Waters Well',
            city: 'Kreigerland',
            state: 'IA',
            birthdate: '09/18/2005',
        };
        member.fullName = `${member.lastName}, ${member.firstName}`;

        const id = {
            type: 'Health Insurance Claim Number',
            number: '123654789',
        };

        const { page } = await logIn({ loginID });
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate Home > Members
        //--------------------------------
        await clickAndWait(page, page.getByText('Home', { exact: true }));
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        //--------------------------------
        // Search and open member
        //--------------------------------
        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member.fullName);
        await page.keyboard.press('Enter');

        await page
            .getByRole('gridcell', { name: member.fullName })
            .dblclick();

        await waitUntilLoaded(page);

        //--------------------------------
        // Selectors
        //--------------------------------
        const altIDSection = page.locator(
            '.formCollection:has-text("* ID Type:")',
        );

        const addAltIDButton = page.getByRole('button', {
            name: ' Alternate ID',
        });

        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });

        //--------------------------------
        // Cleanup existing Alternate ID (if present)
        //--------------------------------
        try {
            await altIDSection.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
            await waitUntilLoaded(page);

            await page
                .locator(
                    '.formCollection:has-text("ID Type:") >> nth=0 >> button >> nth=-1',
                )
                .click();

            await altIDSection.waitFor({ state: 'hidden' });

            await saveButton.click();
            await saveAndCloseButton.click();

            await altIDSection.waitFor({ state: 'hidden' });
            await page.waitForTimeout(3000);
        }

        //--------------------------------
        // Act: ADD Alternate ID
        //--------------------------------
        await addAltIDButton.click();
        await waitUntilLoaded(page);

        // Select Alternate ID Type
        await page
            .locator('#record-div div')
            .filter({ hasText: 'Alternate IDs Alternate ID *' })
            .getByLabel('expand combobox')
            .click();

        await page.getByText(id.type).click();

        // Enter Alternate ID number
        await page.locator('#paid_id_number__1').fill(id.number);

        // Save
        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: ADD
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(altIDSection).toBeVisible();
        await expect(altIDSection.getByText(id.type)).toBeVisible();
        await expect(altIDSection.getByText(id.number)).toBeVisible();
        await expect(addAltIDButton).toBeEnabled();

        //--------------------------------
        // Arrange: Close member tab
        //--------------------------------
        await page
            .getByRole('tab', {
                name: `  ${member.lastName}, ${member.firstName}    `,
            })
            .locator('span')
            .nth(2)
            .click();

        //--------------------------------
        // Act: Find Member by Alternate ID
        //--------------------------------
        await page.getByRole('button', { name: ' Find Member' }).click();
        //await waitUntilLoaded(page);

        await page
            .getByRole('textbox', { name: 'Member or Alt. Identifier' })
            .fill(id.number);

        await page
            .getByRole('button', { name: '  Search' })
            .click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Search Results
        //--------------------------------
        const cardSelector = '.member-card-info';
        const cardInfo = page.locator(
            `${cardSelector}:has-text("${member.fullName}")`,
        );

        await expect(page.locator(cardSelector)).toHaveCount(1);
        await expect(cardInfo).toBeVisible();

        const cardText = await cardInfo.innerText();

        // ✅ Stable identity assertions only
        expect(cardText).toContain(member.fullName);
        expect(cardText).toContain(member.memberId);
        expect(cardText).toContain(member.birthdate);

        //--------------------------------
        // Assert: Open member from card
        //--------------------------------
        await cardInfo.click();
        await waitUntilLoaded(page);

        await expect(addAltIDButton).toBeEnabled();
        await expect(altIDSection.getByText(id.type)).toBeVisible();
        await expect(altIDSection.getByText(id.number)).toBeVisible();

        //--------------------------------
        // Arrange: DELETE
        //--------------------------------
        await clickAndWait(page, page.getByRole('button', { name: 'Edit' }));
        await saveButton.waitFor();

        //--------------------------------
        // Act: DELETE Alternate ID
        //--------------------------------
        await page
            .locator(
                '.formCollection:has-text("ID Type:") >> nth=0 >> button >> nth=-1',
            )
            .click();

        await altIDSection.waitFor({ state: 'hidden' });

        await saveButton.click();
        await page.getByText('New Work Log').waitFor();
        await saveAndCloseButton.click();

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: DELETE
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(altIDSection).not.toBeVisible();
        await expect(addAltIDButton).toBeEnabled();
    },
);