import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 0;

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
   Scoped combobox selection helper
   ------------------------------------------- */
/**
 * Types into a combobox to trigger its listbox and then clicks the exact matching option
 * within the listbox associated via aria-controls. This avoids strict-mode violations when
 * multiple options match (e.g., "English" in multiple lists).
 */
const selectFromComboboxExact = async (page, comboboxLocator, exactOptionText) => {
    // Fill to trigger options
    await fillAndWait(page, comboboxLocator, exactOptionText);

    // Scope to the listbox tied to THIS combobox
    const listboxId = await comboboxLocator.getAttribute('aria-controls');
    if (!listboxId) {
        throw new Error('Combobox has no aria-controls attribute to locate its listbox.');
    }
    const listbox = page.locator(`#${listboxId}`);

    // Ensure listbox is visible
    await expect(listbox).toBeVisible({ timeout: 10000 });

    // Click the exact option INSIDE this listbox (avoid substring matches)
    await clickAndWait(page, listbox.getByRole('option', { name: exactOptionText, exact: true }));
    //await waitUntilLoaded(page);
};

/* -------------------------------------------
   Convenience helpers for this test
   ------------------------------------------- */
const rowLocatorForProvider = (page, providerId) =>
    page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Facility")`
    );

const searchForProvider = async (page, providerId) => {
    const searchBox = page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`);
    await fillAndWait(page, searchBox, providerId);
    await clickAndWait(page, page.locator(`#admin-search-button`));
    await waitUntilLoaded(page);
};

test('Create and Update Facility persists all entered data', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants
    const loginID = `ProvFacCRUD`;
    const providerId = `${loginID}${Date.now()}`;

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Providers
    await clickAndWait(page, page.getByText(`Tools`));
    await clickAndWait(page, page.getByText(`Providers`, { exact: true }));

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    //--------------------------------
    // Act: Create new Facility
    //--------------------------------
    // Click the "+New" button
    await clickAndWait(page, page.locator(`#grid-toolbar-new-button-menu`));

    // Click the "Facility" option
    await clickAndWait(page, page.getByRole(`menuitem`, { name: `Facility` }).locator(`a`));

    await waitUntilLoaded(page);

    // Fill in "Provider ID"
    await fillAndWait(page, page.locator(`#prov_provider_identifier`), providerId);

    await waitUntilLoaded(page);

    // Click the "Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save and Close` }));
    await waitUntilLoaded(page);

    // Search for the {providerId}
    await searchForProvider(page, providerId);

    //--------------------------------
    // Assert: Created Facility visible and opens
    //--------------------------------
    // Assert the {providerId} is visible in the table
    await expect(rowLocatorForProvider(page, providerId)).toBeVisible();

    // Double click the {providerId} to open the provider page
    await rowLocatorForProvider(page, providerId).dblclick();

    // Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId)
    ).toBeVisible();

    //--------------------------------
    // Arrange for Update:
    //--------------------------------
    const taxId = `QAWTAX${Date.now()}`;
    const providerName = `QAWFacCRUD${Date.now()}`;
    const language = `English`;

    //--------------------------------
    // Act: Update Facility fields
    //--------------------------------
    // Click the "Edit" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Edit` }));

    await waitUntilLoaded(page);

    // Fill in Tax ID #
    await fillAndWait(page, page.locator(`#prov_tax_id`), taxId);

    // Fill in "Provider Name"
    await fillAndWait(page, page.locator(`#prov_provider_name`), providerName);

    // Fill in a preferred spoken language and select (scoped, exact)
    const spokenCombo = page.locator(`input[name="prov_preferred_spoken_language_id_input"]`);
    await selectFromComboboxExact(page, spokenCombo, language);

    // Fill in preferred written language and select (scoped, exact)
    const writtenCombo = page.locator(`input[name="prov_preferred_written_language_id_input"]`);
    await selectFromComboboxExact(page, writtenCombo, language);

    await waitUntilLoaded(page);
    // Click "Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save and Close` }));
    await waitUntilLoaded(page);

    // Search for the {providerId} again
    await searchForProvider(page, providerId);

    //--------------------------------
    // Assert: Updates persisted
    //--------------------------------
    // Assert the {providerId} is visible in the table
    await expect(rowLocatorForProvider(page, providerId)).toBeVisible();

    // Double click the {providerId} to open the provider page
    await rowLocatorForProvider(page, providerId).dblclick();

    // Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId)
    ).toBeVisible();

    // Assert the "Tax ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(taxId)
    ).toBeVisible();

    // Assert the "Provider Name" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerName)
    ).toBeVisible();

    // Assert the "Preferred Spoken Language" persists
    await expect(page.locator(`#prov_preferred_spoken_language_id`)).toContainText(language);

    // Assert the "Preferred Written Language" persists
    await expect(page.locator(`#prov_preferred_written_language_id`)).toContainText(language);
});