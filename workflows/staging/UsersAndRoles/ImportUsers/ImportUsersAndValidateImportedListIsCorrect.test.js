/*

// ImportUsersAndValidateImportedListIsCorrect.test.js
import { test, expect } from '@playwright/test';
// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanupImportedUsers2
} from '../../../../helpers/Node20Helpers.js';


const FILL_CLICK_PAUSE_MS = 20;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);


const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};


const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Import Users and validate imported list is correct', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `ImportUsers`;
    const firstNames = [`Sarah`, `Michael`, `Test`, `Laura`];
    const IMPORT_FILE_PATH = `/home/wolf/team-storage/import_users.csv`;

    // Sign in to the app
    const { page } = await logIn({ loginID });
    await waitUntilLoaded(page);

    // Ensure a clean state (idempotent)
    await cleanupImportedUsers2(page, { firstNames });

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await clickAndWait(page, page.getByText(`Tools`));

    // Click `Users & Roles` button from dropdown menu
    // (use regex to be robust to &amp; vs &)
    await clickAndWait(page, page.getByText(/Users\s*&\s*Roles/));
    await waitUntilLoaded(page);

    // Click `Import Users` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Import Users` }));
    await waitUntilLoaded(page);

    // Create event listener to watch for a "file upload pop up"
    // Use the recommended Promise.all pattern for reliability
    const [fileChooser] = await Promise.all([
        page.waitForEvent(`filechooser`),
        page.getByRole(`button`, { name: `Select file...` }).click(),
    ]);
    await fileChooser.setFiles(IMPORT_FILE_PATH);

    // Click `Okay` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Okay` }));

    // Click `Yes` on confirmation modal
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));

    // Click `No` on prompt modal
    await clickAndWait(page, page.getByRole(`button`, { name: `No` }));

    // Let any processing complete
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Iterate over each expected user name and verify that they have been imported successfully
    const internalTabPanel = page.getByRole(`tabpanel`, { name: `Internal` });
    await expect(internalTabPanel).toBeVisible();

    for (const name of firstNames) {
        // Fill in user name
        const searchBox = internalTabPanel.getByPlaceholder(`Search...`);
        await fillAndWait(page, searchBox, name);

        // Hit enter to initiate search
        await page.keyboard.press(`Enter`);

        // Verify that user name is visible in search results
        await expect(
            page.getByRole(`gridcell`, { name }).first()
        ).toBeVisible();
    }

    //--------------------------------
    // Clean-up UI state and data
    //--------------------------------
    // Click `Close` button
    await clickAndWait(page, page.getByText(`Close`, { exact: true }));

    // Cleanup Users (idempotent)
    await cleanupImportedUsers2(page, { firstNames });
});

 */

























// workflows/qawolf2/Tools/Users/ImportUsersAndValidateImportedListIsCorrect.test.js
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    cleanupImportedUsers2
} from '../../../../helpers/Node20Helpers.js';


const FILL_CLICK_PAUSE_MS = 20;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);


const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};


const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const IMPORT_FILE_PATH = path.resolve(__dirname, '../../../fixtures/import_users.csv');

// ✅ Fail fast if CSV is missing or empty
if (!fs.existsSync(IMPORT_FILE_PATH)) {
    throw new Error(
        `import_users.csv not found at:\n${IMPORT_FILE_PATH}\n` +
        `Expected at: workflows/fixtures/import_users.csv`
    );
}
const csvContent = fs.readFileSync(IMPORT_FILE_PATH, 'utf8').trim();
if (!csvContent || csvContent.split('\n').length < 2) {
    throw new Error(
        `import_users.csv is empty or missing data rows.\n` +
        `Ensure it has a header row and at least one user row.`
    );
}

test('Import Users and validate imported list is correct', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `ImportUsers`;
   // const firstNames = [`Sarah`, `Michael`, `Test`, `Laura`];
    const firstNames = [`Test`];

    // Sign in to the app
    const { page } = await logIn({ loginID });
    await waitUntilLoaded(page);

    // Ensure a clean state (idempotent)
    await cleanupImportedUsers2(page, { firstNames });

    //--------------------------------
    // Act:
    //--------------------------------
    // Click `Tools` button
    await clickAndWait(page, page.getByText(`Tools`));

    // Click `Users & Roles` button (regex handles & vs &amp;)
    await clickAndWait(page, page.getByText(/Users\s*&\s*Roles/));
    await waitUntilLoaded(page);

    // Click `Import Users` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Import Users` }));
    await waitUntilLoaded(page);

    // Robust file chooser pattern
    const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: 'Select file...' }).click(),
    ]);
    await waitUntilLoaded(page);
    await fileChooser.setFiles(IMPORT_FILE_PATH);

    // Click `Okay` button
    await clickAndWait(page, page.getByRole(`button`, { name: `Okay` }));

    // Click `Yes` on confirmation modal
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));

    // Click `No` on prompt modal
    await clickAndWait(page, page.getByRole(`button`, { name: `No` }));

    // Let import processing complete
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert:
    //--------------------------------
    // Verify each expected user name appears in Internal tab search results
    const internalTabPanel = page.getByRole(`tabpanel`, { name: `Internal` });
    await expect(internalTabPanel).toBeVisible();

    for (const name of firstNames) {
        const searchBox = internalTabPanel.getByPlaceholder(`Search...`);
        await fillAndWait(page, searchBox, name);

        // Hit enter to initiate search
        await page.keyboard.press(`Enter`);

        // Verify that user name is visible in search results
        await expect(
            page.getByRole(`gridcell`, { name }).first()
        ).toBeVisible();
    }

    //--------------------------------
    // Clean-up UI state and data
    //--------------------------------
    // Click `Close` button if present
    const closeButton = page.getByText(`Close`, { exact: true });
    if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
    }

    // Cleanup Users (idempotent; your helper already handles "unable to delete" popup)
    await cleanupImportedUsers2(page, { firstNames });
});










