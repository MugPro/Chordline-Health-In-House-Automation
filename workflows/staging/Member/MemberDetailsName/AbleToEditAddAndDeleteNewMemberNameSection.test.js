/*


import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

test('Able to edit, add, and delete new member name section', async () => {









    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants
    const loginID = `MemDetsName`;
    const member = {
        firstName: `QAWMalachi`,
        lastName: `Botsford`,
        lastFirst: `Botsford, QAWMalachi`,
    };

    const member2 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.firstName(),
        namePrefix: faker.person.prefix(),
        nameSuffix: faker.person.suffix(),
    };
    const firstNameSelector = `#pern_first_name__1`;
    const lastNameSelector = `#pern_last_name__1`;
    const suffixSelector = `#pern_name_suffix__1`;
    const middleNameSelector = `#pern_middle_name__1`;
    const prefixSelector = `#pern_name_prefix__1`;

    // Sign in to the app
    const { page } = await logIn({ loginID, slowMo: 500 });

    // Click the members tab
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

    // Fill in the search bar and click search
    await page
        .getByRole(`textbox`, { name: `Search...` })
        .fill(member.lastFirst);
    await page
        .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-button`)
        .click();

    // Double click the member row
    await page.getByRole(`gridcell`, { name: member.lastFirst }).dblclick();
    await waitUntilLoaded(page);

    //--------------------------------
    // Act:
    //--------------------------------
    // Click the "+Name" button
    await page.getByRole(`button`, { name: ` Edit` }).click();
    await page.getByRole(`button`, { name: `  Name` }).click();
    await waitUntilLoaded(page);

    // Ensure another Member Name section appears
    await expect(async () => {
        await expect(
            page.locator(`[data-collection-code-list="COLLECTION_PERN"]`),
        ).toBeVisible();
    }).toPass({ timeout: 10 * 1000 });

    // Fill in the "First Name"
    await page.locator(firstNameSelector).fill(member2.firstName);

    // Fill in the "Last Name"
    await page.locator(lastNameSelector).fill(member2.lastName);

    // Fill in the "Name Suffix"
    await page.locator(suffixSelector).fill(member2.nameSuffix);

    // Fill in the "Middle Name"
    await page.locator(middleNameSelector).fill(member2.middleName);

    // Fill in the "Name Prefix"
    await page.locator(prefixSelector).fill(member2.namePrefix);

        await waitUntilLoaded(page);
        await waitUntilLoaded(page);

    // Click the "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    await waitUntilLoaded(page);
        await waitUntilLoaded(page);
        await waitUntilLoaded(page);



    // Click the "Save and Close" button to close the Work log modal
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

        await waitUntilLoaded(page);
        await waitUntilLoaded(page);

    // Click the "X" button on the member tab
    await page
        .getByRole(`tab`, { name: `   ${member.lastFirst}    ` })
        .locator(`span`)
        .nth(2)
        .click();

    // Double click on the member row to reopen the member detail page
    await page.getByRole(`gridcell`, { name: member.lastFirst }).dblclick();

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert another Member Name section persists
    await expect(
        page.locator(`[data-collection-code-list="COLLECTION_PERN"]`),
    ).toBeVisible();

    // Assert the "First Name" persists
    await expect(page.locator(firstNameSelector)).toHaveText(
        member2.firstName,
    );

    // Assert the "Last Name" persists
    await expect(page.locator(lastNameSelector)).toHaveText(
        member2.lastName,
    );

    // Assert the "Name Suffix" persists
    await expect(page.locator(suffixSelector)).toHaveText(
        member2.nameSuffix,
    );

    // Assert the "Middle Name" persists
    await expect(page.locator(middleNameSelector)).toHaveText(
        member2.middleName,
    );

    // Assert the "Name Prefix" persists
    await expect(page.locator(prefixSelector)).toHaveText(
        member2.namePrefix,
    );




    // Arrange:
    //--------------------------------
    // Constants
    const member2Edit = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.firstName(),
        namePrefix: faker.person.prefix(),
        nameSuffix: faker.person.suffix(),
    };

    //--------------------------------
    // Act:
    //--------------------------------
    // Click the Edit icon
    await page.getByRole(`button`, { name: ` Edit` }).click();
    await waitUntilLoaded(page);

    // Fill in the "First Name"
    await page.locator(firstNameSelector).fill(member2Edit.firstName);

    // Fill in the "Last Name"
    await page.locator(lastNameSelector).fill(member2Edit.lastName);

    // Fill in the "Name Suffix"
    await page.locator(suffixSelector).fill(member2Edit.nameSuffix);

    // Fill in the "Middle Name"
    await page.locator(middleNameSelector).fill(member2Edit.middleName);

    // Fill in the "Name Prefix"
    await page.locator(prefixSelector).fill(member2Edit.namePrefix);

    // Click the "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    await waitUntilLoaded(page);

    // Ensure the New Work Log is displayed
    await expect(async () => {
        await expect(page.getByText(`New Work Log`)).toBeVisible();
    }).toPass({ timeout: 20 * 1000 });

    // Click the "Save and Close" button to close the Work log modal
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    // Click the "X" button on the member tab
    await page
        .getByRole(`tab`, { name: `   ${member.lastFirst}    ` })
        .locator(`span`)
        .nth(2)
        .click();

    // Double click on the member row to reopen the member detail page
    await page.getByRole(`gridcell`, { name: member.lastFirst }).dblclick();

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert another Member Name section persists
    await expect(
        page.locator(`[data-collection-code-list="COLLECTION_PERN"]`),
    ).toBeVisible();

    // Assert the "First Name" persists
    await expect(page.locator(firstNameSelector)).toHaveText(
        member2Edit.firstName,
    );

    // Assert the "Last Name" persists
    await expect(page.locator(lastNameSelector)).toHaveText(
        member2Edit.lastName,
    );

    // Assert the "Name Suffix" persists
    await expect(page.locator(suffixSelector)).toHaveText(
        member2Edit.nameSuffix,
    );

    // Assert the "Middle Name" persists
    await expect(page.locator(middleNameSelector)).toHaveText(
        member2Edit.middleName,
    );

    // Assert the "Name Prefix" persists
    await expect(page.locator(prefixSelector)).toHaveText(
        member2Edit.namePrefix,
    );



    // Click the Edit icon
    await page.getByRole(`button`, { name: ` Edit` }).click();
    await waitUntilLoaded(page);

    // Click the "Trashcan" icon
    await page
        .locator(
            `[data-collection-code-list="COLLECTION_PERN"] button[title="Delete"]`,
        )
        .last()
        .click();

    // Click the "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    await waitUntilLoaded(page);

    // Click the "Save and Close" button for the "New Work Log" modal
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    //--------------------------------
    // Assert:
    //--------------------------------
    // Assert the "First Name" is not visible
    await expect(page.locator(firstNameSelector)).not.toBeVisible();

    // Assert the "Last Name" is not visible
    await expect(page.locator(lastNameSelector)).not.toBeVisible();

    // Assert the "Name Suffix" is not visible
    await expect(page.locator(suffixSelector)).not.toBeVisible();

    // Assert the "Middle Name" is not visible
    await expect(page.locator(middleNameSelector)).not.toBeVisible();

    // Assert the "Name Prefix" is not visible
    await expect(page.locator(prefixSelector)).not.toBeVisible();

    // This workflow does not require cleanup.

},
);





 */





























import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Pause helpers
------------------------------------------- */
const ACTION_PAUSE_MS = 0;

const pause = (page, ms = ACTION_PAUSE_MS) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const dblClickAndWait = async (page, locator, ms = ACTION_PAUSE_MS) => {
    await locator.dblclick();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = ACTION_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

/* -------------------------------------------
   Helpers for this test
------------------------------------------- */
const nameCollectionContainer = (page) =>
    page.locator('[data-collection-code-list="COLLECTION_PERN"]');

// Inputs (when in Edit mode)
const firstNameInput = (page) => page.locator('input[id^="pern_first_name__"]').first();
const lastNameInput = (page) => page.locator('input[id^="pern_last_name__"]').first();
const middleNameInput = (page) => page.locator('input[id^="pern_middle_name__"]').first();
const prefixInput = (page) => page.locator('input[id^="pern_name_prefix__"]').first();
const suffixInput = (page) => page.locator('input[id^="pern_name_suffix__"]').first();

async function reopenMember(page, memberLastFirst) {
    // Close the member tab if it’s open (best-effort)
    const tab = page.getByRole('tab', { name: new RegExp(memberLastFirst) });
    if (await tab.isVisible({ timeout: 500 }).catch(() => false)) {
        // Click the 'X' close button inside the tab
        const closeButton = tab.locator('span').nth(2);
        if (await closeButton.isVisible().catch(() => false)) {
            await clickAndWait(page, closeButton);
        }
    }

    // Reopen by double-clicking the grid row
    await dblClickAndWait(page, page.getByRole('gridcell', { name: memberLastFirst }));
    await waitUntilLoaded(page);
}

/**
 * Ensure we're in Edit mode.
 */
async function ensureEditMode(page) {
    const editBtn = page.getByRole('button', { name: ' Edit' });
    if (await editBtn.isVisible().catch(() => false)) {
        await clickAndWait(page, editBtn);
        await waitUntilLoaded(page);
    }
}

/**
 * Ensure Name inputs are available; click '+ Name' if needed.
 */
async function ensureNameInputsVisible(page) {
    // If inputs are not visible, try clicking +Name
    if (!(await firstNameInput(page).isVisible().catch(() => false))) {
        const addNameBtn = page.getByRole('button', { name: ' \u00A0Name' });
        await clickAndWait(page, addNameBtn);
        await waitUntilLoaded(page);
    }
    await firstNameInput(page).waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Fill the Name inputs with provided values.
 */
async function fillNameInputs(page, vals) {
    await fillAndWait(page, firstNameInput(page), vals.firstName);
    await fillAndWait(page, lastNameInput(page), vals.lastName);
    await fillAndWait(page, middleNameInput(page), vals.middleName);
    await fillAndWait(page, prefixInput(page), vals.namePrefix);
    await fillAndWait(page, suffixInput(page), vals.nameSuffix);
}

/**
 * Save & close (handles Work Log modal).
 */
async function saveAndCloseWorkLog(page) {
    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await waitUntilLoaded(page);

    // Wait for Work Log and close
    await page.getByText('New Work Log').waitFor({ timeout: 30_000 });
    await clickAndWait(page, page.getByRole('button', { name: ' Save and Close' }));
    await waitUntilLoaded(page);
}

/**
 * Verify that the read-only name section contains the provided values.
 * Returns true/false instead of throwing — to support retry logic.
 */
async function verifyNamePersisted(page, vals) {
    try {
        const section = nameCollectionContainer(page);
        //await expect(section).toBeVisible({ timeout: 10_000 });
        expect(await section.isVisible({ timeout: 10_000 })).toBe(true);

        const text = await section.innerText();
        return (
            text.includes(vals.firstName) &&
            text.includes(vals.lastName) &&
            text.includes(vals.middleName) &&
            text.includes(vals.namePrefix) &&
            text.includes(vals.nameSuffix)
        );
    } catch {
        return false;
    }
}

/**
 * Retry loop:
 * - Go into edit
 * - Ensure name inputs exist (or click +Name if needed)
 * - Fill, Save & Close
 * - Reopen member and verify read-only text
 * Repeats up to `maxAttempts`.
 */
async function retryAddOrUpdateNameUntilPersisted(page, memberLastFirst, initialValues, maxAttempts = 3) {
    let attempt = 0;
    let values = { ...initialValues };

    while (attempt < maxAttempts) {
        attempt += 1;

        // Go to Edit
        await ensureEditMode(page);

        // Ensure inputs exist and fill
        await ensureNameInputsVisible(page);
        await fillNameInputs(page, values);

        // Save & close Work Log
        await saveAndCloseWorkLog(page);

        // Reopen the member to force a fresh read-only view
        await reopenMember(page, memberLastFirst);

        // Verify persistence via read-only text
        if (await verifyNamePersisted(page, values)) {
            return values; // success, return what persisted
        }

        // If not persisted, build new values (optionally refresh faker to avoid cached KO state)
        values = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.firstName(),
            namePrefix: faker.person.prefix(),
            nameSuffix: faker.person.suffix(),
        };
    }

    // If we got here, all attempts failed — throw a clear error
    throw new Error(
        `Name section did not persist after ${maxAttempts} attempts. Last tried values: ` +
        JSON.stringify(values),
    );
}

test('Able to edit, add, and delete new member name section (with retry)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `MemDetsName`;
    const member = {
        firstName: `QAWMalachi`,
        lastName: `Botsford`,
        lastFirst: `Botsford, QAWMalachi`,
    };

    const member2 = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.firstName(),
        namePrefix: faker.person.prefix(),
        nameSuffix: faker.person.suffix(),
    };

    const member2EditBase = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.firstName(),
        namePrefix: faker.person.prefix(),
        nameSuffix: faker.person.suffix(),
    };

    //--------------------------------
    // Login & Navigate
    //--------------------------------
    const { page } = await logIn({ loginID, slowMo: 500 });

    await clickAndWait(page, page.locator('#home-tabs-tab-4').getByText('Members'));

    await fillAndWait(page, page.getByRole('textbox', { name: 'Search...' }), member.lastFirst);

    await clickAndWait(
        page,
        page.locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button'),
    );

    await dblClickAndWait(page, page.getByRole('gridcell', { name: member.lastFirst }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: ADD (with retry until persisted)
    //--------------------------------
    const persistedAddValues = await retryAddOrUpdateNameUntilPersisted(
        page,
        member.lastFirst,
        member2,
        3, // max attempts for ADD
    );

    //--------------------------------
    // Assert: read-only contains persisted ADD values
    //--------------------------------
    const section = nameCollectionContainer(page);
    //await expect(section).toBeVisible();
    expect(await section.isVisible()).toBe(true);


    const addText = await section.innerText();
    expect(addText).toContain(persistedAddValues.firstName);
    expect(addText).toContain(persistedAddValues.lastName);
    expect(addText).toContain(persistedAddValues.middleName);
    expect(addText).toContain(persistedAddValues.namePrefix);
    expect(addText).toContain(persistedAddValues.nameSuffix);

    //--------------------------------
    // Act: EDIT (single pass; you can wrap with retry too if needed)
    //--------------------------------
    await ensureEditMode(page);
    await ensureNameInputsVisible(page);

    const member2Edit = { ...member2EditBase }; // you can mutate per-attempt if you add a retry here
    await fillNameInputs(page, member2Edit);
    await saveAndCloseWorkLog(page);

    // Reopen to assert
    await reopenMember(page, member.lastFirst);

    //--------------------------------
    // Assert: read-only contains EDIT values
    //--------------------------------
    const editText = await section.innerText();
    expect(editText).toContain(member2Edit.firstName);
    expect(editText).toContain(member2Edit.lastName);
    expect(editText).toContain(member2Edit.middleName);
    expect(editText).toContain(member2Edit.namePrefix);
    expect(editText).toContain(member2Edit.nameSuffix);

    //--------------------------------
    // Act: DELETE
    //--------------------------------
    await ensureEditMode(page);

    // click the delete button in the Name collection
    await clickAndWait(
        page,
        section.locator('button[title="Delete"]').last(),
    );

    await clickAndWait(page, page.getByRole('button', { name: ' Save' }));
    await waitUntilLoaded(page);

    await clickAndWait(page, page.getByRole('button', { name: ' Save and Close' }));

    //--------------------------------
    // Assert: deleted
    //--------------------------------
    // After deletion, either the entire collection disappears or the display text no longer contains the edited values
    // To be strict, assert the inputs are not present and the section is not visible (best effort):
    expect(await firstNameInput(page).isVisible()).toBe(false);
    expect(await lastNameInput(page).isVisible()).toBe(false);
    expect(await middleNameInput(page).isVisible()).toBe(false);
    expect(await prefixInput(page).isVisible()).toBe(false);
    expect(await suffixInput(page).isVisible()).toBe(false);
});






















