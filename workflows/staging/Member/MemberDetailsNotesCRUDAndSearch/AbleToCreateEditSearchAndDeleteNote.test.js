import { test, expect } from '@playwright/test';
import * as dateFns from 'date-fns';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 1000;

const pause = async (page, ms = FILL_CLICK_PAUSE_MS) => {
    await page.waitForTimeout(ms);
};

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test(
    'Able to create, edit, search, and delete a note',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemberDetailsNotesCRUD`;
        const userName = `${loginID} Qaw`;

        const member = {
            firstName: 'QAWPalma',
            lastName: 'Howe',
            identifier: 'QAW1760117897612',
        };
        member.name = `${member.lastName}, ${member.firstName}`;

        const note = {
            status: 'Pending',
            reason: 'Member Question',
            summary:
                'Member asked why their stomach hurts after they drink milk. Provider offered referall for allergen specialist.',
        };

        const todaysDate = dateFns.format(new Date(), 'MM/dd/yyyy');

        const { page } = await logIn({ loginID });
        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate → Member
        //--------------------------------
        await clickAndWait(page, page.getByText('Home', { exact: true }));
        await clickAndWait(
            page,
            page.locator('#home-tabs-tab-4').getByText('Members'),
        );

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Search...' }),
            member.name,
        );
        await page.keyboard.press('Enter');

        await page.getByRole('gridcell', { name: member.name }).dblclick();
        await waitUntilLoaded(page);

        //--------------------------------
        // Notes selectors
        //--------------------------------
        const saveButton = page.getByRole('button', { name: ' Save' });
        const saveAndCloseButton = page.getByRole('button', {
            name: ' Save and Close',
        });
        const addNoteButton = page.getByRole('button', { name: ' Note' });

        const noteSection = page.locator('#notes-child-browse-div');
        const noteTable = noteSection.locator('tbody');
        const createdNoteRow = noteTable.locator(`tr:has-text("${note.summary}")`);

        await noteSection.scrollIntoViewIfNeeded();

        //--------------------------------
        // Cleanup previous run
        //--------------------------------
        try {
            await createdNoteRow.waitFor({ state: 'hidden', timeout: 3000 });
        } catch {
            await createdNoteRow.hover();
            await clickAndWait(
                page,
                createdNoteRow.locator('[title="Delete"]'),
            );
            await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));
            await createdNoteRow.waitFor({ state: 'hidden' });
            await pause(page, 3000);
        }

        //--------------------------------
        // Act: Create Note
        //--------------------------------
        await clickAndWait(page, addNoteButton);
        await page.getByRole('dialog').waitFor();

        await clickAndWait(
            page,
            page.locator(
                `.formField:has-text("* Status:") [aria-label="expand combobox"]`,
            ),
        );
        await clickAndWait(page, page.getByRole('option', { name: note.status }));

        await clickAndWait(
            page,
            page.locator(
                `.formField:has-text("* Reason:") [aria-label="expand combobox"]`,
            ),
        );
        await clickAndWait(page, page.getByRole('option', { name: note.reason }));

        const frame = page.frameLocator(
            '[title="Editable area. Press F10 for toolbar."]',
        );

        await fillAndWait(
            page,
            frame.locator('#note_detail'),
            note.summary,
        );

        const timestamp1 = dateFns.format(new Date(), 'hh:mm:');

        await clickAndWait(page, saveAndCloseButton);
        await page.getByText('New Work Log').waitFor();
        await clickAndWait(page, saveAndCloseButton);

        //--------------------------------
        // Assert: Create
        //--------------------------------
        await expect(saveButton).not.toBeVisible();
        await expect(noteTable).toBeVisible();

        let textToVerify = await createdNoteRow.innerText();
        [
            note.status,
            'Member Detail',
            note.reason,
            userName,
            `${todaysDate} ${timestamp1}`,
        ].forEach(str => expect(textToVerify).toContain(str));

        await createdNoteRow.hover();
        await expect(createdNoteRow.locator('[title="Edit"]')).toBeEnabled();
        await expect(createdNoteRow.locator('[title="Delete"]')).toBeEnabled();
        await expect(addNoteButton).toBeEnabled();

        //--------------------------------
        // Act: Edit Note
        //--------------------------------
        const noteEdit = {
            status: 'Completed',
            reason: 'Provider Question',
            summary: `${note.summary} THIS IS THE EDITED NOTE!`,
        };

        await clickAndWait(page, createdNoteRow.locator('[title="Edit"]'));
        await page.getByRole('dialog').waitFor();

        await clickAndWait(
            page,
            page.locator(
                `.formField:has-text("* Status:") [aria-label="expand combobox"]`,
            ),
        );
        await clickAndWait(
            page,
            page.getByRole('option', { name: noteEdit.status }),
        );

        await clickAndWait(
            page,
            page.locator(
                `.formField:has-text("* Reason:") [aria-label="expand combobox"]`,
            ),
        );
        await clickAndWait(
            page,
            page.getByRole('option', { name: noteEdit.reason }),
        );

        await fillAndWait(
            page,
            frame.locator('#note_detail'),
            noteEdit.summary,
        );

        const timestamp2 = dateFns.format(new Date(), 'hh:mm:');

        await clickAndWait(page, saveAndCloseButton);
        await page.getByText('New Work Log').waitFor();
        await clickAndWait(page, saveAndCloseButton);

        const editedNoteRow = noteTable.locator(
            `tr:has-text("${noteEdit.summary}")`,
        );

        //--------------------------------
        // Assert: Edit
        //--------------------------------
        textToVerify = await editedNoteRow.innerText();
        [
            noteEdit.status,
            'Member Detail',
            noteEdit.reason,
            userName,
            `${todaysDate} ${timestamp2}`,
        ].forEach(str => expect(textToVerify).toContain(str));

        //--------------------------------
        // Act: Search
        //--------------------------------
        await fillAndWait(
            page,
            page
                .locator('#notes-anchor')
                .getByRole('textbox', { name: 'Search...' }),
            noteEdit.summary,
        );
        await page.keyboard.press('Enter');

        await expect(noteTable.locator('tr')).toHaveCount(1);
        await expect(editedNoteRow).toBeVisible();

        //--------------------------------
        // Act: Delete
        //--------------------------------
        await fillAndWait(
            page,
            page
                .locator('#notes-anchor')
                .getByRole('textbox', { name: 'Search...' }),
            '',
        );
        await page.keyboard.press('Enter');

        await editedNoteRow.hover();
        await clickAndWait(
            page,
            editedNoteRow.locator('[title="Delete"]'),
        );
        await page.getByText('Are you sure you want to').waitFor();
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        //--------------------------------
        // Assert: Delete
        //--------------------------------
        await expect(editedNoteRow).not.toBeVisible();
        await expect(createdNoteRow).not.toBeVisible();
        await expect(addNoteButton).toBeEnabled();
    },
);
