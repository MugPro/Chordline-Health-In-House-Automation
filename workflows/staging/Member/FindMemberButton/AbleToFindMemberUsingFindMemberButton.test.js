import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 1000;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Able to find member using Find Member button', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `FindMemberButton`;

    // Log in
    const { page } = await logIn({ loginID });

    //--------------------------------
    // Navigate to Members tab
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('tab', { name: 'Members' }).locator('span'),
    );

    await waitUntilLoaded(page);

    //--------------------------------
    // Select a random member
    //--------------------------------
    const membersGridRows = page.locator(
        `[id="members-grid"] table tbody tr`,
    );

    const memberCount = await membersGridRows.count();
    expect(memberCount).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * memberCount);
    const selectedMember = membersGridRows.nth(randomIndex);

    const memberData = {
        memId: await selectedMember.locator('td >> nth=3').innerText(),
        memName: await selectedMember.locator('td >> nth=4').innerText(),
        birthdate: await selectedMember.locator('td >> nth=14').innerText(),
    };

    //--------------------------------
    // ACT: Search by Member ID
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Find Member' }),
    );

    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Member or Alt. Identifier' }),
        memberData.memId,
    );

    await clickAndWait(
        page,
        page.getByRole('button', { name: '  Search' }),
    );

    //--------------------------------
    // Assert: Result card appears
    //--------------------------------
    const memberCard = page.locator(
        `[id="member-listview"] .member-card.k-listview-item`,
    );

    await expect(memberCard).toContainText(memberData.memName);
    await expect(memberCard).toContainText(memberData.memId);
    await expect(memberCard).toContainText(memberData.birthdate);

    //--------------------------------
    // ACT: Cancel and search by Name + Birthdate
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole('button', { name: 'Cancel' }),
    );

    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Find Member' }),
    );

    const [lastName, firstName] = memberData.memName.split(', ');

    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'First Name' }),
        firstName,
    );

    await fillAndWait(
        page,
        page.getByRole('textbox', { name: 'Last Name' }),
        lastName,
    );

    await page.getByRole('combobox', { name: 'Birthdate' }).clear();
    await pause(page);

    await page
        .getByRole('combobox', { name: 'Birthdate' })
        .pressSequentially(memberData.birthdate.split('/').join(' '));

    await pause(page);

    await clickAndWait(
        page,
        page.getByRole('button', { name: '  Search' }),
    );

    //--------------------------------
    // Assert: Result card appears again
    //--------------------------------
    await expect(memberCard).toContainText(memberData.memName);
    //await expect(memberCard).toContainText(memberData.memId);
    await expect(memberCard).toContainText(memberData.birthdate);
});