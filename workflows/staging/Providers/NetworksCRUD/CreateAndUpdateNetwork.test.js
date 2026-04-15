// CreateAndUpdateNetwork.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
// Faker v8 API
import { faker } from '@faker-js/faker';
// Date helpers
import { format, addWeeks } from 'date-fns';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 200;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);

/** Click a locator and then wait a bit */
const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

/** Fill a locator and then wait a bit */
const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

/* -------------------------------------------
   Save & Close with one retry on error dialog
   ------------------------------------------- */
const saveAndCloseWithOneRetry = async (
    page,
    {
        saveButtonName = /Save and Close/i,
        okButtonName = 'Okay',
        errorText = 'A problem occurred during',
        errorCheckTimeoutMs = 4000,
        dialogCloseTimeoutMs = 10000,
        detailsLabel = 'Network',
    } = {}
) => {
    const saveBtn = page.getByRole('button', { name: saveButtonName });
    const errorLocator = page.getByText(errorText);
    const detailsDialog = page.getByLabel(detailsLabel);

    // Attempt one save; detect error quickly; otherwise wait for dialog close.
    const attemptSaveOnce = async () => {
        await saveBtn.click();

        try {
            await expect(errorLocator).toBeVisible({ timeout: errorCheckTimeoutMs });
            return 'error';
        } catch {
            // No error detected: wait for the detail dialog to close (return to grid)
            try {
                await expect(detailsDialog).toBeHidden({ timeout: dialogCloseTimeoutMs });
            } catch {
                // If the dialog label changes or doesn't hide, ignore here.
            }
            return 'success';
        }
    };

    // First attempt
    const firstResult = await attemptSaveOnce();
    if (firstResult === 'success') return;

    // Handle error: click "Okay", wait for the error to disappear
    await page.getByRole('button', { name: okButtonName }).click();
    await expect(errorLocator).toBeHidden({ timeout: 5000 });

    // Second attempt
    const secondResult = await attemptSaveOnce();
    if (secondResult === 'error') {
        // Assert error visible, then end the test
        await expect(errorLocator).toBeVisible();
        throw new Error('Save and Close failed twice: application returned an error dialog both times.');
    }
};

test('Create a Network and then update it, verifying grid and detail values', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `NetworksCrud`;
    const networkCode = `${loginID}${Date.now()}`;
    const networkDesc = `${loginID} created ${Date.now()}`;

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Providers
    await page.getByText(`Tools`).click();
    await page.getByText(`Providers`, { exact: true }).click();

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    // Click the "Networks" tab
    await page.getByText(`Networks`, { exact: true }).click();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+New" button
    await clickAndWait(page, page.getByRole(`button`, { name: /New/i }));
    await waitUntilLoaded(page);

    // Verify the "New Network" pop up displays
    await expect(page.getByText(`New Network`, { exact: true })).toBeVisible();

    // Fill in network code and description
    await fillAndWait(page, page.locator(`#ntwk_code`), networkCode);
    await fillAndWait(page, page.locator(`#ntwk_description`), networkDesc);

    // Click the "Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: /Save and Close/i }));
    //await waitUntilLoaded(page);

    // Fill in Network Code and search
    await page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`)
        .fill(networkCode);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: After Create
    //--------------------------------
    // Assert the network code is visible in the table
    const row = page.locator(`[id="browse-grid"] table tbody tr:has-text("${networkCode}")`);
    await expect(row).toBeVisible();

    // Double click the Network row to open the network page
    await row.dblclick();

    // Assert the Network code persists
    await expect(page.getByLabel(`Network`).getByText(networkCode)).toBeVisible();

    // Assert the Network description persists
    await expect(page.getByLabel(`Network`).getByText(networkDesc)).toBeVisible();

    //--------------------------------
    // Arrange: Edit values
    //--------------------------------
    const today = new Date();
    const networkDescEdit = `${loginID} edited ${Date.now()}`;
    const comment = faker.lorem.sentence();
    // For typing dates into inputs, UI expects "MM dd yyyy"
    const startDate = format(today, 'MM dd yyyy');
    const startDateFormat = format(today, 'MM/dd/yyyy');
    const endDateObj = addWeeks(today, 1);
    const endDate = format(endDateObj, 'MM dd yyyy');
    const endDateFormat = format(endDateObj, 'MM/dd/yyyy');

    const address1 = faker.location.streetAddress();
    const city = faker.location.city();
    const zip = faker.location.zipCode();
    const state = faker.location.state();

    //--------------------------------
    // Act: Edit
    //--------------------------------
    // Click the edit button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Edit` }));
    await waitUntilLoaded(page);

    // Fill description and comment
    await fillAndWait(page, page.locator(`#ntwk_description`), networkDescEdit);
    await fillAndWait(page, page.locator(`#ntwk_comment`), comment);

    // Fill start date (clear then type with spaces "MM dd yyyy")
    await page.locator(`#ntwk_start_date`).clear();
    await page.locator(`#ntwk_start_date`).type(startDate);
    await pause(page);

    // Fill end date
    await page.locator(`#ntwk_end_date`).clear();
    await page.locator(`#ntwk_end_date`).type(endDate);
    await pause(page);

    // Address 1, City
    await fillAndWait(page, page.locator(`#ntwk_address_1`), address1);
    await fillAndWait(page, page.locator(`#ntwk_city`), city);

    // State (autocomplete + select)
    await fillAndWait(page, page.locator(`input[name="ntwk_state_id_input"]`), state);
    await clickAndWait(page, page.getByRole(`option`, { name: state }));

    // Zip Code
    await fillAndWait(page, page.locator(`#ntwk_zip_code`), zip);

    // Save and Close (with one retry)
    await saveAndCloseWithOneRetry(page, {
        saveButtonName: /Save and Close/i,
        okButtonName: 'Okay',
        errorText: 'A problem occurred during',
        detailsLabel: 'Network',
    });
    //await waitUntilLoaded(page);

    // Search for the Network Code again
    await page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`)
        .fill(networkCode);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: After Edit
    //--------------------------------
    // Assert the network code is visible in the table
    const rowAfterEdit = page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${networkCode}")`
    );
    await expect(rowAfterEdit).toBeVisible();

    // Double click the Network row to open the network page
    await rowAfterEdit.dblclick();

    // Assert the Network code persists
    await expect(page.getByLabel(`Network`).getByText(networkCode)).toBeVisible();

    // Assert the updated description persists
    await expect(page.getByLabel(`Network`).getByText(networkDescEdit)).toBeVisible();

    // Assert the Comment persists
    await expect(page.getByLabel(`Network`).getByText(comment)).toBeVisible();

    // Assert the Start/End dates persist in "MM/dd/yyyy"
    await expect(
        page.getByLabel(`Network`).getByText(startDateFormat, { exact: true })
    ).toBeVisible();

    await expect(
        page.getByLabel(`Network`).getByText(endDateFormat, { exact: true })
    ).toBeVisible();

    // Assert the Address1, City, State, Zip persist
    await expect(page.getByText(address1)).toBeVisible();
    await expect(page.getByText(city, { exact: true })).toBeVisible();
    await expect(page.getByText(state, { exact: true })).toBeVisible();
    await expect(page.getByText(zip, { exact: true })).toBeVisible();
});