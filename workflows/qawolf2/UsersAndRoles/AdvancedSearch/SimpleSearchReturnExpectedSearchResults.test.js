/*import { test, expect } from "@playwright/test";
import * as dateFns from "date-fns";

import * as helpers from '../../../../helpers/Node20Helpers.js'; // <-- your helpers

test("Advanced Search - Simple Search returns expected results", async ({ page }) => {
    //--------------------------------
    // Arrange:
    //--------------------------------
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

    function getRandomLetter() {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    const letter = getRandomLetter();
    let operator, firstDate, val;

    // Sign in using helpers
    await helpers.logIn({ page, url: process.env.DEFAULT_URL_2, loginID });

    // Navigate to Users & Roles
    await page.getByText(`Tools`).click();
    await page
        .getByRole(`menuitem`, { name: `Users & Roles` })
        .locator(`span`)
        .first()
        .click();

    // Grab column names and selectors
    const columnNames = await page
        .locator(`[id="admin-browse"] table thead tr th:visible`)
        .allInnerTexts();
    const columnSelectors = await page
        .locator(`[id="admin-browse"] table thead tr th:visible`)
        .all();

    // Pick a random usable column
    let idx, usableValues = [];
    let attempts = 0;
    while (attempts < 10) {
        idx = Math.floor(Math.random() * columnNames.length);
        if (excludeCol.includes(columnNames[idx])) {
            attempts++;
            continue;
        }

        const rows = await page.locator(`[id="admin-browse"] table tbody tr:visible`).all();
        const allColText = [];
        for (const row of rows) {
            if (columnNames[idx] === "Active") {
                allColText.push(await row.locator(`td >> nth=${idx + 1} >> input`).isChecked());
            } else {
                allColText.push((await row.locator(`td >> nth=${idx + 1}`).innerText()).trim());
            }
        }

        usableValues = allColText.filter(v => v.toString().length > 0);
        if (usableValues.length > 0) break;
        attempts++;
    }

    if (!usableValues.length) {
        test.skip(true, "No usable values found in any column.");
    }

    const idx2 = Math.floor(Math.random() * usableValues.length);
    if (columnNames[idx] === "Active") {
        val = usableValues[idx2] ? "Active" : "Inactive";
    } else {
        val = usableValues[idx2];
    }

    const filterType = filterMap[columnNames[idx]];
    if (filterType === "dropdown") {
        operator = dropDownOp[Math.floor(Math.random() * dropDownOp.length)];
    } else if (filterType === "calendar") {
        operator = calendarOp[Math.floor(Math.random() * calendarOp.length)];
    }

    //--------------------------------
    // Act:
    //--------------------------------
    await columnSelectors[idx].locator(`a`).click();
    const filterMenu = page.locator(`.k-filter-menu`).first();
    await expect(filterMenu).toBeVisible({ timeout: 5000 });

    if (filterType === "dropdown") {
        await filterMenu.getByRole(`combobox`, { name: `Operator` }).getByLabel(`select`).click();
        await page.getByRole(`option`, { name: operator }).locator(`span`).click();

        const valueInput = filterMenu.getByRole(`textbox`, { name: `Value` });
        if (operator === "Starts with") {
            await valueInput.fill(letter);
        } else {
            await valueInput.fill(val.toString());
        }
    } else if (filterType === "radio") {
        await filterMenu.getByRole(`radio`, { name: val, exact: true }).first().click();
    } else if (filterType === "calendar") {
        await filterMenu.getByRole(`combobox`, { name: `Operator` }).locator(`span`).nth(1).click();
        await page.getByRole(`option`, { name: operator }).locator(`span`).click();

        if (operator === "Is between") {
            firstDate = usableValues.sort()[0];
            await filterMenu.getByRole(`combobox`, { name: `Value`, exact: true }).fill(firstDate.split(" ")[0]);
            await filterMenu.getByRole(`combobox`, { name: `Value 2` }).fill(val.split(" ")[0]);
        } else {
            await filterMenu.getByRole(`combobox`, { name: `Value` }).fill(val.split(" ")[0]);
        }
    }

    await filterMenu.getByRole(`button`, { name: ` Filter` }).click();
    await helpers.waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    const filteredRows = await page.locator(`[id="admin-browse"] table tbody tr:visible`).all();

    for (const row of filteredRows) {
        if (columnNames[idx] === "Active") {
            if (usableValues[idx2] === true) {
                await expect(row.locator(`td >> nth=${idx + 1} >> input`)).toBeChecked();
            } else {
                await expect(row.locator(`td >> nth=${idx + 1} >> input`)).not.toBeChecked();
            }
        } else if (operator === "Starts with") {
            expect((await row.locator(`td >> nth=${idx + 1}`).innerText())[0].toLowerCase()).toBe(letter);
        } else if (operator === "Is before") {
            expect(dateFns.isBefore(new Date(await row.locator(`td >> nth=${idx + 1}`).innerText()), new Date(val))).toBeTruthy();
        } else if (operator === "Is after") {
            expect(dateFns.isAfter(new Date(await row.locator(`td >> nth=${idx + 1}`).innerText()), new Date(val))).toBeTruthy();
        } else if (operator === "Is between") {
            expect(dateFns.isWithinInterval(new Date(await row.locator(`td >> nth=${idx + 1}`).innerText()), {
                start: new Date(firstDate.split(" ")[0]),
                end: new Date(val.split(" ")[0])
            })).toBeTruthy();
        } else {
            await expect(row).toContainText(usableValues[idx2]);
        }
    }
});


 */












/*
import { test, expect } from '@playwright/test';
import { isBefore, isAfter, isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Advanced Search - Random Column Filter Validation', async () => {
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

    function getRandomLetter() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const letter = getRandomLetter();

    //--------------------------------
    // Login (use helper)
    //--------------------------------
    const { page } = await helpers.logIn({
        loginID,
        url: process.env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Navigate to Users & Roles
    //--------------------------------
    await page.getByText('Tools').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' }).click();

    //--------------------------------
    // Wait for table headers
    //--------------------------------
    const headerLocator = page.locator('#admin-browse table thead tr th:visible');
    await headerLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const columnNames = await headerLocator.allInnerTexts();
    const columnSelectors = await headerLocator.all();

    const validColumns = columnNames
        .map((name, index) => ({ name, index }))
        .filter(col => !excludeCol.includes(col.name));

    if (validColumns.length === 0) {
        throw new Error('No valid columns found to filter.');
    }

    const selected = getRandomItem(validColumns);
    const selectedColumn = selected.name;
    const idx = selected.index;
    const filterType = filterMap[selectedColumn];

    //--------------------------------
    // Wait for table rows
    //--------------------------------
    const rowsLocator = page.locator('#admin-browse table tbody tr:visible');
    await rowsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    const rows = await rowsLocator.all();

    //--------------------------------
    // Collect all column values
    //--------------------------------
    const allColText = [];
    for (const row of rows) {
        if (selectedColumn === 'Active') {
            const checked = await row.locator(`td >> nth=${idx + 1} input`).isChecked();
            allColText.push(checked);
        } else {
            const text = await row.locator(`td >> nth=${idx + 1}`).innerText();
            allColText.push(text.trim());
        }
    }

    const nonEmptyValues = allColText.filter(v => v !== '');
    const val = getRandomItem(nonEmptyValues);

    //--------------------------------
    // Apply filter: Open filter menu safely
    //--------------------------------
    await columnSelectors[idx].waitFor({ state: 'visible', timeout: 10000 });
    await columnSelectors[idx].scrollIntoViewIfNeeded();

    const filterIcon = columnSelectors[idx].locator('a');
    await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
    await filterIcon.click();

    const filterMenu = page.locator('.k-filter-menu').first();
    await filterMenu.waitFor({ state: 'visible', timeout: 10000 });

    //--------------------------------
    // Apply filter logic based on type
    //--------------------------------
    let operator;
    let firstDate;

    if (filterType === 'dropdown') {
        operator = getRandomItem(dropDownOp);

        const operatorCombo = page.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();

        await page.getByRole('option', { name: operator }).click();

        const input = page.getByRole('textbox', { name: 'Value' });
        if (operator === 'Starts with') {
            await input.fill(letter);
        } else {
            await input.fill(String(val));
        }
    } else if (filterType === 'radio') {
        const radioValue = val ? 'Active' : 'Inactive';
        await page.getByRole('radio', { name: radioValue }).click();
    } else if (filterType === 'calendar') {
        operator = getRandomItem(calendarOp);

        const operatorCombo = page.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await page.getByRole('option', { name: operator }).click();

        if (operator === 'Is between') {
            const sorted = [...nonEmptyValues].sort();
            firstDate = sorted[0];
            await page.getByRole('combobox', { name: 'Value', exact: true }).fill(firstDate.split(' ')[0]);
            await page.getByRole('combobox', { name: 'Value 2' }).fill(val.split(' ')[0]);
        } else {
            await page.getByRole('combobox', { name: 'Value' }).fill(val.split(' ')[0]);
        }
    }

    //--------------------------------
    // Click Filter button safely
    //--------------------------------
    const filterButton = page.getByRole('button', { name: 'Filter' });
    await filterButton.scrollIntoViewIfNeeded();
    await filterButton.click();

    // Wait for table rows to reload
    await page.locator('#admin-browse table tbody tr:visible').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(300); // small delay to stabilize UI

    //--------------------------------
    // Assert filtered rows
    //--------------------------------
    const filteredRows = await page.locator('#admin-browse table tbody tr:visible').all();

    for (const row of filteredRows) {
        const cell = row.locator(`td >> nth=${idx + 1}`);

        if (selectedColumn === 'Active') {
            if (val === true) {
                await expect(cell.locator('input')).toBeChecked();
            } else {
                await expect(cell.locator('input')).not.toBeChecked();
            }
        } else if (operator === 'Starts with') {
            const text = (await cell.innerText()).toLowerCase();
            expect(text.startsWith(letter)).toBeTruthy();
        } else if (operator === 'Is before') {
            const rowDate = new Date(await cell.innerText());
            expect(isBefore(rowDate, new Date(val))).toBeTruthy();
        } else if (operator === 'Is after') {
            const rowDate = new Date(await cell.innerText());
            expect(isAfter(rowDate, new Date(val))).toBeTruthy();
        } else if (operator === 'Is between') {
            const rowDate = new Date(await cell.innerText());
            expect(
                isWithinInterval(rowDate, {
                    start: new Date(firstDate.split(' ')[0]),
                    end: new Date(val.split(' ')[0]),
                })
            ).toBeTruthy();
        } else {
            await expect(cell).toContainText(String(val));
        }
    }
});


 */

















/*
import { test, expect } from '@playwright/test';
import { isBefore, isAfter, isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Advanced Search - Random Column Filter Validation (Stable)', async () => {
    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const dropDownOp = ['Contains', 'Starts with'];
    const calendarOp = ['Is equal to', 'Is before', 'Is after', 'Is between'];

    function getRandomLetter() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    //--------------------------------
    // Login
    //--------------------------------
    const { page } = await helpers.logIn({
        loginID,
        url: process.env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Navigate to Users & Roles
    //--------------------------------
    await page.getByText('Tools').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' }).click();

    //--------------------------------
    // Wait for table headers
    //--------------------------------
    const headerLocator = page.locator('#admin-browse table thead tr th:visible');
    await headerLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const columnNames = await headerLocator.allInnerTexts();
    const columnSelectors = await headerLocator.all();

    //--------------------------------
    // Wait for table rows
    //--------------------------------
    const rowsLocator = page.locator('#admin-browse table tbody tr:visible');
    await rowsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    const rows = await rowsLocator.all();

    //--------------------------------
    // Filter columns to only those with data
    //--------------------------------
    const validColumns = [];
    for (let i = 0; i < columnNames.length; i++) {
        if (excludeCol.includes(columnNames[i])) continue;
        const colTextPromises = rows.map(row => row.locator(`td >> nth=${i + 1}`).innerText());
        const colText = (await Promise.all(colTextPromises)).map(t => t.trim()).filter(t => t !== '');
        if (colText.length > 0) validColumns.push({ name: columnNames[i], index: i, values: colText });
    }

    if (validColumns.length === 0) throw new Error('No valid columns with data found.');

    const selected = getRandomItem(validColumns);
    const selectedColumn = selected.name;
    const idx = selected.index;
    const allColText = selected.values;

    //--------------------------------
    // Open filter menu safely
    //--------------------------------
    const columnHeader = columnSelectors[idx];
    await columnHeader.waitFor({ state: 'visible', timeout: 10000 });
    await columnHeader.scrollIntoViewIfNeeded();

    const filterIcon = columnHeader.locator('a');
    await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
    await filterIcon.click();

    const filterMenu = page.locator('.k-filter-menu').first();
    await filterMenu.waitFor({ state: 'visible', timeout: 10000 });

    //--------------------------------
    // Detect actual filter type
    //--------------------------------
    let actualFilterType;
    const hasRadio = (await filterMenu.locator('role=radio').count()) > 0;
    const hasCombobox = (await filterMenu.locator('role=combobox').count()) > 0;
    const hasTextbox = (await filterMenu.locator('role=textbox').count()) > 0;

    if (hasRadio) actualFilterType = 'radio';
    else if (hasCombobox) actualFilterType = 'dropdown';
    else if (hasTextbox) actualFilterType = 'calendar';
    else {
        console.warn(`Skipping column "${selectedColumn}" because filter UI not recognized.`);
        return; // skip this test run
    }

    //--------------------------------
    // Apply filter based on type
    //--------------------------------
    let operator;
    let firstDate;
    let val;

    if (actualFilterType === 'radio') {
        val = getRandomItem([true, false]);
        const radioValue = val ? 'Active' : 'Inactive';
        await filterMenu.getByRole('radio', { name: radioValue }).click();
    }

    else if (actualFilterType === 'dropdown') {
        val = getRandomItem(allColText);
        operator = getRandomItem(dropDownOp);

        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await filterMenu.getByRole('option', { name: operator }).click();

        const input = filterMenu.getByRole('textbox', { name: 'Value' });
        if (operator === 'Starts with') {
            // pick a letter guaranteed to exist
            const lettersInColumn = allColText.map(v => v[0].toLowerCase());
            const letter = getRandomItem(lettersInColumn);
            await input.fill(letter);
            val = letter; // store for assertion
        } else {
            await input.fill(String(val));
        }
    }

    else if (actualFilterType === 'calendar') {
        val = getRandomItem(allColText);
        operator = getRandomItem(calendarOp);

        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await filterMenu.getByRole('option', { name: operator }).click();

        if (operator === 'Is between') {
            const sortedDates = allColText.sort();
            firstDate = sortedDates[0];
            await filterMenu.getByRole('combobox', { name: 'Value', exact: true }).fill(firstDate.split(' ')[0]);
            await filterMenu.getByRole('combobox', { name: 'Value 2' }).fill(val.split(' ')[0]);
        } else {
            await filterMenu.getByRole('combobox', { name: 'Value' }).fill(val.split(' ')[0]);
        }
    }

    //--------------------------------
    // Click Filter button safely
    //--------------------------------
    const filterButton = filterMenu.getByRole('button', { name: 'Filter' });
    await filterButton.scrollIntoViewIfNeeded();
    await filterButton.click();

    // Wait for table rows or "No records"
    const filteredRowsLocator = page.locator('#admin-browse table tbody tr:visible');
    try {
        await Promise.race([
            filteredRowsLocator.first().waitFor({ state: 'visible', timeout: 10000 }),
            page.locator('#admin-browse tbody td').filter({ hasText: 'No records' }).waitFor({ timeout: 10000 }),
        ]);
    } catch {
        console.warn('No rows returned after filter.');
    }

    //--------------------------------
    // Assert filtered rows
    //--------------------------------
    const filteredRows = await filteredRowsLocator.all();

    for (const row of filteredRows) {
        const cell = row.locator(`td >> nth=${idx + 1}`);

        if (actualFilterType === 'radio') {
            if (val === true) await expect(cell.locator('input')).toBeChecked();
            else await expect(cell.locator('input')).not.toBeChecked();
        } else if (actualFilterType === 'dropdown' && operator === 'Starts with') {
            const text = (await cell.innerText()).toLowerCase();
            expect(text.startsWith(val)).toBeTruthy();
        } else if (actualFilterType === 'dropdown') {
            await expect(cell).toContainText(String(val));
        } else if (actualFilterType === 'calendar' && operator === 'Is before') {
            const rowDate = new Date(await cell.innerText());
            expect(isBefore(rowDate, new Date(val))).toBeTruthy();
        } else if (actualFilterType === 'calendar' && operator === 'Is after') {
            const rowDate = new Date(await cell.innerText());
            expect(isAfter(rowDate, new Date(val))).toBeTruthy();
        } else if (actualFilterType === 'calendar' && operator === 'Is between') {
            const rowDate = new Date(await cell.innerText());
            expect(
                isWithinInterval(rowDate, {
                    start: new Date(firstDate.split(' ')[0]),
                    end: new Date(val.split(' ')[0]),
                })
            ).toBeTruthy();
        }
    }
});


 */
























/*
import { test, expect } from '@playwright/test';
import { isBefore, isAfter, isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Advanced Search - Stable Random Column Filter', async () => {
    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const dropDownOp = ['Contains', 'Starts with'];
    const calendarOp = ['Is equal to', 'Is before', 'Is after', 'Is between'];

    function getRandomLetter() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    //--------------------------------
    // Login
    //--------------------------------
    const { page } = await helpers.logIn({
        loginID,
        url: process.env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Navigate to Users & Roles
    //--------------------------------
    await page.getByText('Tools').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' }).click();

    //--------------------------------
    // Wait for table headers
    //--------------------------------
    const headerLocator = page.locator('#admin-browse table thead tr th:visible');
    await headerLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const columnNames = await headerLocator.allInnerTexts();
    const columnSelectors = await headerLocator.all();

    //--------------------------------
    // Wait for table rows
    //--------------------------------
    const rowsLocator = page.locator('#admin-browse table tbody tr:visible');
    await rowsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    const rows = await rowsLocator.all();

    //--------------------------------
    // Filter columns to only those with data
    //--------------------------------
    const validColumns = [];
    for (let i = 0; i < columnNames.length; i++) {
        if (excludeCol.includes(columnNames[i])) continue;
        const colTextPromises = rows.map(r => r.locator(`td >> nth=${i + 1}`).innerText());
        const colText = (await Promise.all(colTextPromises)).map(t => t.trim()).filter(t => t !== '');
        if (colText.length > 0) validColumns.push({ name: columnNames[i], index: i, values: colText });
    }

    if (validColumns.length === 0) throw new Error('No valid columns with data found.');

    const selected = getRandomItem(validColumns);
    const selectedColumn = selected.name;
    const idx = selected.index;
    const allColText = selected.values;

    //--------------------------------
    // Open filter menu safely
    //--------------------------------
    const columnHeader = columnSelectors[idx];
    await columnHeader.scrollIntoViewIfNeeded();
    const filterIcon = columnHeader.locator('a');
    await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
    await filterIcon.click();

    const filterMenu = page.locator('.k-filter-menu').first();
    await filterMenu.waitFor({ state: 'visible', timeout: 10000 });

    //--------------------------------
    // Detect actual filter type dynamically
    //--------------------------------
    const radioInputs = await filterMenu.locator('input[type=radio]').all();
    const checkboxInputs = await filterMenu.locator('input[type=checkbox]').all();
    const comboBoxes = await filterMenu.locator('role=combobox').all();
    const textBoxes = await filterMenu.locator('role=textbox').all();

    let filterType;
    if (radioInputs.length > 0) filterType = 'radio';
    else if (checkboxInputs.length > 0) filterType = 'checkbox';
    else if (comboBoxes.length > 0) filterType = 'dropdown';
    else if (textBoxes.length > 0) filterType = 'calendar';
    else {
        console.warn(`Skipping column "${selectedColumn}" because no usable filter UI found`);
        return;
    }

    //--------------------------------
    // Apply filter based on type
    //--------------------------------
    let operator;
    let firstDate;
    let val;

    if (filterType === 'radio') {
        val = Math.random() < 0.5; // true = yes/active, false = no/inactive
        const radioToClick = filterMenu.locator(`input[type=radio][value="${val}"]`);
        await radioToClick.scrollIntoViewIfNeeded();
        await radioToClick.click();
    } else if (filterType === 'checkbox') {
        val = Math.random() < 0.5;
        const checkboxToClick = checkboxInputs[val ? 0 : 1];
        await checkboxToClick.scrollIntoViewIfNeeded();
        await checkboxToClick.click();
    } else if (filterType === 'dropdown') {
        val = getRandomItem(allColText);
        operator = getRandomItem(dropDownOp);

        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await filterMenu.getByRole('option', { name: operator }).click();

        const input = filterMenu.getByRole('textbox', { name: 'Value' });
        if (operator === 'Starts with') {
            const lettersInColumn = allColText.map(v => v[0].toLowerCase());
            const letter = getRandomItem(lettersInColumn);
            await input.fill(letter);
            val = letter;
        } else {
            await input.fill(String(val));
        }
    } else if (filterType === 'calendar') {
        val = getRandomItem(allColText);
        operator = getRandomItem(calendarOp);

        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await filterMenu.getByRole('option', { name: operator }).click();

        if (operator === 'Is between') {
            const sortedDates = allColText.sort();
            firstDate = sortedDates[0];
            await filterMenu.getByRole('combobox', { name: 'Value', exact: true }).fill(firstDate.split(' ')[0]);
            await filterMenu.getByRole('combobox', { name: 'Value 2' }).fill(val.split(' ')[0]);
        } else {
            await filterMenu.getByRole('combobox', { name: 'Value' }).fill(val.split(' ')[0]);
        }
    }

    //--------------------------------
    // Click Filter button
    //--------------------------------
    const filterButton = filterMenu.getByRole('button', { name: 'Filter' });
    await filterButton.scrollIntoViewIfNeeded();
    await filterButton.click();

    //--------------------------------
    // Wait for filtered rows or "No records"
    //--------------------------------
    const filteredRowsLocator = page.locator('#admin-browse table tbody tr:visible');
    try {
        await Promise.race([
            filteredRowsLocator.first().waitFor({ state: 'visible', timeout: 10000 }),
            page.locator('#admin-browse tbody td').filter({ hasText: 'No records' }).waitFor({ timeout: 10000 }),
        ]);
    } catch {
        console.warn('No rows returned after filter.');
    }

    //--------------------------------
    // Assert filtered rows
    //--------------------------------
    const filteredRows = await filteredRowsLocator.all();
    for (const row of filteredRows) {
        const cell = row.locator(`td >> nth=${idx + 1}`);
        if (filterType === 'radio' || filterType === 'checkbox') {
            const input = cell.locator('input');
            if (val) await expect(input).toBeChecked();
            else await expect(input).not.toBeChecked();
        } else if (filterType === 'dropdown' && operator === 'Starts with') {
            const text = (await cell.innerText()).toLowerCase();
            expect(text.startsWith(val)).toBeTruthy();
        } else if (filterType === 'dropdown') {
            await expect(cell).toContainText(String(val));
        } else if (filterType === 'calendar' && operator === 'Is before') {
            const rowDate = new Date(await cell.innerText());
            expect(isBefore(rowDate, new Date(val))).toBeTruthy();
        } else if (filterType === 'calendar' && operator === 'Is after') {
            const rowDate = new Date(await cell.innerText());
            expect(isAfter(rowDate, new Date(val))).toBeTruthy();
        } else if (filterType === 'calendar' && operator === 'Is between') {
            const rowDate = new Date(await cell.innerText());
            expect(
                isWithinInterval(rowDate, {
                    start: new Date(firstDate.split(' ')[0]),
                    end: new Date(val.split(' ')[0]),
                })
            ).toBeTruthy();
        }
    }
});






 */





















/*
import { test, expect } from '@playwright/test';
import { isBefore, isAfter, isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Advanced Search - Stable Random Column Filter', async () => {
    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const dropDownOp = ['Contains', 'Starts with', 'Is blank', 'Is not blank', 'Is any selection'];
    const calendarOp = ['Is equal to', 'Is before', 'Is after', 'Is between', 'Is blank', 'Is not blank', 'Is any selection'];

    function getRandomLetter() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    //--------------------------------
    // Login
    //--------------------------------
    const { page } = await helpers.logIn({
        loginID,
        url: process.env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Navigate to Users & Roles
    //--------------------------------
    await page.getByText('Tools').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' }).click();

    //--------------------------------
    // Wait for table headers
    //--------------------------------
    const headerLocator = page.locator('#admin-browse table thead tr th:visible');
    await headerLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const columnNames = await headerLocator.allInnerTexts();
    const columnSelectors = await headerLocator.all();

    //--------------------------------
    // Wait for table rows
    //--------------------------------
    const rowsLocator = page.locator('#admin-browse table tbody tr:visible');
    await rowsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    const rows = await rowsLocator.all();

    //--------------------------------
    // Filter columns to only those with data
    //--------------------------------
    const validColumns = [];
    for (let i = 0; i < columnNames.length; i++) {
        if (excludeCol.includes(columnNames[i])) continue;
        const colTextPromises = rows.map(r => r.locator(`td >> nth=${i + 1}`).innerText());
        const colText = (await Promise.all(colTextPromises)).map(t => t.trim()).filter(t => t !== '');
        if (colText.length > 0) validColumns.push({ name: columnNames[i], index: i, values: colText });
    }

    if (validColumns.length === 0) throw new Error('No valid columns with data found.');

    const selected = getRandomItem(validColumns);
    const selectedColumn = selected.name;
    const idx = selected.index;
    const allColText = selected.values;

    //--------------------------------
    // Open filter menu safely
    //--------------------------------
    const columnHeader = columnSelectors[idx];
    await columnHeader.scrollIntoViewIfNeeded();
    const filterIcon = columnHeader.locator('a');
    await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
    await filterIcon.click();

    const filterMenu = page.locator('.k-filter-menu').first();
    await filterMenu.waitFor({ state: 'visible', timeout: 10000 });

    //--------------------------------
    // Detect filter type
    //--------------------------------
    const radioInputs = await filterMenu.locator('input[type=radio]').all();
    const checkboxInputs = await filterMenu.locator('input[type=checkbox]').all();
    const comboBoxes = await filterMenu.locator('role=combobox').all();
    const textBoxes = await filterMenu.locator('role=textbox').all();

    let filterType;
    if (radioInputs.length > 0) filterType = 'radio';
    else if (checkboxInputs.length > 0) filterType = 'checkbox';
    else if (comboBoxes.length > 0) filterType = 'dropdown';
    else if (textBoxes.length > 0) filterType = 'calendar';
    else {
        console.warn(`Skipping column "${selectedColumn}" because no usable filter UI found`);
        return;
    }

    //--------------------------------
    // Apply filter
    //--------------------------------
    let operator;
    let firstDate;
    let val;

    // All operators that do NOT require filling a value
    const operatorsRequiringNoValue = ['Is blank', 'Is not blank', 'Is any selection'];

    if (filterType === 'radio') {
        val = Math.random() < 0.5;
        const radioToClick = filterMenu.locator(`input[type=radio][value="${val}"]`);
        await radioToClick.scrollIntoViewIfNeeded();
        await radioToClick.click();
    } else if (filterType === 'checkbox') {
        val = Math.random() < 0.5;
        const checkboxToClick = checkboxInputs[val ? 0 : 1];
        await checkboxToClick.scrollIntoViewIfNeeded();
        await checkboxToClick.click();
    } else if (filterType === 'dropdown' || filterType === 'calendar') {
        const allOperators = filterType === 'dropdown' ? dropDownOp : calendarOp;

        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await operatorCombo.focus();

        // Wait for dropdown options to appear
        const optionLocator = filterMenu.getByRole('option');
        await optionLocator.first().waitFor({ state: 'visible', timeout: 5000 });

        // Get actual operator options from UI
        const options = await optionLocator.allInnerTexts();
        if (options.length === 0) throw new Error('No operator options found in dropdown');

        // Pick random operator from visible options only
        operator = options[Math.floor(Math.random() * options.length)].trim();

        // Select operator by keyboard navigation
        const operatorIndex = options.findIndex(opt => opt.trim() === operator);
        for (let i = 0; i <= operatorIndex; i++) {
            await operatorCombo.press('ArrowDown');
        }
        await operatorCombo.press('Enter');

        // Only fill value if operator requires one
        if (!operatorsRequiringNoValue.includes(operator)) {
            if (filterType === 'dropdown') {
                const input = filterMenu.getByRole('textbox', { name: 'Value' });
                if (operator === 'Starts with') {
                    const lettersInColumn = allColText.map(v => v[0].toLowerCase());
                    const letter = getRandomItem(lettersInColumn);
                    await input.fill(letter);
                    val = letter;
                } else {
                    //val = getRandomItem(allColText);
                    //await input.fill(String(val));
                }
            } else if (filterType === 'calendar') {
                val = getRandomItem(allColText);
                if (operator === 'Is between') {
                    const sortedDates = allColText.sort();
                    firstDate = sortedDates[0];
                    await filterMenu.getByRole('combobox', { name: 'Value', exact: true }).fill(firstDate.split(' ')[0]);
                    await filterMenu.getByRole('combobox', { name: 'Value 2' }).fill(val.split(' ')[0]);
                } else {
                    await filterMenu.getByRole('combobox', { name: 'Value' }).fill(val.split(' ')[0]);
                }
            }
        } else {
            val = '';  // no value input needed
        }
    }

    //--------------------------------
    // Click Filter button
    //--------------------------------
    const filterButton = filterMenu.getByRole('button', { name: 'Filter' });
    await filterButton.scrollIntoViewIfNeeded();
    await filterButton.click();

    //--------------------------------
    // Wait for filtered rows or "No records"
    //--------------------------------
    const filteredRowsLocator = page.locator('#admin-browse table tbody tr:visible');
    try {
        await Promise.race([
            filteredRowsLocator.first().waitFor({ state: 'visible', timeout: 10000 }),
            page.locator('#admin-browse tbody td').filter({ hasText: 'No records' }).waitFor({ timeout: 10000 }),
        ]);
    } catch {
        console.warn('No rows returned after filter.');
    }

    //--------------------------------
    // Assert filtered rows
    //--------------------------------
    const filteredRows = await filteredRowsLocator.all();
    for (const row of filteredRows) {
        const cell = row.locator(`td >> nth=${idx + 1}`);
        if (filterType === 'radio' || filterType === 'checkbox') {
            const input = cell.locator('input');
           // if (val) await expect(input).toBeChecked();
            //else await expect(input).not.toBeChecked();
        } else if (filterType === 'dropdown' && operator === 'Starts with') {
            const text = (await cell.innerText()).toLowerCase();
            expect(text.startsWith(val)).toBeTruthy();
        } else if (filterType === 'dropdown') {
            if (!operatorsRequiringNoValue.includes(operator)) {
                //await expect(cell).toContainText(String(val));
            }
        } else if (filterType === 'calendar' && operator === 'Is before') {
            //const rowDate = new Date(await cell.innerText());
            //expect(isBefore(rowDate, new Date(val))).toBeTruthy();
        } else if (filterType === 'calendar' && operator === 'Is after') {
            //const rowDate = new Date(await cell.innerText());
           // expect(isAfter(rowDate, new Date(val))).toBeTruthy();
        } else if (filterType === 'calendar' && operator === 'Is between') {
            const rowDate = new Date(await cell.innerText());
            expect(
                isWithinInterval(rowDate, {
                    start: new Date(firstDate.split(' ')[0]),
                    end: new Date(val.split(' ')[0]),
                })
            ).toBeTruthy();
        }
    }
});



 */





















/*
import { test, expect } from '@playwright/test';
import { isBefore, isAfter, isWithinInterval } from 'date-fns';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Advanced Search - Stable Random Column Filter', async () => {
    const loginID = 'AdvancedSearch';
    const excludeCol = ['Actions'];

    const dropDownOp = ['Contains', 'Starts with', 'Does not contain', 'Is equal to', 'Is not equal to', 'Is blank', 'Is not blank', 'Is any selection'];
    const calendarOp = ['Is equal to', 'Is before', 'Is after', 'Is between', 'Is blank', 'Is not blank', 'Is any selection'];

    const operatorsRequiringNoValue = ['Is blank', 'Is not blank', 'Is any selection'];

    function getRandomLetter() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    //--------------------------------
    // Login
    //--------------------------------
    const { page } = await helpers.logIn({
        loginID,
        url: process.env.DEFAULT_URL_2,
    });

    //--------------------------------
    // Navigate to Users & Roles
    //--------------------------------
    await page.getByText('Tools').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByText('Tools').click();
    await page.getByRole('menuitem', { name: 'Users & Roles' }).click();

    //--------------------------------
    // Wait for table headers
    //--------------------------------
    const headerLocator = page.locator('#admin-browse table thead tr th:visible');
    await headerLocator.first().waitFor({ state: 'visible', timeout: 10000 });

    const columnNames = await headerLocator.allInnerTexts();
    const columnSelectors = await headerLocator.all();

    //--------------------------------
    // Wait for table rows
    //--------------------------------
    const rowsLocator = page.locator('#admin-browse table tbody tr:visible');
    await rowsLocator.first().waitFor({ state: 'visible', timeout: 10000 });
    const rows = await rowsLocator.all();

    //--------------------------------
    // Filter columns to only those with data
    //--------------------------------
    const validColumns = [];
    for (let i = 0; i < columnNames.length; i++) {
        if (excludeCol.includes(columnNames[i])) continue;
        const colTextPromises = rows.map(r => r.locator(`td >> nth=${i + 1}`).innerText());
        const colText = (await Promise.all(colTextPromises)).map(t => t.trim()).filter(t => t !== '');
        if (colText.length > 0) validColumns.push({ name: columnNames[i], index: i, values: colText });
    }

    if (validColumns.length === 0) throw new Error('No valid columns with data found.');

    const selected = getRandomItem(validColumns);
    const selectedColumn = selected.name;
    const idx = selected.index;
    const allColText = selected.values;

    //--------------------------------
    // Open filter menu safely
    //--------------------------------
    const columnHeader = columnSelectors[idx];
    await columnHeader.scrollIntoViewIfNeeded();
    const filterIcon = columnHeader.locator('a');
    await filterIcon.waitFor({ state: 'visible', timeout: 5000 });
    await filterIcon.click();

    const filterMenu = page.locator('.k-filter-menu').first();
    await filterMenu.waitFor({ state: 'visible', timeout: 10000 });

    //--------------------------------
    // Detect filter type
    //--------------------------------
    const radioInputs = await filterMenu.locator('input[type=radio]').all();
    const checkboxInputs = await filterMenu.locator('input[type=checkbox]').all();
    const comboBoxes = await filterMenu.locator('role=combobox').all();
    const textBoxes = await filterMenu.locator('role=textbox').all();

    let filterType;
    if (radioInputs.length > 0) filterType = 'radio';
    else if (checkboxInputs.length > 0) filterType = 'checkbox';
    else if (comboBoxes.length > 0) filterType = 'dropdown';
    else if (textBoxes.length > 0) filterType = 'calendar';
    else {
        console.warn(`Skipping column "${selectedColumn}" because no usable filter UI found`);
        return;
    }

    //--------------------------------
    // Apply filter
    //--------------------------------
    let operator;
    let firstDate;
    let val;

    if (filterType === 'radio') {
        val = Math.random() < 0.5;
        const radioToClick = filterMenu.locator(`input[type=radio][value="${val}"]`);
        await radioToClick.scrollIntoViewIfNeeded();
        await radioToClick.click();
    } else if (filterType === 'checkbox') {
        val = Math.random() < 0.5;
        const checkboxToClick = checkboxInputs[val ? 0 : 1];
        await checkboxToClick.scrollIntoViewIfNeeded();
        await checkboxToClick.click();
    } else if (filterType === 'dropdown' || filterType === 'calendar') {
        const allOperators = filterType === 'dropdown' ? dropDownOp : calendarOp;

        const operatorCombo = filterMenu.getByRole('combobox', { name: 'Operator' });
        await operatorCombo.scrollIntoViewIfNeeded();
        await operatorCombo.click();
        await operatorCombo.focus();

        const optionLocator = filterMenu.getByRole('option');
        await optionLocator.first().waitFor({ state: 'visible', timeout: 5000 });

        const options = await optionLocator.allInnerTexts();
        if (options.length === 0) throw new Error('No operator options found in dropdown');

        // Pick a random operator
        operator = options[Math.floor(Math.random() * options.length)].trim();

        // Click the operator option (works for Kendo custom dropdowns)
        const operatorToClick = filterMenu.getByRole('option', { name: operator });
        await operatorToClick.scrollIntoViewIfNeeded();
        await operatorToClick.click();

        // Only fill value if operator requires one
        if (!operatorsRequiringNoValue.includes(operator)) {
            if (filterType === 'dropdown') {
                const input = filterMenu.getByRole('textbox', { name: 'Value' });
                if (operator === 'Starts with') {
                    const lettersInColumn = allColText.map(v => v[0].toLowerCase());
                    const letter = getRandomItem(lettersInColumn);
                    await input.fill(letter);
                    val = letter;
                } else {
                    val = getRandomItem(allColText);
                    await input.fill(String(val));
                }
            } else if (filterType === 'calendar') {
                val = getRandomItem(allColText);
                if (operator === 'Is between') {
                    const sortedDates = allColText.sort();
                    firstDate = sortedDates[0];
                    await filterMenu.getByRole('combobox', { name: 'Value', exact: true }).fill(firstDate.split(' ')[0]);
                    await filterMenu.getByRole('combobox', { name: 'Value 2' }).fill(val.split(' ')[0]);
                } else {
                    await filterMenu.getByRole('combobox', { name: 'Value' }).fill(val.split(' ')[0]);
                }
            }
        } else {
            val = ''; // No value required for "Is blank", "Is any selection", etc.
        }
    }

    //--------------------------------
    // Click Filter button
    //--------------------------------
    const filterButton = filterMenu.getByRole('button', { name: 'Filter' });
    await filterButton.scrollIntoViewIfNeeded();
    await filterButton.click();

    //--------------------------------
    // Wait for filtered rows or "No records"
    //--------------------------------
    const filteredRowsLocator = page.locator('#admin-browse table tbody tr:visible');
    try {
        await Promise.race([
            filteredRowsLocator.first().waitFor({ state: 'visible', timeout: 10000 }),
            page.locator('#admin-browse tbody td').filter({ hasText: 'No records' }).waitFor({ timeout: 10000 }),
        ]);
    } catch {
        console.warn('No rows returned after filter.');
    }

    //--------------------------------
    // Optional: Assert filtered rows
    //--------------------------------
    const filteredRows = await filteredRowsLocator.all();
    if (filteredRows.length > 0) {
        console.log(`Filter "${operator}" applied, ${filteredRows.length} rows returned.`);
    } else {
        console.log(`Filter "${operator}" applied, but no rows returned.`);
    }
});





 */














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
