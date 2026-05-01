import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';

// Optional faker (supports both modern and legacy APIs)
import { faker as fakerLib } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 20;

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
 * multiple options match.
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
const rowLocatorForIndividual = (page, providerId) =>
    page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${providerId}"):has-text("Individual")`
    );

const searchForProvider = async (page, providerId) => {
    const searchBox = page
        .getByRole(`dialog`, { name: `Manage Providers` })
        .getByPlaceholder(`Search...`);
    await fillAndWait(page, searchBox, providerId);
    await clickAndWait(page, page.locator(`#admin-search-button`));
    //await waitUntilLoaded(page);
};

/* -------------------------------------------
   Faker compatibility helpers
   ------------------------------------------- */
const faker = fakerLib;
const getFirstName = () =>
    (faker.person?.firstName ? faker.person.firstName() : faker.name.firstName());
const getLastName = () =>
    (faker.person?.lastName ? faker.person.lastName() : faker.name.lastName());

test('Create and Update Individual Provider persists all entered data', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants
    const loginID = `ProvIndivCRUD`;
    const providerId = `${loginID}${Date.now()}`;

    // Per your snippet: firstName = faker.name.lastName(); lastName = faker.name.firstName();
    // We mirror the intent but with compatibility helpers.
    const firstName = getLastName();
    const lastName = getFirstName();
    const credentials = ["AGNP", "DO", "FNP", "MD"][Math.floor(Math.random() * 4)];

    // Log in
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    // Navigate to Tools > Providers
    await clickAndWait(page, page.getByText(`Tools`));
    await clickAndWait(page, page.getByText(`Providers`, { exact: true }));

    // Verify the "Manage Providers" is visible
    await expect(page.getByText(`Manage Providers`)).toBeVisible();

    //--------------------------------
    // Act: Create new Individual
    //--------------------------------
    // Click the "+New" button
    await clickAndWait(page, page.locator(`#grid-toolbar-new-button-menu`));

    // Click the "Individual" option
    await clickAndWait(page, page.getByRole(`menuitem`, { name: `Individual` }).locator(`a`));

    await waitUntilLoaded(page);

    // Fill in "Provider ID"
    await fillAndWait(page, page.locator(`#prov_provider_identifier`), providerId);

    // Fill in first name
    await fillAndWait(page, page.locator(`#prov_first_name`), firstName);

    // Fill in last name
    await fillAndWait(page, page.locator(`#prov_last_name`), lastName);

    // Fill in and select credentials (scoped/exact)
    const credsCombo = page.locator(`input[name="prov_credentials_id_input"]`);
    await selectFromComboboxExact(page, credsCombo, credentials);

    await waitUntilLoaded(page);

    // Click the "Save and Close" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save and Close` }));
    await waitUntilLoaded(page);

    // Search for the {providerId}
    await searchForProvider(page, providerId);

    //--------------------------------
    // Assert: Created Individual visible and opens
    //--------------------------------
    // Assert the {providerId} is visible in the table
    await expect(rowLocatorForIndividual(page, providerId)).toBeVisible();

    // Double click the {providerId} to open the provider page
    await rowLocatorForIndividual(page, providerId).dblclick();

    //await waitUntilLoaded(page);

    // Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId)
    ).toBeVisible();

    // Assert the "First Name" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(firstName)
    ).toBeVisible();

    // Assert the "Last Name" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(lastName)
    ).toBeVisible();

    // Assert the "Credentials" persists
    await expect(page.getByText(credentials, { exact: true })).toBeVisible();

    //--------------------------------
    // Arrange for Update:
    //--------------------------------
    const taxId = `QAWTAX${Date.now()}`;
    const birthGenOpts = [
        "Disorder of Sexual Development",
        "Female",
        "Hermaphrodite",
        "Male",
        "Prefer Not to Answer",
    ];
    const idBirthGenOpts = [
        "Female",
        "Hermaphrodite",
        "Male",
        "Prefer Not to Answer",
        "Transgender Female",
        "Transgender Male",
    ];
    const birthGen = birthGenOpts[Math.floor(Math.random() * birthGenOpts.length)];
    const idBirthGen = idBirthGenOpts[Math.floor(Math.random() * idBirthGenOpts.length)];
    const language = `English`;
    const raceOpts = [
        "American Indian or Alaska Native",
        "Asian",
        "Black or African-American",
        "Hispanic or Latino",
        "Native Hawaiian or Other Pacific Islander",
        "Other Race",
        "White",
    ];
    const race = raceOpts[Math.floor(Math.random() * raceOpts.length)];

    //--------------------------------
    // Act: Update Individual fields
    //--------------------------------
    // Click the "Edit" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Edit` }));

    await waitUntilLoaded(page);

    // Fill in Tax ID #
    await fillAndWait(page, page.locator(`#prov_tax_id`), taxId);

    // Birth Gender
    const birthGenderCombo = page.locator(`input[name="prov_birth_gender_id_input"]`);
    await selectFromComboboxExact(page, birthGenderCombo, birthGen);

    // Identified Gender
    const identifiedGenderCombo = page.locator(`input[name="prov_identified_gender_id_input"]`);
    await selectFromComboboxExact(page, identifiedGenderCombo, idBirthGen);

    // Preferred spoken language
    const spokenCombo = page.locator(`input[name="prov_preferred_spoken_language_id_input"]`);
    await selectFromComboboxExact(page, spokenCombo, language);

    // Preferred written language
    const writtenCombo = page.locator(`input[name="prov_preferred_written_language_id_input"]`);
    await selectFromComboboxExact(page, writtenCombo, language);

    // Birth race
    const birthRaceCombo = page.locator(`input[name="prov_birth_race_id_input"]`);
    await selectFromComboboxExact(page, birthRaceCombo, race);

    // Identified race
    const identifiedRaceCombo = page.locator(`input[name="prov_identified_race_id_input"]`);
    await selectFromComboboxExact(page, identifiedRaceCombo, race);

    // Grab all specialties
    const specialties = await page.locator(`[id="prov_specialties_listbox"] li`).allInnerTexts();

    // Select a random specialty
    const selectedSpecialty = specialties[Math.floor(Math.random() * specialties.length)];

    // Target the "Specialty & Taxonomy *" combobox (first one per your snippet)
    const specialtyCombobox = page
        .locator(`#record-div div`)
        .filter({ hasText: `Specialty & Taxonomy *` })
        .getByRole(`combobox`)
        .first();

    // Use scoped combobox selection
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
    await expect(rowLocatorForIndividual(page, providerId)).toBeVisible();

    // Double click the {providerId} to open the provider page
    await rowLocatorForIndividual(page, providerId).dblclick();

    //await waitUntilLoaded(page);

    // Assert the "Provider ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(providerId)
    ).toBeVisible();

    // Assert the "Tax ID" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(taxId)
    ).toBeVisible();

    // Assert the "First Name" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(firstName)
    ).toBeVisible();

    // Assert the "Last Name" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(lastName)
    ).toBeVisible();

    // Assert the "Credentials" persists
    await expect(page.getByText(credentials, { exact: true })).toBeVisible();

    // Assert "Birth Gender" persists
    await expect(page.locator(`#prov_birth_gender_id`)).toContainText(birthGen);

    // Assert "Identified Gender" persists
    await expect(page.locator(`#prov_identified_gender_id`)).toContainText(idBirthGen);

    // Assert the "Preferred Spoken Language" persists
    await expect(page.locator(`#prov_preferred_spoken_language_id`)).toContainText(language);

    // Assert the "Preferred Written Language" persists
    await expect(page.locator(`#prov_preferred_written_language_id`)).toContainText(language);

    // Assert the "Specialty" persists
    await expect(
        page.getByLabel(`Provider`, { exact: true }).getByText(selectedSpecialty)
    ).toBeVisible();
});
