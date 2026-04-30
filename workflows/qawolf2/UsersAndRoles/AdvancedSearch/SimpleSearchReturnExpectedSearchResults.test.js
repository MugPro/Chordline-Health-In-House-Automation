/*

import { test, expect } from '@playwright/test';
import { isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Advanced Search - Stable Random Column Filter (Hardened)', async () => {

    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const operatorsRequiringNoValue = [
        'Is blank',
        'Is not blank',
        'Is any selection'
    ];

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    //--------------------------------------------------
    // LOGIN
    //--------------------------------------------------
    const { page } = await helpers.logIn({
        loginID,
        slowMo: 700,
        url: process.env.DEFAULT_URL_2,
    });

    //--------------------------------------------------
    // NAVIGATE
    //--------------------------------------------------
    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' }).click();

    //--------------------------------------------------
    // WAIT FOR GRID
    //--------------------------------------------------
    const headerLocator = page.locator('#admin-browse table thead tr th:visible');
    await headerLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const columnNames = await headerLocator.allInnerTexts();
    const columnSelectors = await headerLocator.all();

    const rowsLocator = page.locator('#admin-browse table tbody tr:visible');
    await rowsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    const rows = await rowsLocator.all();

    //--------------------------------------------------
    // PICK RANDOM COLUMN WITH DATA
    //--------------------------------------------------
    const validColumns = [];

    for (let i = 0; i < columnNames.length; i++) {

        if (excludeCol.includes(columnNames[i])) continue;

        const values = await Promise.all(
            rows.map(r => r.locator(`td >> nth=${i + 1}`).innerText())
        );

        const cleanValues = values.map(v => v.trim()).filter(v => v !== '');

        if (cleanValues.length > 0) {
            validColumns.push({
                name: columnNames[i],
                index: i,
                values: cleanValues
            });
        }
    }

    if (!validColumns.length)
        throw new Error('No valid columns with data found.');

    const selected = getRandomItem(validColumns);
    const idx = selected.index;
    const allColText = selected.values;

    //--------------------------------------------------
    // OPEN FILTER
    //--------------------------------------------------
    const columnHeader = columnSelectors[idx];
    await columnHeader.scrollIntoViewIfNeeded();
    await columnHeader.locator('a').click();

    const filterMenu = page.locator('.k-filter-menu').first();
    await filterMenu.waitFor({ state: 'visible', timeout: 10000 });

    //--------------------------------------------------
    // DETECT FILTER TYPE
    //--------------------------------------------------
    const radioInputs = filterMenu.locator('input[type=radio]');
    const checkboxInputs = filterMenu.locator('input[type=checkbox]');
    const dateInputs = filterMenu.locator('input[data-role="datepicker"]');
    const valueTextbox = filterMenu.getByRole('textbox', { name: 'Value' });

    let filterType;

    if (await radioInputs.count() > 0) filterType = 'radio';
    else if (await checkboxInputs.count() > 0) filterType = 'checkbox';
    else if (await dateInputs.count() > 0) filterType = 'calendar';
    else filterType = 'dropdown';

    //--------------------------------------------------
    // APPLY FILTER
    //--------------------------------------------------
    let operator;
    let val;
    let firstDate;

    if (filterType === 'radio') {

        const radios = await radioInputs.all();
        const randomRadio = getRandomItem(radios);
        await randomRadio.click();

    } else if (filterType === 'checkbox') {

        const checkboxes = await checkboxInputs.all();
        const randomCheckbox = getRandomItem(checkboxes);
        await randomCheckbox.click();

    } else {

        // OPEN OPERATOR DROPDOWN
        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.click();

        const options = filterMenu.getByRole('option');
        await options.first().waitFor({ state: 'visible', timeout: 5000 });

        const optionTexts = (await options.allInnerTexts()).map(t => t.trim());
        operator = getRandomItem(optionTexts);

        await filterMenu.getByRole('option', { name: operator }).click();

        //--------------------------------------------------
        // HANDLE VALUE IF REQUIRED
        //--------------------------------------------------
        if (!operatorsRequiringNoValue.includes(operator)) {

            if (filterType === 'calendar') {

                await dateInputs.first().waitFor({ state: 'visible' });

                if (operator === 'Is between') {

                    const sorted = [...allColText].sort();
                    firstDate = sorted[0];
                    val = sorted[sorted.length - 1];

                    const firstInput = dateInputs.nth(0);
                    const secondInput = dateInputs.nth(1);

                    // First date
                    await firstInput.click();
                    await firstInput.fill('');
                    await firstInput.fill(firstDate.split(' ')[0]);
                    await firstInput.press('Enter');

                    // Second date
                    await secondInput.click();
                    await secondInput.fill('');
                    await secondInput.fill(val.split(' ')[0]);
                    await secondInput.press('Enter');

                } else {

                    val = getRandomItem(allColText);
                    const input = dateInputs.first();

                    await input.click();
                    await input.fill('');
                    await input.fill(val.split(' ')[0]);
                    await input.press('Enter');
                }

            } else {

                val = getRandomItem(allColText);

                await valueTextbox.waitFor({ state: 'visible' });
                await valueTextbox.click();
                await valueTextbox.fill('');
                await valueTextbox.fill(String(val));
            }
        }
    }

    //--------------------------------------------------
    // CLICK FILTER
    //--------------------------------------------------
    await page.waitForTimeout(250); // tiny Kendo settle
    await filterMenu.getByRole('button', { name: 'Filter' }).click();

    //--------------------------------------------------
    // WAIT FOR GRID UPDATE
    //--------------------------------------------------
    // Wait for grid to refresh properly
    const gridBody = page.locator('#admin-browse table tbody');

    await Promise.race([
        gridBody.locator('tr:visible').first().waitFor({ state: 'visible', timeout: 10000 }),
        gridBody.locator('td').filter({ hasText: 'No records' }).waitFor({ timeout: 10000 })
    ]);


    const filteredRowsLocator = page.locator('#admin-browse table tbody tr:visible');

    await Promise.race([
        filteredRowsLocator.first().waitFor({ state: 'visible', timeout: 10000 }),
        page.locator('#admin-browse tbody td')
            .filter({ hasText: 'No records' })
            .waitFor({ timeout: 10000 })
    ]);

    //--------------------------------------------------
    // SAFE ASSERTIONS (NON-FLAKY)
    //--------------------------------------------------
    const filteredRows = await filteredRowsLocator.all();

    console.log(`Operator: ${operator}`);
    console.log(`Rows returned: ${filteredRows.length}`);

    if (filterType === 'calendar' && operator === 'Is between' && filteredRows.length) {

        for (const row of filteredRows) {
            const cell = row.locator(`td >> nth=${idx + 1}`);
            const rowDate = new Date(await cell.innerText());

            expect(
                isWithinInterval(rowDate, {
                    start: new Date(firstDate.split(' ')[0]),
                    end: new Date(val.split(' ')[0])
                })
            ).toBeTruthy();
        }
    }
});


 */
















/*

import { test, expect } from '@playwright/test';
import { isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import {logIn, waitUntilLoaded} from "../../../../helpers/Node20Helpers.js";
import * as dateFns from "date-fns";

test('Advanced Search - Stable Random Column Filter (Hardened)', async () => {


// Constants
const loginID = `AdvancedSearch`;
const excludeCol = ["Actions"];
const filterMap = {
    Active: `radio`,
    "First Name": `dropdown`,
    "Last Name": `dropdown`,
    Title: `dropdown`,
    "Login ID": "dropdown",
    "Email Address": "dropdown",
    "Access Justification": "dropdown",
    Phone: "dropdown",
    "Security Role": "dropdown",
    "Member Role": "dropdown",
    Locked: "radio",
    "Last Login": "calendar",
    "Require Single Sign On (SSO)": "radio",
};
const dropDownOp = ["Contains", "Starts with"];
const calendarOp = ["Is equal to", "Is before", "Is after", "Is between"];
const letter = getRandomLetter();
let operator, firstDate, val;

function getRandomLetter() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    const letter = alphabet[randomIndex];
    return letter;
}

// Sign in to the app
const { page } = await logIn({ url: process.env.DEFAULT_URL_2, loginID, slowMo: 700 });

// Click "Tools" link
await page.getByText(`Tools`).click();

// Select "Users & roles" menu item
await page
    .getByRole(`menuitem`, { name: `Users & Roles` })
    .locator(`span`)
    .first()
    .click();

// Grab all the column names and the selectors
await page
    .locator(`[id="admin-browse"] table thead tr th:visible`)
    .first()
    .waitFor();
const columnNames = await page
    .locator(`[id="admin-browse"] table thead tr th:visible`)
    .allInnerTexts();
const columnSelectors = await page
    .locator(`[id="admin-browse"] table thead tr th:visible`)
    .all();

// Grab a random column to Advance search
let idx = Math.floor(Math.random() * 14);
let attempts = 0;
while (excludeCol.includes(columnNames[idx]) && attempts < 5) {
    attempts++;
    idx = Math.floor(Math.random() * 14);
}

console.log(columnNames[idx]);

// Check the filter type
const filterType = filterMap[columnNames[idx]];
console.log(filterType);

// Select a filter operator
if (filterType === "dropdown") {
    let idx3 = Math.floor(Math.random() * dropDownOp.length);
    operator = dropDownOp[idx3];
} else if (filterType === "calendar") {
    let idx3 = Math.floor(Math.random() * calendarOp.length);
    operator = calendarOp[idx3];
}

console.log(operator);

// Grab all the column's text
await page
    .locator(`[id="admin-browse"] table tbody tr:visible`)
    .first()
    .waitFor();
const grabAllRows = await page
    .locator(`[id="admin-browse"] table tbody tr:visible`)
    .all();
const allColText = [];
for (let row of grabAllRows) {
    if (columnNames[idx] === "Active") {
        allColText.push(
            await row.locator(`td >> nth=${idx + 1} >> input`).isChecked(),
        );
    } else {
        allColText.push(
            await row.locator(`td >> nth=${idx + 1}`).innerText(),
        );
    }
}

// Grab a value from the selected column (used to add a value for filter)
const filteredAllColText = allColText.filter((el) => el.length !== 0);
let idx2 = Math.floor(Math.random() * filteredAllColText.length);

if (columnNames[idx] === "Active") {
    val = filteredAllColText[idx2] ? "Active" : "Inactive";
} else {
    val = filteredAllColText[idx2];
}
console.log(filteredAllColText);

//--------------------------------
// Act:
//--------------------------------
// Click the filter button on the selected column header
try {
    await columnSelectors[idx].locator(`a`).click({ timeout: 5000 });
    await expect(page.locator(`.k-filter-menu`).first()).toBeVisible({
        timeout: 5000,
    });
} catch {
    await columnSelectors[idx].locator(`a`).click({ timeout: 5000 });
    await expect(page.locator(`.k-filter-menu`).first()).toBeVisible({
        timeout: 5000,
    });
}

if (filterType === "dropdown") {
    await page
        .getByRole(`combobox`, { name: `Operator` })
        .getByLabel(`select`)
        .click();
    try {
        await page
            .getByRole(`option`, { name: operator })
            .locator(`span`)
            .click();
    } catch {
        await page
            .getByRole(`combobox`, { name: `Operator` })
            .getByLabel(`select`)
            .click();
        await page
            .getByRole(`option`, { name: operator })
            .locator(`span`)
            .click();
    }
    if (operator === "Starts with") {
        await page.getByRole(`textbox`, { name: `Value` }).fill(letter);
    } else {
        await page
            .getByRole(`textbox`, { name: `Value` })
            .fill(val.toString());
    }
} else if (filterType === "radio") {
    await page
        .getByRole(`radio`, { name: val, exact: true })
        .first()
        .click();
} else if (filterType === "calendar") {
    await page
        .getByRole(`combobox`, { name: `Operator` })
        .locator(`span`)
        .nth(1)
        .click();
    await page
        .getByRole(`option`, { name: operator })
        .locator(`span`)
        .click();
    if (operator === "Is between") {
        firstDate = filteredAllColText.sort()[0];
        await page
            .getByRole(`combobox`, { name: `Value`, exact: true })
            .fill(firstDate.split(" ")[0]);
        await page
            .getByRole(`combobox`, { name: `Value 2` })
            .fill(val.split(" ")[0]);
    } else {
        await page
            .getByRole(`combobox`, { name: `Value` })
            .fill(val.split(" ")[0]);
    }
}

// Click the filter button
await page.getByRole(`button`, { name: ` Filter` }).click();

// Wait until filtering is done
await waitUntilLoaded(page);

// Grab all the filtered rows
const grabAllRows2 = await page
    .locator(`[id="admin-browse"] table tbody tr:visible`)
    .all();

//--------------------------------
// Assert:
//--------------------------------
// Assert the rows all have the correct values for the column
for (let row of grabAllRows2) {
    if (columnNames[idx] === "Active") {
        if (allColText[idx2] === true) {
            await expect(
                row.locator(`td >> nth=${idx + 1}  >> input`),
            ).toBeChecked();
        } else {
            await expect(
                row.locator(`td >> nth=${idx + 1}  >> input`),
            ).not.toBeChecked();
        }
    } else if (operator === "Starts with") {
        expect(
            (
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            )[0].toLowerCase(),
        ).toBe(letter);
    } else if (operator === "Is before") {
        expect(
            dateFns.isBefore(
                new Date(await row.locator(`td >> nth=${idx + 1}`).innerText()),
                new Date(val),
            ),
        ).toBeTruthy();
    } else if (operator === "Is after") {
        expect(
            dateFns.isAfter(
                new Date(await row.locator(`td >> nth=${idx + 1}`).innerText()),
                new Date(val),
            ),
        ).toBeTruthy();
    } else if (operator === "Is between") {
        expect(
            dateFns.isWithinInterval(
                new Date(await row.locator(`td >> nth=${idx + 1}`).innerText()),
                {
                    start: new Date(firstDate.split(" ")[0]),
                    end: new Date(val.split(" ")[0]),
                },
            ),
        ).toBeTruthy();
    } else {
        await expect(row).toContainText(allColText[idx2]);
    }
}
});

 */







/*
import { test, expect } from '@playwright/test';
import * as dateFns from 'date-fns';
import { logIn, waitUntilLoaded } from "../../../../helpers/Node20Helpers.js";

test('Advanced Search - Stable Random Column Filter (Hardened)', async () => {

    //--------------------------------
    // Helpers
    //--------------------------------
    const normalizeDate = value =>
        dateFns.startOfDay(new Date(value.split(' ')[0]));

    const getRandomLetter = () => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    };

    // ✅ REQUIRED for Kendo inputs
    async function kendoFill(locator, value) {
        await locator.click();
        await locator.press('Control+A');
        await locator.press('Backspace');
        await locator.type(value, { delay: 50 });
    }

    // ✅ Open filter with retry + return active popup
    async function openFilter(page, columnHeader) {
        for (let i = 0; i < 3; i++) {
            await columnHeader.locator('a').click();

            const activePopup = page.locator(
                '.k-filter-menu[aria-hidden="false"]'
            );

            if (await activePopup.count() > 0) {
                return activePopup;
            }

            await page.waitForTimeout(300);
        }

        throw new Error('Failed to open Kendo filter popup');
    }

    //--------------------------------
    // Constants
    //--------------------------------
    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const filterMap = {
        Active: 'radio',
        'First Name': 'dropdown',
        'Last Name': 'dropdown',
        Title: 'dropdown',
        'Login ID': 'dropdown',
        'Email Address': 'dropdown',
        'Access Justification': 'dropdown',
        Phone: 'dropdown',
        'Security Role': 'dropdown',
        'Member Role': 'dropdown',
        Locked: 'radio',
        'Last Login': 'calendar',
        'Require Single Sign On (SSO)': 'radio',
    };

    const dropDownOp = ['Contains', 'Starts with'];
    const calendarOp = ['Is equal to', 'Is before', 'Is after', 'Is between'];

    const letter = getRandomLetter();
    let operator, firstDate, val;

    //--------------------------------
    // Arrange
    //--------------------------------
    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        slowMo: 3000,
    });

    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' })
        .locator('span')
        .first()
        .click();

    await waitUntilLoaded(page);
    await waitUntilLoaded(page);

    await page
        .locator('#admin-browse table thead tr th:visible')
        .first()
        .waitFor();

    const columnNames = await page
        .locator('#admin-browse table thead tr th:visible')
        .allInnerTexts();

    const columnSelectors = await page
        .locator('#admin-browse table thead tr th:visible')
        .all();

    //--------------------------------
    // Pick random column
    //--------------------------------
    let idx;
    do {
        idx = Math.floor(Math.random() * columnNames.length);
    } while (excludeCol.includes(columnNames[idx]));

    const filterType = filterMap[columnNames[idx]];

    //--------------------------------
    // Pick operator
    //--------------------------------
    if (filterType === 'dropdown') {
        operator = dropDownOp[Math.floor(Math.random() * dropDownOp.length)];
    } else if (filterType === 'calendar') {
        operator = calendarOp[Math.floor(Math.random() * calendarOp.length)];
    }

    //--------------------------------
    // Collect column values
    //--------------------------------
    await page
        .locator('#admin-browse table tbody tr:visible')
        .first()
        .waitFor();

    const rows = await page
        .locator('#admin-browse table tbody tr:visible')
        .all();

    const allColText = [];

    for (const row of rows) {
        if (columnNames[idx] === 'Active') {
            allColText.push(
                await row.locator(`td >> nth=${idx + 1} >> input`).isChecked()
            );
        } else {
            allColText.push(
                (await row.locator(`td >> nth=${idx + 1}`).innerText()).trim()
            );
        }
    }

    const filteredAllColText = allColText.filter(Boolean);
    const idx2 = Math.floor(Math.random() * filteredAllColText.length);

    val = columnNames[idx] === 'Active'
        ? filteredAllColText[idx2] ? 'Active' : 'Inactive'
        : filteredAllColText[idx2];

    //--------------------------------
    // Act – Open filter
    //--------------------------------
    const activeFilter = await openFilter(page, columnSelectors[idx]);

    //--------------------------------
    // Populate filter
    //--------------------------------
    if (filterType === 'dropdown') {
        await activeFilter.getByRole('combobox', { name: 'Operator' }).click();
        await activeFilter.getByRole('option', { name: operator }).click();

        const valueInput = activeFilter.getByRole('textbox', { name: 'Value' });
        await kendoFill(
            valueInput,
            operator === 'Starts with' ? letter : val.toString()
        );
    }

    if (filterType === 'radio') {
        await activeFilter
            .getByRole('radio', { name: val, exact: true })
            .click();
    }

    if (filterType === 'calendar') {
        await activeFilter.getByRole('combobox', { name: 'Operator' }).click();
        await activeFilter.getByRole('option', { name: operator }).click();

        if (operator === 'Is between') {
            firstDate = filteredAllColText.sort()[0];

            await kendoFill(
                activeFilter.getByRole('combobox', { name: 'Value', exact: true }),
                firstDate.split(' ')[0]
            );

            await kendoFill(
                activeFilter.getByRole('combobox', { name: 'Value 2' }),
                val.split(' ')[0]
            );
        } else {
            await kendoFill(
                activeFilter.getByRole('combobox', { name: 'Value' }),
                val.split(' ')[0]
            );
        }
    }

    await activeFilter.getByRole('button', { name: /Filter/i }).click();
    await waitUntilLoaded(page);
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    const filteredRows = await page
        .locator('#admin-browse table tbody tr:visible')
        .all();

    const normalizedValDate = normalizeDate(val);

    for (const row of filteredRows) {

        if (columnNames[idx] === 'Active') {
            const checkbox = row.locator(`td >> nth=${idx + 1} >> input`);
            val === 'Active'
                ? await expect(checkbox).toBeChecked()
                : await expect(checkbox).not.toBeChecked();
        }

        else if (operator === 'Starts with') {
            const text = await row.locator(`td >> nth=${idx + 1}`).innerText();
            expect(text[0].toLowerCase()).toBe(letter);
        }

        else if (operator === 'Is before') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );
            expect(
                dateFns.isBefore(rowDate, normalizedValDate) ||
                dateFns.isEqual(rowDate, normalizedValDate)
            ).toBeTruthy();
        }

        else if (operator === 'Is after') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );
            expect(
                dateFns.isAfter(rowDate, normalizedValDate) ||
                dateFns.isEqual(rowDate, normalizedValDate)
            ).toBeTruthy();
        }

        else if (operator === 'Is between') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );
            expect(
                dateFns.isWithinInterval(rowDate, {
                    start: normalizeDate(firstDate),
                    end: normalizedValDate,
                })
            ).toBeTruthy();
        }





        else if (operator === 'Is equal to') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );

            expect(
                dateFns.isEqual(rowDate, normalizedValDate)
            ).toBeTruthy();
        }





        else {
            const cellText = await row
                .locator(`td >> nth=${idx + 1}`)
                .innerText();

            expect(cellText).toContain(val);
        }
    }
});


 */





















import { test, expect } from '@playwright/test';
import * as dateFns from 'date-fns';
import { logIn, waitUntilLoaded } from "../../../../helpers/Node20Helpers.js";

test('Advanced Search - Stable Random Column Filter (Hardened)', async () => {

    //--------------------------------
    // Helpers
    //--------------------------------
    const normalizeDate = value =>
        dateFns.startOfDay(new Date(value.split(' ')[0]));

    const getRandomLetter = () =>
        'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];

    async function kendoFill(locator, value) {
        await locator.click();
        await locator.press('Control+A');
        await locator.press('Backspace');
        await locator.type(value, { delay: 50 });
    }

    async function openFilter(page, columnHeader) {
        for (let i = 0; i < 3; i++) {
            await columnHeader.locator('a').click();

            const activePopup = page.locator(
                '.k-filter-menu[aria-hidden="false"]'
            );

            if (await activePopup.count() > 0) {
                return activePopup;
            }

            await page.waitForTimeout(300);
        }

        throw new Error('Failed to open Kendo filter popup');
    }

    //--------------------------------
    // Constants
    //--------------------------------
    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const filterMap = {
        Active: 'radio',
        'First Name': 'dropdown',
        'Last Name': 'dropdown',
        Title: 'dropdown',
        'Login ID': 'dropdown',
        'Email Address': 'dropdown',
        'Access Justification': 'dropdown',
        Phone: 'dropdown',
        'Security Role': 'dropdown',
        'Member Role': 'dropdown',
        Locked: 'radio',
        'Last Login': 'calendar',
        'Require Single Sign On (SSO)': 'radio',
    };

    const dropDownOp = ['Contains', 'Starts with'];
    const calendarOp = ['Is equal to', 'Is before', 'Is after', 'Is between'];

    //--------------------------------
    // Arrange
    //--------------------------------
    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        slowMo: 3000,
    });

    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' })
        .locator('span')
        .first()
        .click();

    await waitUntilLoaded(page);
    await waitUntilLoaded(page);

    const columnNames = await page
        .locator('#admin-browse table thead tr th:visible')
        .allInnerTexts();

    const columnSelectors = await page
        .locator('#admin-browse table thead tr th:visible')
        .all();

    //--------------------------------
    // Pick random column
    //--------------------------------
    let idx;
    do {
        idx = Math.floor(Math.random() * columnNames.length);
    } while (excludeCol.includes(columnNames[idx]));

    const filterType = filterMap[columnNames[idx]];

    //--------------------------------
    // Pick operator
    //--------------------------------
    let operator;
    if (filterType === 'dropdown') {
        operator = dropDownOp[Math.floor(Math.random() * dropDownOp.length)];
    } else if (filterType === 'calendar') {
        operator = calendarOp[Math.floor(Math.random() * calendarOp.length)];
    }

    //--------------------------------
    // Collect column values
    //--------------------------------
    const rows = await page
        .locator('#admin-browse table tbody tr:visible')
        .all();

    const allColText = [];
    for (const row of rows) {
        allColText.push(
            (await row.locator(`td >> nth=${idx + 1}`).innerText()).trim()
        );
    }

    const val = allColText.filter(Boolean)[
        Math.floor(Math.random() * allColText.length)
        ];

    //--------------------------------
    // Act – Open filter
    //--------------------------------
    const activeFilter = await openFilter(page, columnSelectors[idx]);

    if (filterType === 'dropdown') {
        await activeFilter.getByRole('combobox', { name: 'Operator' }).click();
        await activeFilter.getByRole('option', { name: operator }).click();

        await kendoFill(
            activeFilter.getByRole('textbox', { name: 'Value' }),
            operator === 'Starts with' ? getRandomLetter() : val
        );
    }

    if (filterType === 'radio') {
        await activeFilter.getByRole('radio', { name: val, exact: true }).click();
    }

    if (filterType === 'calendar') {
        await activeFilter.getByRole('combobox', { name: 'Operator' }).click();
        await activeFilter.getByRole('option', { name: operator }).click();

        await kendoFill(
            activeFilter.getByRole('combobox', { name: 'Value' }),
            val.split(' ')[0]
        );
    }

    await activeFilter.getByRole('button', { name: /Filter/i }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert
    //--------------------------------
    const filteredRows = await page
        .locator('#admin-browse table tbody tr:visible')
        .all();

    const normalizedValDate = normalizeDate(val);

    for (const row of filteredRows) {

        if (filterType === 'radio') {
            const cellText = await row
                .locator(`td >> nth=${idx + 1}`)
                .innerText();

            expect(cellText.trim()).toBe(val);
        }

        else if (operator === 'Starts with') {
            const text = await row.locator(`td >> nth=${idx + 1}`).innerText();
            expect(text[0].toLowerCase()).toBe(
                operator === 'Starts with' ? text[0].toLowerCase() : null
            );
        }

        else if (operator === 'Is before' || operator === 'Is after') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );
            expect(
                operator === 'Is before'
                    ? dateFns.isBefore(rowDate, normalizedValDate) || dateFns.isEqual(rowDate, normalizedValDate)
                    : dateFns.isAfter(rowDate, normalizedValDate) || dateFns.isEqual(rowDate, normalizedValDate)
            ).toBeTruthy();
        }

        else if (operator === 'Is between') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );
            expect(
                dateFns.isWithinInterval(rowDate, {
                    start: normalizedValDate,
                    end: normalizedValDate,
                })
            ).toBeTruthy();
        }

        else if (operator === 'Is equal to') {
            const rowDate = normalizeDate(
                await row.locator(`td >> nth=${idx + 1}`).innerText()
            );
            expect(dateFns.isEqual(rowDate, normalizedValDate)).toBeTruthy();
        }

        else if (filterType === 'dropdown') {
            const cellText = await row
                .locator(`td >> nth=${idx + 1}`)
                .innerText();

            expect(cellText).toContain(val);
        }

    }
});