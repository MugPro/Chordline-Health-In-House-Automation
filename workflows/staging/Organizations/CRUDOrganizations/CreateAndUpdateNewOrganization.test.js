// CreateAndUpdateNewOrganization.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
// Faker v8 API
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 300;

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
    } = {}
) => {
    const saveBtn = page.getByRole('button', { name: saveButtonName });
    const errorLocator = page.getByText(errorText);
    const detailsDialog = page.getByLabel('Organization #');

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

test('Create a new Organization and then update it, verifying grid and detail values', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `OrgsCRUD`;
    const orgName = `${loginID}${Date.now()}`;
    const contactName = `${faker.person.firstName()} ${faker.person.lastName()}`;
    const address1 = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state();
    const zip = faker.location.zipCode();
    const country = `United States`;
    const email = faker.internet.email();
    const phone1 = faker.phone.number('2##-###-####');   // Preferred
    const fax = faker.phone.number('3##-###-####');
    const url2 = faker.internet.url();
    const comments = faker.lorem.sentence();

    // Log in
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });




    // Navigate to Tools > Organizations
    await page.getByText(`Tools`).hover();
    await page.getByText(`Organizations`).click();

    // Verify the "Manage Organizations" is visible
    await expect(page.getByText(`Manage Organizations`)).toBeVisible();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+New" button (with pause)
    await clickAndWait(page, page.getByRole('button', { name: /New/i }));
    await waitUntilLoaded(page);

    // Fill fields (each followed by ~600ms pause)
    await fillAndWait(page, page.locator(`#orgn_name`), orgName);
    await fillAndWait(page, page.locator(`#orgn_contact_name`), contactName);
    await fillAndWait(page, page.locator(`#orgn_address_1`), address1);
    await fillAndWait(page, page.locator(`#orgn_city`), city);

    // State
    await fillAndWait(page, page.locator(`input[name="orgn_state_id_input"]`), state);
    await clickAndWait(page, page.getByRole(`option`, { name: state }));
    await waitUntilLoaded(page);

    // Zip
    await fillAndWait(page, page.locator(`#orgn_zip`), zip);

    // County
    await clickAndWait(
        page,
        page.locator(
            `[class="left outerfielddiv"]:has(:text-is("County:")) [aria-label="expand combobox"]`
        )
    );
    const counties = await page.locator(`[role="listbox"] li:visible`).allInnerTexts();
    const county = counties[Math.floor(Math.random() * counties.length)];
    await fillAndWait(page, page.locator(`input[name="orgn_county_id_input"]`), county);
    await clickAndWait(
        page,
        page.locator(
            `[role="region"] li :text-is("${county}"), [role="listbox"] li :text-is("${county}")`
        ).first()
    );

    // Country
    await fillAndWait(page, page.locator(`input[name="orgn_country_id_input"]`), country);
    await clickAndWait(page, page.getByText(country, { exact: true }));

    // Email / Phones / URL
    await fillAndWait(page, page.locator(`#orgn_email_address`), email);
    await fillAndWait(page, page.locator(`#orgn_preferred_phone_national_number`), phone1);
    await fillAndWait(page, page.locator(`#orgn_fax_number_national_number`), fax);
    await fillAndWait(page, page.locator(`#orgn_url`), url2);

    // Comments (iframe)
    const frame = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await fillAndWait(page, frame.locator(`#orgn_comments`), comments);

    // Click the "Save and Close" button (no retry needed here per your example)
    await clickAndWait(page, page.getByRole('button', { name: /Save and Close/i }));
    // await waitUntilLoaded(page);

    // Search for the organization
    await page
        .getByRole(`dialog`, { name: `Manage Organizations` })
        .getByPlaceholder(`Search...`)
        .fill(orgName);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Create
    //--------------------------------
    const row = page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${orgName}")`
    );
    await expect(row).toBeVisible();

    // Contact name (column 4)
    await expect(row.locator('td').nth(4)).toContainText(contactName);

    // Fax in grid (column 5) — visibility only (aligns with non-member example style)
    await expect(row.locator('td').nth(5)).toBeVisible();

    // Email (column 6)
    await expect(row.locator('td').nth(6)).toContainText(email);

    // Address (7), City (8), State (9), Zip (10)
    await expect(row.locator('td').nth(7)).toContainText(address1);
    await expect(row.locator('td').nth(8)).toContainText(city);
    await expect(row.locator('td').nth(9)).toContainText(state);
    await expect(row.locator('td').nth(10)).toContainText(zip);

    // Open details
    await page.getByRole(`gridcell`, { name: orgName }).dblclick();
    // await waitUntilLoaded(page);

    // Details (strings from your inputs)
    await expect(page.getByLabel(`Organization #`).getByText(orgName)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(contactName)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(address1)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(city)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(state)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(zip)).toBeVisible();
    await expect(page.getByText(county)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();

    await expect(page.getByLabel(`Organization #`).getByText(email)).toBeVisible();
    await expect(page.getByText(url2)).toBeVisible();
    await expect(page.getByText(comments)).toBeVisible();

    //--------------------------------
    // Arrange (Edit values):
    //--------------------------------
    const orgNameEdit = `${orgName}-edit`;
    const contactNameEdit = `${faker.person.firstName()} ${faker.person.lastName()}`;
    const address1Edit = faker.location.streetAddress();
    const cityEdit = faker.location.city();
    const stateEdit = faker.location.state();
    const zipEdit = faker.location.zipCode();
    const emailEdit = faker.internet.email();
    const phone1Edit = faker.phone.number('3##-###-####');
    const faxEdit = faker.phone.number('4##-###-####');
    const urlEdit = faker.internet.url();
    const commentsEdit = faker.lorem.sentence();

    //--------------------------------
    // Act: Edit
    //--------------------------------
    // Click the Edit button (glyph text), then fill edited fields
    await clickAndWait(page, page.getByRole(`button`, { name: ` Edit` }));
    await waitUntilLoaded(page);

    await fillAndWait(page, page.locator(`#orgn_name`), orgNameEdit);
    await fillAndWait(page, page.locator(`#orgn_contact_name`), contactNameEdit);
    await fillAndWait(page, page.locator(`#orgn_address_1`), address1Edit);
    await fillAndWait(page, page.locator(`#orgn_city`), cityEdit);

    // State (open then select)
    await clickAndWait(
        page,
        page
            .locator(
                `[data-bind="attr: { data-table-code: fields.orgn_state_id.lookupTableCode, data-filter-code: fields.orgn_state_id.lookupFilterCode }"] [role="button"]`
            )
            .first()
    );
    await clickAndWait(
        page,
        page.locator(
            `[class="left outerfielddiv"]:has-text("State:") [aria-label="expand combobox"]:visible`
        )
    );
    await fillAndWait(
        page,
        page.locator(`[aria-controls="orgn_state_id-autocomplete_listbox"]`),
        stateEdit
    );
    await clickAndWait(
        page,
        page.locator(`[role="listbox"] li :text-is("${stateEdit}"):visible`).first()
    );
    await waitUntilLoaded(page);

    // Zip
    await fillAndWait(page, page.locator(`#orgn_zip`), zipEdit);

    // County
    await clickAndWait(
        page,
        page
            .locator(
                `[data-bind="attr: { data-table-code: fields.orgn_county_id.lookupTableCode, data-filter-code: fields.orgn_county_id.lookupFilterCode }"] [role="button"]`
            )
            .first()
    );
    await clickAndWait(
        page,
        page.locator(
            `[class="left outerfielddiv"]:has(:text-is("County:")) [aria-label="expand combobox"]`
        )
    );
    const countiesEdit = await page.locator(`[role="listbox"] li:visible`).allInnerTexts();
    const countyEdit = countiesEdit[Math.floor(Math.random() * countiesEdit.length)];
    await page.locator(`input[name="orgn_county_id_input"]`).clear();
    await fillAndWait(page, page.locator(`input[name="orgn_county_id_input"]`), countyEdit);
    await clickAndWait(
        page,
        page.locator(`[role="listbox"] li :text-is("${countyEdit}"):visible`).first()
    );

    // Email / Phones / URL / Comments
    await fillAndWait(page, page.locator(`#orgn_email_address`), emailEdit);

    await fillAndWait(page, page.locator(`#orgn_url`), urlEdit);

    const frame2 = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await fillAndWait(page, frame2.locator(`#orgn_comments`), commentsEdit);

    // Save and Close with one retry if error appears
    await saveAndCloseWithOneRetry(page, {
        saveButtonName: /Save and Close/i, // or ' Save and Close' if you prefer exact glyph text
        okButtonName: 'Okay',
        errorText: 'A problem occurred during',
        errorCheckTimeoutMs: 4000,
        dialogCloseTimeoutMs: 10000,
    });

    // Search for the organization (edited name)
    await page
        .getByRole(`dialog`, { name: `Manage Organizations` })
        .getByPlaceholder(`Search...`)
        .fill(orgNameEdit);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Edit
    //--------------------------------
    const editedRow = page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${orgNameEdit}")`
    );
    await expect(editedRow).toBeVisible();

    // Contact name (col 4)
    await expect(editedRow.locator('td').nth(4)).toContainText(contactNameEdit);

    // Fax in grid (col 5) — visibility only
    await expect(editedRow.locator('td').nth(5)).toBeVisible();

    // Email (6), Address (7), City (8), State (9), Zip (10)
    await expect(editedRow.locator('td').nth(6)).toContainText(emailEdit);
    await expect(editedRow.locator('td').nth(7)).toContainText(address1Edit);
    await expect(editedRow.locator('td').nth(8)).toContainText(cityEdit);
    await expect(editedRow.locator('td').nth(9)).toContainText(stateEdit);
    await expect(editedRow.locator('td').nth(10)).toContainText(zipEdit);

    // Open details (edited)
    await page.getByRole(`gridcell`, { name: orgNameEdit }).dblclick();
    await waitUntilLoaded(page);

    // Assert details persist after Edit
    await expect(page.getByLabel(`Organization #`).getByText(orgNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(contactNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(address1Edit)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(cityEdit)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(stateEdit)).toBeVisible();
    await expect(page.getByLabel(`Organization #`).getByText(zipEdit)).toBeVisible();
    await expect(page.getByText(countyEdit)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();

    await expect(page.getByLabel(`Organization #`).getByText(emailEdit)).toBeVisible();
    await expect(page.getByText(urlEdit)).toBeVisible();
    await expect(page.getByText(commentsEdit)).toBeVisible();
});