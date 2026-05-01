/*



import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';



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



const rowLocatorForGroup = (page, providerId) =>
    page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Group")`
    );

const searchForProvider = async (page, providerId) => {
    const searchBox = page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`);
    await fillAndWait(page, searchBox, providerId);
    await clickAndWait(page, page.locator(`#admin-search-button`));
    await waitUntilLoaded(page);
};

test('Create and Update Group persists all entered data', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants
    const loginID = `ProvGroupCRUD`;
    const providerId = `${loginID}${Date.now()}`;

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Providers
    await clickAndWait(page, page.getByText(`Tools`));
    await clickAndWait(page, page.getByText(`Providers`, { exact: true }));

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    //--------------------------------
    // Act: Create new Group
    //--------------------------------
    // Click the "+New" button
    await clickAndWait(page, page.locator(`#grid-toolbar-new-button-menu`));

    // Click the "Group" option
    await clickAndWait(page, page.getByRole(`menuitem`, { name: `Group` }).locator(`a`));

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
    // Assert: Created Group visible and opens
    //--------------------------------
    // Assert the {providerId} is visible in the table
    await expect(rowLocatorForGroup(page, providerId)).toBeVisible();

    // Double click the {providerId} to open the provider page
    await rowLocatorForGroup(page, providerId).dblclick();

    // Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId)
    ).toBeVisible();

    //--------------------------------
    // Arrange for Update:
    //--------------------------------
    const taxId = `QAWTAX${Date.now()}`;
    const providerName = `QAWGroupCRUD${Date.now()}`;
    const language = `English`;

    //--------------------------------
    // Act: Update Group fields
    //--------------------------------
    // Click the "Edit" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Edit` }));

    await waitUntilLoaded(page);

    // Fill in Tax ID #
    await fillAndWait(page, page.locator(`#prov_tax_id`), taxId);

    // Fill in "Provider Name"
    await fillAndWait(page, page.locator(`#prov_provider_name`), providerName);

    // Preferred spoken language (scoped/exact)
    const spokenCombo = page.locator(`input[name="prov_preferred_spoken_language_id_input"]`);
    await selectFromComboboxExact(page, spokenCombo, language);

    // Preferred written language (scoped/exact)
    const writtenCombo = page.locator(`input[name="prov_preferred_written_language_id_input"]`);
    await selectFromComboboxExact(page, writtenCombo, language);

    // Grab all specialties from the dedicated listbox source
    const specialties = await page.locator(`[id="prov_specialties_listbox"] li`).allInnerTexts();

    // Select a random specialty
    const selectedSpecialty = specialties[Math.floor(Math.random() * specialties.length)];

    // Target the "Specialty & Taxonomy *" combobox (first one per your snippet)
    const specialtyCombobox = page
        .locator(`#record-div div`)
        .filter({ hasText: `Specialty & Taxonomy *` })
        .getByRole(`combobox`)
        .first();

    // Use scoped combobox selection to avoid strict-mode issues
    await selectFromComboboxExact(page, specialtyCombobox, selectedSpecialty);

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
    await expect(rowLocatorForGroup(page, providerId)).toBeVisible();

    // Double click the {providerId} to open the provider page
    await rowLocatorForGroup(page, providerId).dblclick();

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

    // Assert the "Specialty" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(selectedSpecialty)
    ).toBeVisible();
});

 */





























import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";




test('Create and Update Group persists all entered data', async () => {



    //--------------------------------
// Arrange:
//--------------------------------
// Constants
    const loginID = `ProvGroupCRUD`;
    const providerId = `${loginID}${Date.now()}`;

// Log in
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



// Navigate to Tools > Providers
    await page.getByText(`Tools`).hover();
    await page.getByText(`Providers`).click();

// Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

//--------------------------------
// Act:
//--------------------------------
// Click the "+New" button
    await page.locator(`#grid-toolbar-new-button-menu`).click();

// Click the "Group" option
    await page.getByRole(`menuitem`, { name: `Group` }).locator(`a`).click();

    await waitUntilLoaded(page);

// Fill in "Provider ID"
    await page.locator(`#prov_provider_identifier`).fill(providerId);

    await waitUntilLoaded(page);

// Click the "Save and Close" button
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

// Search for the {providerId}
    await page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`)
        .fill(providerId);
    await page.locator(`#admin-search-button`).click();

//--------------------------------
// Assert:
//--------------------------------
// Assert the {providerId} is visible in the table
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Group")`,
        ),
    ).toBeVisible();

// Double click the {providerId} to open the network page
    await page
        .locator(
            `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Group")`,
        )
        .dblclick();

    await waitUntilLoaded(page);

// Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId),
    ).toBeVisible();















    //--------------------------------
// Arrange:
//--------------------------------
// Constants
    const taxId = `QAWTAX${Date.now()}`;
    const providerName = `QAWGroupCRUD${Date.now()}`;
    const language = `English`;

//--------------------------------
// Act:
//--------------------------------
// Click the "Edit" button
    await page.getByRole(`button`, { name: ` Edit` }).click();

    await waitUntilLoaded(page);

// Fill in Tax ID #
    await page.locator(`#prov_tax_id`).fill(taxId);

// Fill in "Provider Name"
    await page.locator(`#prov_provider_name`).fill(providerName);

// Fill in a preferred spoken language and select
    await page
        .locator(`input[name="prov_preferred_spoken_language_id_input"]`)
        .fill(language);
    await page.getByRole(`option`, { name: language }).click();

// Fill in preferred written language and select
    await page
        .locator(`input[name="prov_preferred_written_language_id_input"]`)
        .fill(language);
    await page.getByRole(`option`, { name: language }).click();

// Grab all specialties
    const specialties = await page
        .locator(`[id="prov_specialties_listbox"] li`)
        .allInnerTexts();

// Select a random specialty
    const selectedSpecialty =
        specialties[Math.floor(Math.random() * specialties.length)];
    await page
        .locator(`#record-div div`)
        .filter({ hasText: `Specialty & Taxonomy *` })
        .getByRole(`combobox`)
        .first()
        .fill(selectedSpecialty);
    await page.getByRole(`option`, { name: selectedSpecialty }).click();

    await waitUntilLoaded(page);

// Click "Save and Close" button
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    await waitUntilLoaded(page);

// Search for the {providerId}
    await page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`)
        .fill(providerId);
    await page.locator(`#admin-search-button`).click();

//--------------------------------
// Assert:
//--------------------------------
// Assert the {providerId} is visible in the table
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Group")`,
        ),
    ).toBeVisible();

// Double click the {providerId} to open the network page
    await page
        .locator(
            `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Group")`,
        )
        .dblclick();

    await waitUntilLoaded(page);

// Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId),
    ).toBeVisible();

// Assert the "Tax ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(taxId),
    ).toBeVisible();

// Assert the "Provider Name" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerName),
    ).toBeVisible();

// Assert the "Preferred Spoken Langauge" persists
    await expect(page.locator(`#prov_preferred_spoken_language_id`)).toContainText(
        language,
    );

// Assert the "Preferred Written Langauge" persists
    await expect(page.locator(`#prov_preferred_written_language_id`)).toContainText(
        language,
    );

// Assert the "Specialty" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(selectedSpecialty),
    ).toBeVisible();


});