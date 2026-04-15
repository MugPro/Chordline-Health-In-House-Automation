import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

test(
    'Create, update, and delete a Care Team member',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        // ✅ Updated constants
        const loginID = `MemDetsCareTeam`;
        const member = { firstName: `QAWolf`, lastName: `Carter` };
        const careTeamMember = `OrgsCRUD`;

        const reason = [
            'Behavioral Health',
            'Case Manager',
            'Medical Reviewer',
            'Member Services',
            'Provider',
        ][Math.floor(Math.random() * 5)];

        const activity = faker.lorem.sentence();
        const careTeamSummary = faker.lorem.sentence();

        const module1 = `Member Detail`;
        const careTeamType = `User`;
        const name1 = `${loginID} Qaw`;
        const email = `chordline+${loginID}@qawolf.email`;
        const entryBy = `${loginID} Qaw`;

        const { page } = await logIn({ loginID });
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Members → Member Detail → Care Team
        //--------------------------------
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(`${member.lastName}, ${member.firstName}`);
        await page.locator('#lookup-search-button:visible').click();

        await page
            .getByRole('gridcell', {
                name: `${member.lastName}, ${member.firstName}`,
            })
            .dblclick();

        await waitUntilLoaded(page);

        await page
            .getByRole('menuitem', { name: 'Member Detail' })
            .locator('span')
            .nth(1)
            .click();

        await page.locator('#shortcuts').getByText('Care Team').click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Cleanup existing Care Team rows (by loginID)
        //--------------------------------
        try {
            await page
                .locator('#careteam-anchor')
                .getByRole('textbox', { name: 'Search...' })
                .fill(loginID);
            await page.locator('#careteam-anchor a').click();

            await waitUntilLoaded(page);

            const rows = page.locator(
                '#careteam-child-grid table tbody tr:has-text("' + loginID + '")',
            );

            const count = await rows.count();
            for (let i = count - 1; i >= 0; i--) {
                const row = rows.nth(i);
                await row.hover();
                await row.locator('[title="Delete"]').click();
                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);
            }
        } catch {
            // Safe cleanup — ignore if nothing exists
        }

        //--------------------------------
        // Act: Create Care Team member
        //--------------------------------
        await page.getByRole('button', { name: ' Care Team' }).click();
        await expect(page.getByText('New Care Team')).toBeVisible();

        //await waitUntilLoaded(page);

        //await page.getByRole('button', { name: '...' }).first().click();
        await page.getByRole('button', { name: '...' }).nth(1).click();
        await waitUntilLoaded(page);
        await page.getByText('Users', { exact: true }).click();

        await page
            .getByRole('tabpanel', { name: 'Users' })
            .getByPlaceholder('Search...')
            .fill(loginID);

        await page
            .getByRole('tabpanel', { name: 'Users' })
            .locator('#lookup-search-button')
            .click();

        await page.getByRole('gridcell', { name: loginID, exact: true }).click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        await waitUntilLoaded(page);

        await page.locator('input[name="ctem_reason_id_input"]').fill(reason);
        await page.getByRole('option', { name: reason }).click();

        const activityFrame = page
            .frameLocator('[title="Editable area. Press F10 for toolbar."]')
            .first();
        await activityFrame.locator('#ctem_activity').fill(activity);

        const summaryFrame = page
            .frameLocator('[title="Editable area. Press F10 for toolbar."]')
            .nth(1);
        await summaryFrame.locator('#ctem_notes').fill(careTeamSummary);

        await page.getByRole('button', { name: ' Save', exact: true }).click();
        await waitUntilLoaded(page);

        const careTeamId = await page.getByText('Care Team #').innerText();
        const entryDate = await page
            .locator('[data-bind="text: fields.ctem_entry_date.value"]')
            .innerText();



        await page.getByRole('button', { name: ' Close' }).click();

        //await waitUntilLoaded(page);

        //--------------------------------
        // Assert: creation
        //--------------------------------
        await page
            .locator('#careteam-anchor')
            .getByRole('textbox', { name: 'Search...' })
            .fill(loginID);
        await page.locator('#careteam-anchor a').click();

        const row = page.locator(
            '#careteam-child-grid tbody tr:has-text("' + loginID + '")',
        );

        await waitUntilLoaded(page);

        await expect(row).toBeVisible();
        await expect(row.locator('td').nth(1)).toContainText(module1);
        await expect(row.locator('td').nth(2)).toContainText(
            careTeamId.replace('Care Team #', ''),
        );
        await expect(row.locator('td').nth(3)).toContainText(careTeamType);
        await expect(row.locator('td').nth(4)).toContainText(reason);
        await expect(row.locator('td').nth(5)).toContainText(name1);
        await expect(row.locator('td').nth(8)).toContainText(email);
        await expect(row.locator('td').nth(9)).toContainText(entryBy);
        await expect(row.locator('td').nth(10)).toContainText(entryDate);



        //--------------------------------
        // Act: Update Care Team member
        //--------------------------------
        await row.dblclick();
        await waitUntilLoaded(page);
        await expect(page.getByText('Care Team #')).toBeVisible();

        const reasonEdit = [
            'Behavioral Health',
            'Case Manager',
            'Medical Reviewer',
            'Member Services',
            'Provider',
        ][Math.floor(Math.random() * 5)];

        const activityEdit = faker.lorem.sentence();
        const careTeamSummaryEdit = faker.lorem.sentence();

        await page
            .getByLabel('Care Team #')
            .getByRole('button', { name: ' Edit' })
            .click();
        await waitUntilLoaded(page);

        await page
            .locator(
                '[data-bind="css: { hidden: fields.ctem_care_team_member_id.itemIsNotSelected }"]',
            )
            .click();

        //await page.getByRole('button', { name: '...' }).first().click();
        await page.getByRole('button', { name: '...' }).nth(1).click();
       // await waitUntilLoaded(page);
        await page.getByText('Users', { exact: true }).click();

        await page
            .getByRole('tabpanel', { name: 'Users' })
            .getByPlaceholder('Search...')
            .fill(careTeamMember);

        await page
            .getByRole('tabpanel', { name: 'Users' })
            .locator('#lookup-search-button')
            .click();

        await page
            .getByRole('gridcell', { name: careTeamMember, exact: true })
            .click();
        await page.getByRole('button', { name: 'Select', exact: true }).click();

        await waitUntilLoaded(page);

        await page.locator('input[name="ctem_reason_id_input"]').fill(reasonEdit);
        await page.getByRole('option', { name: reasonEdit }).click();

        await activityFrame.locator('#ctem_activity').fill(activityEdit);
        await summaryFrame.locator('#ctem_notes').fill(careTeamSummaryEdit);

        //await waitUntilLoaded(page);

        await page.getByRole('button', { name: ' Save', exact: true }).click();
        await waitUntilLoaded(page);
        await page.getByRole('button', { name: ' Close' }).click();

        //--------------------------------
        // Act: Delete Care Team member
        //--------------------------------
        await row.hover();
        await row.locator('[title="Delete"]').click();
        await page.getByRole('button', { name: 'Yes' }).click();
        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: deletion
        //--------------------------------
        await expect(row).not.toBeVisible();
    },
);