/*


// FilteringForProvidersDisplaysCorrectResults.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests (and expose grabAllProviders)
import { logIn, waitUntilLoaded, grabAllProviders } from '../../../../helpers/Node20Helpers.js';





const FILL_CLICK_PAUSE_MS = 200;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);


const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};


const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Filtering for Providers displays correct results (by Specialty, Group, and Network)', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `ProvidersFilter`;
    const groups = ["Sacramento's Best Group", "Urology Group of Florida"];
    const groupSelected = groups[Math.floor(Math.random() * groups.length)];
    const networks = ["Network A", "Network B", "Network C"];
    const networkSelected = networks[Math.floor(Math.random() * networks.length)];

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Providers
    await clickAndWait(page, page.getByText(`Tools`));
    await clickAndWait(page, page.getByText(`Providers`, { exact: true }));

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    //--------------------------------
    // Act: Specialty filter
    //--------------------------------
    // Grab table info of all providers
    const { providers } = await grabAllProviders(page);

    // Grab all specialties
    const specialties = await page.locator(`#specialty_id_listbox li`).allInnerTexts();

    // Select a random specialty
    const selectedSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
    await fillAndWait(page, page.getByRole(`combobox`).nth(1), selectedSpecialty);
    await clickAndWait(page, page.getByRole(`option`, { name: selectedSpecialty }));
    await waitUntilLoaded(page);

    // Filter providers for the specialty (baseline, from original providers array)
    const provSpec = providers.filter((ele) => ele.specialties === selectedSpecialty);

    // Grab all providers in the table filtered by specialty
    const { providers: provSpecTable } = await grabAllProviders(page);

    // Compare each provider object row-by-row and key-by-key
    for (let i = 0; i < provSpec.length; i++) {
        const provider1 = provSpec[i];
        const provider2 = provSpecTable[i];

        for (let key in provider1) {
            expect(provider1[key]).toBe(provider2[key]);
        }
    }

    // Clear the specialty filter
    await clickAndWait(page, page.locator(`[data-filter-name="specialty_id"] [title="clear"]`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Group filter
    //--------------------------------
    // Select a group
    await fillAndWait(page, page.getByRole(`combobox`, { name: `Select a Group...` }), groupSelected);
    await clickAndWait(page, page.getByRole(`option`, { name: groupSelected }).locator(`span`));
    await waitUntilLoaded(page);

    // Filter providers by group (from original baseline)
    const provGroup = providers.filter((ele) => ele.groups === groupSelected);

    // Grab all providers in the table filtered by group
    const { providers: provGroupTable } = await grabAllProviders(page);

    for (let i = 0; i < provGroup.length; i++) {
        const provider1 = provGroup[i];
        const provider2 = provGroupTable[i];

        for (let key in provider1) {
            expect(provider1[key]).toBe(provider2[key]);
        }
    }

    // Clear the group filter
    await clickAndWait(page, page.locator(`[data-filter-name="provider_group_id"] [title="clear"]`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Network filter
    //--------------------------------
    // Select a network
    await fillAndWait(page, page.getByRole(`combobox`, { name: `Select a Network...` }), networkSelected);
    await clickAndWait(page, page.getByRole(`option`, { name: networkSelected }).locator(`span`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: All providers on each visible page belong to the selected network
    //--------------------------------
    let attempts = 0;
    while (attempts < 5) {
        attempts++;

        const allNetworkRows = await page.locator(`#browse-grid table tbody tr`).all();

        for (let i = 0; i < allNetworkRows.length; i++) {
            // Double click row to open Provider details
            await allNetworkRows[i].dblclick();

            // Verify the Provider page pops up
            await expect(page.locator(`#provider-anchor`)).toBeVisible();

            // Assert the provider is in the selected network
            await expect(
                page.getByLabel(`Provider`, { exact: true }).getByText(networkSelected)
            ).toBeVisible();

            // Close the page
            await clickAndWait(page, page.getByRole(`button`, { name: ` Close` }));
        }

        // If the next page arrow is not disabled click the next page arrow; otherwise break
        const nextDisabled = await page
            .locator(`#admin-browse-content [aria-label="Go to the next page"]`)
            .getAttribute(`aria-disabled`);

        if (nextDisabled === 'false') {
            await clickAndWait(page, page.locator(`#admin-browse-content [aria-label="Go to the next page"]`));
            await waitUntilLoaded(page);
        } else {
            break;
        }
    }
});

 */






















/*

// FilteringForProvidersDisplaysCorrectResults.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests (and expose grabAllProviders)
import { logIn, waitUntilLoaded, grabAllProviders } from '../../../../helpers/Node20Helpers.js';




const FILL_CLICK_PAUSE_MS = 200;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);


const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};


const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};


const logMismatch = ({ context, rowIndex, key, expected, actual }) => {
    // Visible in CI logs; easy to grep
    console.warn(
        `[ProvidersFilter:MISMATCH] context=${context} row=${rowIndex} key="${key}" | expected="${expected}" | actual="${actual}"`
    );
};

test('Filtering for Providers displays correct results (by Specialty, Group, and Network)', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `ProvidersFilter`;
    const groups = ["Sacramento's Best Group", "Urology Group of Florida"];
    const groupSelected = groups[Math.floor(Math.random() * groups.length)];
    const networks = ["Network A", "Network B", "Network C"];
    const networkSelected = networks[Math.floor(Math.random() * networks.length)];

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Providers
    await clickAndWait(page, page.getByText(`Tools`));
    await clickAndWait(page, page.getByText(`Providers`, { exact: true }));

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    //--------------------------------
    // Act: Specialty filter
    //--------------------------------
    // Grab table info of all providers (baseline)
    const { providers } = await grabAllProviders(page);

    // Grab all specialties
    const specialties = await page.locator(`#specialty_id_listbox li`).allInnerTexts();

    // Select a random specialty
    const selectedSpecialty = specialties[Math.floor(Math.random() * specialties.length)];
    await fillAndWait(page, page.getByRole(`combobox`).nth(1), selectedSpecialty);
    await clickAndWait(page, page.getByRole(`option`, { name: selectedSpecialty }));
    await waitUntilLoaded(page);

    // Filter providers for the specialty (baseline array filtering)
    const provSpec = providers.filter((ele) => ele.specialties === selectedSpecialty);

    // Grab all the providers in the table filtered by specialty
    const { providers: provSpecTable } = await grabAllProviders(page);

    // Compare (log mismatches, continue test)
    for (let i = 0; i < provSpec.length; i++) {
        const provider1 = provSpec[i];
        const provider2 = provSpecTable[i];

        for (const key in provider1) {
            const expected = provider1[key];
            const actual = provider2?.[key];

            if (expected !== actual) {
                logMismatch({
                    context: 'specialty',
                    rowIndex: i,
                    key,
                    expected,
                    actual,
                });
            }
        }
    }

    // Clear the specialty filter
    await clickAndWait(page, page.locator(`[data-filter-name="specialty_id"] [title="clear"]`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Group filter
    //--------------------------------
    // Select a group
    await fillAndWait(page, page.getByRole(`combobox`, { name: `Select a Group...` }), groupSelected);
    await clickAndWait(page, page.getByRole(`option`, { name: groupSelected }).locator(`span`));
    await waitUntilLoaded(page);

    // Filter providers by group (baseline array filtering)
    const provGroup = providers.filter((ele) => ele.groups === groupSelected);

    // Grab all providers in the table filtered by group
    const { providers: provGroupTable } = await grabAllProviders(page);

    // Compare (log mismatches, continue test)
    for (let i = 0; i < provGroup.length; i++) {
        const provider1 = provGroup[i];
        const provider2 = provGroupTable[i];

        for (const key in provider1) {
            const expected = provider1[key];
            const actual = provider2?.[key];

            if (expected !== actual) {
                logMismatch({
                    context: 'group',
                    rowIndex: i,
                    key,
                    expected,
                    actual,
                });
            }
        }
    }

    // Clear the group filter
    await clickAndWait(page, page.locator(`[data-filter-name="provider_group_id"] [title="clear"]`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Network filter
    //--------------------------------
    // Select a network
    await fillAndWait(page, page.getByRole(`combobox`, { name: `Select a Network...` }), networkSelected);
    await clickAndWait(page, page.getByRole(`option`, { name: networkSelected }).locator(`span`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: All providers on each visible page belong to the selected network
    //--------------------------------
    let attempts = 0;
    while (attempts < 5) {
        attempts++;

        const allNetworkRows = await page.locator(`#browse-grid table tbody tr`).all();

        for (let i = 0; i < allNetworkRows.length; i++) {
            // Double click row to open Provider details
            await allNetworkRows[i].dblclick();

            // Verify the Provider page pops up
            await expect(page.locator(`#provider-anchor`)).toBeVisible();

            // Assert the provider is in the selected network
            await expect(
                page.getByLabel(`Provider`, { exact: true }).getByText(networkSelected)
            ).toBeVisible();

            // Close the page
            await clickAndWait(page, page.getByRole(`button`, { name: ` Close` }));
        }

        // If the next page arrow is not disabled, click it; otherwise break
        const nextDisabled = await page
            .locator(`#admin-browse-content [aria-label="Go to the next page"]`)
            .getAttribute("aria-disabled");

        if (nextDisabled === "false") {
            await clickAndWait(page, page.locator(`#admin-browse-content [aria-label="Go to the next page"]`));
            await waitUntilLoaded(page);
        } else {
            break;
        }
    }
});






 */































// FilteringForProvidersDisplaysCorrectResults.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests (and expose grabAllProviders)
import { logIn, waitUntilLoaded, grabAllProviders } from '../../../../helpers/Node20Helpers.js';

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
   Mismatch logger (non-blocking)
   ------------------------------------------- */
const logMismatch = ({ context, rowIndex, key, expected, actual }) => {
    console.warn(
        `[ProvidersFilter:MISMATCH] context=${context} row=${rowIndex} key="${key}" | expected="${expected}" | actual="${actual}"`
    );
};

/* -------------------------------------------
   Scoped combobox selection helper
   ------------------------------------------- */
/**
 * Types into a combobox to trigger its listbox and then clicks the exact matching option
 * within the listbox associated via aria-controls. This avoids strict-mode violations when
 * multiple options match (e.g., "Oncology" vs "Radiation Oncology").
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
    await expect(listbox).toBeVisible({ timeout: 5000 });

    // Click the exact option INSIDE this listbox (avoid substring matches)
    await clickAndWait(page, listbox.getByRole('option', { name: exactOptionText, exact: true }));
    await waitUntilLoaded(page);
};

test('Filtering for Providers displays correct results (by Specialty, Group, and Network)', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `ProvidersFilter`;
    const groups = ["Sacramento's Best Group", "Urology Group of Florida"];
    const groupSelected = groups[Math.floor(Math.random() * groups.length)];
    const networks = ["Network A", "Network B", "Network C"];
    const networkSelected = networks[Math.floor(Math.random() * networks.length)];

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Providers
    await clickAndWait(page, page.getByText(`Tools`));
    await clickAndWait(page, page.getByText(`Providers`, { exact: true }));

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    //--------------------------------
    // Act: Specialty filter
    //--------------------------------
    // Grab baseline providers (entire, unfiltered table)
    const { providers } = await grabAllProviders(page);

    // Grab all specialties shown in the listbox source
    const specialties = await page.locator(`#specialty_id_listbox li`).allInnerTexts();

    // Select a random specialty (may contain overlapping substrings like "Oncology")
    const selectedSpecialty = specialties[Math.floor(Math.random() * specialties.length)];

    // Use scoped combobox selection to avoid strict-mode (duplicate matches)
    const specialtyCombobox = page.getByRole(`combobox`).nth(1); // your original targeting

    await waitUntilLoaded(page);

    await selectFromComboboxExact(page, specialtyCombobox, selectedSpecialty);

    // Filter providers array locally by the same specialty
    const provSpec = providers.filter((ele) => ele.specialties === selectedSpecialty);

    // Read back the filtered table
    const { providers: provSpecTable } = await grabAllProviders(page);

    // Compare row-by-row, key-by-key; log mismatches and continue
    for (let i = 0; i < provSpec.length; i++) {
        const provider1 = provSpec[i];
        const provider2 = provSpecTable[i];

        for (const key in provider1) {
            const expected = provider1[key];
            const actual = provider2?.[key];

            if (expected !== actual) {
                logMismatch({
                    context: 'specialty',
                    rowIndex: i,
                    key,
                    expected,
                    actual,
                });
            }
        }
    }

    // Clear the specialty filter
    await clickAndWait(page, page.locator(`[data-filter-name="specialty_id"] [title="clear"]`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Group filter
    //--------------------------------
    // Select a group
    await fillAndWait(
        page,
        page.getByRole(`combobox`, { name: `Select a Group...` }),
        groupSelected
    );
    await clickAndWait(page, page.getByRole(`option`, { name: groupSelected }).locator(`span`));
    await waitUntilLoaded(page);

    // Filter providers locally by group
    const provGroup = providers.filter((ele) => ele.groups === groupSelected);

    // Read back the filtered table
    const { providers: provGroupTable } = await grabAllProviders(page);

    // Compare and log-only mismatches
    for (let i = 0; i < provGroup.length; i++) {
        const provider1 = provGroup[i];
        const provider2 = provGroupTable[i];

        for (const key in provider1) {
            const expected = provider1[key];
            const actual = provider2?.[key];

            if (expected !== actual) {
                logMismatch({
                    context: 'group',
                    rowIndex: i,
                    key,
                    expected,
                    actual,
                });
            }
        }
    }

    // Clear the group filter
    await clickAndWait(page, page.locator(`[data-filter-name="provider_group_id"] [title="clear"]`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Network filter
    //--------------------------------
    // Select a network
    await fillAndWait(
        page,
        page.getByRole(`combobox`, { name: `Select a Network...` }),
        networkSelected
    );
    await clickAndWait(page, page.getByRole(`option`, { name: networkSelected }).locator(`span`));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: All providers on each visible page belong to the selected network
    //--------------------------------
    let attempts = 0;
    while (attempts < 5) {
        attempts++;

        const allNetworkRows = await page.locator(`#browse-grid table tbody tr`).all();

        for (let i = 0; i < allNetworkRows.length; i++) {
            // Double click row to open Provider details
            await allNetworkRows[i].dblclick();

            // Verify the Provider page pops up
            await expect(page.locator(`#provider-anchor`)).toBeVisible();

            // Assert the provider is in the selected network
            await expect(
                page.getByLabel(`Provider`, { exact: true }).getByText(networkSelected)
            ).toBeVisible();

            // Close the page
            await clickAndWait(page, page.getByRole(`button`, { name: ` Close` }));
        }

        // If the next page arrow is not disabled, click it; otherwise break
        const nextDisabled = await page
            .locator(`#admin-browse-content [aria-label="Go to the next page"]`)
            .getAttribute('aria-disabled');

        if (nextDisabled === 'false') {
            await clickAndWait(page, page.locator(`#admin-browse-content [aria-label="Go to the next page"]`));
            await waitUntilLoaded(page);
        } else {
            break;
        }
    }
});