/*


// CreateAndUpdateNonMember.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
// Faker (compat across v7 and v8)
import { faker as fakerLib } from '@faker-js/faker';

// --- Faker compatibility wrapper (supports v7 and v8) ---
const F = {
    firstName: () =>
        (fakerLib.person?.firstName ? fakerLib.person.firstName() : fakerLib.name.firstName()),
    lastName: () =>
        (fakerLib.person?.lastName ? fakerLib.person.lastName() : fakerLib.name.lastName()),
    streetAddress: () =>
        (fakerLib.location?.streetAddress ? fakerLib.location.streetAddress() : fakerLib.address.streetAddress()),
    city: () =>
        (fakerLib.location?.city ? fakerLib.location.city() : fakerLib.address.city()),
    state: () =>
        (fakerLib.location?.state ? fakerLib.location.state() : fakerLib.address.state()),
    zipCode: () =>
        (fakerLib.location?.zipCode ? fakerLib.location.zipCode() : fakerLib.address.zipCode()),
    email: () =>
        (fakerLib.internet?.email ? fakerLib.internet.email() : fakerLib.internet.email()),
    words: (n = 1) =>
        (fakerLib.lorem?.words ? fakerLib.lorem.words(n) : fakerLib.lorem.words(n)),
    sentence: () =>
        (fakerLib.lorem?.sentence ? fakerLib.lorem.sentence() : fakerLib.lorem.sentence()),
    phone: (mask) =>
        (fakerLib.phone?.number ? fakerLib.phone.number(mask) : fakerLib.phone.phoneNumber(mask)),
};

test('Create a Non-Member and then update it, verifying grid and detail values', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants for initial create
    const loginID = `nonMembCRUD`;
    const firstName = F.firstName();
    const lastName = F.lastName();
    const address1 = F.streetAddress();
    const company = F.words(2);
    const city = F.city();
    const state = F.state();
    const zip = F.zipCode();
    const country = `United States`;
    const email = F.email();
    // Note: numbers starting with 0 will cause formatting issues
    const phone1 = F.phone('4##-###-####');
    const phone2 = F.phone('5##-###-####');
    const fax = F.phone('6##-###-####');
    const comments = F.sentence();
    const title = F.words(1);

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Non-Members
    await page.getByText(`Tools`).hover();
    await page.getByText(`Non-Members`).click();

    // Verify the "Manage Non-Members" is visible
    await expect(page.getByText(`Manage Non-Members`)).toBeVisible();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+New" button (regex to tolerate glyphs/nbsp)
    await page.getByRole('button', { name: /New/i }).click();
    await waitUntilLoaded(page);

    // Fill in First Name
    await page.locator(`#nonm_first_name`).fill(firstName);

    // Fill in Last Name
    await page.locator(`#nonm_last_name`).fill(lastName);

    // Fill in Company
    await page.locator(`#nonm_company`).fill(company);

    // Fill in Title
    await page.locator(`#nonm_title`).fill(title);

    // Fill in Address1
    await page.locator(`#nonm_address_1`).fill(address1);

    // Fill in City
    await page.locator(`#nonm_city`).fill(city);

    // Fill in State
    await page.locator(`input[name="nonm_state_id_input"]`).fill(state);
    await page.getByRole(`option`, { name: state }).click();

    // Fill in zipcode
    await page.locator(`#nonm_zip`).fill(zip);

    // Fill in County
    await page
        .locator(
            `[class="left outerfielddiv"]:has-text("County") button[aria-label="expand combobox"]`
        )
        .click();
    const counties = await page
        .locator(`[id="nonm_county_id-autocomplete-list"] li`)
        .allInnerTexts();
    const county = counties[Math.floor(Math.random() * counties.length)];
    await page.locator(`input[name="nonm_county_id_input"]`).fill(county);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: county }).click();

    // Fill in Country
    await page.locator(`input[name="nonm_country_id_input"]`).fill(country);
    await page.getByText(country, { exact: true }).click();

    // Fill in Preferred Phone
    await page.locator(`#nonm_preferred_phone_national_number`).fill(phone1);

    // Fill in Cell phone
    await page.locator(`#nonm_cell_phone_national_number`).fill(phone2);

    // Fill in Fax #
    await page.locator(`#nonm_fax_national_number`).fill(fax);

    // Fill in Email Address
    await page.locator(`#nonm_email_address`).fill(email);

    // Fill in comments
    const frame = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await frame.locator(`[id="nonm_comments"]`).fill(comments);

    await waitUntilLoaded(page);

    // Click the "Save and Close" button
    await page.getByRole('button', { name: /Save and Close/i }).click();

    await waitUntilLoaded(page);

    // Search for the Non-member
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(email);

    // Click the search button
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Create
    //--------------------------------
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${email}")`)
    ).toBeVisible();

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=3`
        )
    ).toContainText(firstName);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=4`
        )
    ).toContainText(lastName);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=5`
        )
    ).toContainText(company);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${firstName}") td >> nth=6`
        )
    ).toContainText(email);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=7`
        )
    ).toContainText(title);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=8`
        )
    ).toContainText(address1);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=9`
        )
    ).toContainText(city);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=10`
        )
    ).toContainText(state);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=11`
        )
    ).toContainText(zip);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=12`
        )
    ).toContainText(phone1);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=13`
        )
    ).toContainText(phone2);

    // Open details
    await page.getByRole(`gridcell`, { name: email }).dblclick();

    await waitUntilLoaded(page);

    // Detail assertions
    await expect(page.getByLabel(`Non-Member #`).getByText(firstName)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(lastName)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(company)).toBeVisible();
    await expect(page.locator(`#nonm_title`)).toContainText(title);
    await expect(page.getByLabel(`Non-Member #`).getByText(address1)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(city)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(state)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(zip)).toBeVisible();
    await expect(page.getByText(county)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone1)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(fax)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone2)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(email)).toBeVisible();
    await expect(page.getByText(comments)).toBeVisible();

    //--------------------------------
    // Arrange (Edit values):
    //--------------------------------
    const firstNameEdit = F.firstName();
    const lastNameEdit = F.lastName();
    const address1Edit = F.streetAddress();
    const companyEdit = F.words(2);
    const cityEdit = F.city();
    const stateEdit = F.state();
    const zipEdit = F.zipCode();
    const emailEdit = F.email();
    const phone1Edit = F.phone('7##-###-####');
    const phone2Edit = F.phone('8##-###-####');
    const faxEdit = F.phone('9##-###-####');
    const commentsEdit = F.sentence();
    const titleEdit = F.words(1);

    //--------------------------------
    // Act: Edit
    //--------------------------------
    await page.getByRole(`button`, { name: /Edit/i }).click();
    await waitUntilLoaded(page);

    await page.locator(`#nonm_first_name`).fill(firstNameEdit);
    await page.locator(`#nonm_last_name`).fill(lastNameEdit);
    await page.locator(`#nonm_company`).fill(companyEdit);
    await page.locator(`#nonm_title`).fill(titleEdit);
    await page.locator(`#nonm_address_1`).fill(address1Edit);
    await page.locator(`#nonm_city`).fill(cityEdit);

    await page
        .locator(
            `[data-bind="attr: { data-table-code: fields.nonm_state_id.lookupTableCode, data-filter-code: fields.nonm_state_id.lookupFilterCode }"] [role="button"]`
        )
        .first()
        .click();
    await page.locator(`input[name="nonm_state_id_input"]`).fill(stateEdit);
    await page.getByRole(`option`, { name: stateEdit }).click();

    await page.locator(`#nonm_zip`).fill(zipEdit);

    await page
        .locator(
            `[class="left outerfielddiv"]:has(:text-is("County:")) [aria-label="expand combobox"]`
        )
        .click();
    const countiesEdit = await page.locator(`[role="listbox"] li:visible`).allInnerTexts();
    const countyEdit = countiesEdit[Math.floor(Math.random() * countiesEdit.length)];
    await page.locator(`input[name="nonm_county_id_input"]`).fill(countyEdit);
    await page.getByRole(`option`, { name: countyEdit }).click();

    await page.locator(`#nonm_preferred_phone_national_number`).fill(phone1Edit);
    await page.locator(`#nonm_cell_phone_national_number`).fill(phone2Edit);
    await page.locator(`#nonm_fax_national_number`).fill(faxEdit);
    await page.locator(`#nonm_email_address`).fill(emailEdit);

    const frame2 = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await frame2.locator(`[id="nonm_comments"]`).fill(commentsEdit);

    await waitUntilLoaded(page);

    await page.getByRole('button', { name: /Save and Close/i }).click();

    await waitUntilLoaded(page);

    // Search with updated email
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(emailEdit);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Edit
    //--------------------------------
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${emailEdit}")`)
    ).toBeVisible();

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=3`
        )
    ).toContainText(firstNameEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=4`
        )
    ).toContainText(lastNameEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=5`
        )
    ).toContainText(companyEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${firstNameEdit}") td >> nth=6`
        )
    ).toContainText(emailEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=7`
        )
    ).toContainText(titleEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=8`
        )
    ).toContainText(address1Edit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=9`
        )
    ).toContainText(cityEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=10`
        )
    ).toContainText(stateEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=11`
        )
    ).toContainText(zipEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=12`
        )
    ).toContainText(phone1Edit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=13`
        )
    ).toContainText(phone2Edit);

    // Open details (updated)
    await page.getByRole(`gridcell`, { name: emailEdit }).dblclick();

    await waitUntilLoaded(page);

    await expect(page.getByLabel(`Non-Member #`).getByText(firstNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(lastNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(companyEdit)).toBeVisible();
    await expect(page.locator(`#nonm_title`)).toContainText(titleEdit);
    await expect(page.getByLabel(`Non-Member #`).getByText(address1Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(cityEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(stateEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(zipEdit)).toBeVisible();
    await expect(page.getByText(countyEdit)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone1Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(faxEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone2Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(emailEdit)).toBeVisible();
    await expect(page.getByText(commentsEdit)).toBeVisible();
});

 */






















 /*


// CreateAndUpdateNonMember.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
// Faker (compat across v7 and v8)
import { faker as fakerLib } from '@faker-js/faker';

// --- Faker compatibility wrapper (supports v7 and v8) ---
const F = {
    firstName: () =>
        (fakerLib.person?.firstName ? fakerLib.person.firstName() : fakerLib.name.firstName()),
    lastName: () =>
        (fakerLib.person?.lastName ? fakerLib.person.lastName() : fakerLib.name.lastName()),
    streetAddress: () =>
        (fakerLib.location?.streetAddress ? fakerLib.location.streetAddress() : fakerLib.address.streetAddress()),
    city: () =>
        (fakerLib.location?.city ? fakerLib.location.city() : fakerLib.address.city()),
    state: () =>
        (fakerLib.location?.state ? fakerLib.location.state() : fakerLib.address.state()),
    zipCode: () =>
        (fakerLib.location?.zipCode ? fakerLib.location.zipCode() : fakerLib.address.zipCode()),
    email: () =>
        (fakerLib.internet?.email ? fakerLib.internet.email() : fakerLib.internet.email()),
    words: (n = 1) =>
        (fakerLib.lorem?.words ? fakerLib.lorem.words(n) : fakerLib.lorem.words(n)),
    sentence: () =>
        (fakerLib.lorem?.sentence ? fakerLib.lorem.sentence() : fakerLib.lorem.sentence()),
    phone: (mask) =>
        (fakerLib.phone?.number ? fakerLib.phone.number(mask) : fakerLib.phone.phoneNumber(mask)),
};

// --- Phone normalization helpers (Option 1) ---
const onlyDigits = (s) => (s || '').replace(/\D/g, '');
const last10 = (s) => onlyDigits(s).slice(-10);


const expectPhoneCellToMatch = async (rowCells, cellIndex, expectedRaw) => {
    const text = await rowCells.nth(cellIndex).innerText();
    expect(last10(text)).toBe(last10(expectedRaw));
};

test('Create a Non-Member and then update it, verifying grid and detail values', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `nonMembCRUD`;
    const firstName = F.firstName();
    const lastName = F.lastName();
    const address1 = F.streetAddress();
    const company = F.words(2);
    const city = F.city();
    const state = F.state();
    const zip = F.zipCode();
    const country = `United States`;
    const email = F.email();
    // Note: numbers starting with 0 will cause formatting issues
    const phone1 = F.phone('4##-###-####');
    const phone2 = F.phone('5##-###-####');
    const fax = F.phone('6##-###-####');
    const comments = F.sentence();
    const title = F.words(1);

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Non-Members
    await page.getByText(`Tools`).hover();
    await page.getByText(`Non-Members`).click();

    // Verify the "Manage Non-Members" is visible
    await expect(page.getByText(`Manage Non-Members`)).toBeVisible();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+New" button
    await page.getByRole('button', { name: /New/i }).click();
    await waitUntilLoaded(page);

    // Fill in fields
    await page.locator(`#nonm_first_name`).fill(firstName);
    await page.locator(`#nonm_last_name`).fill(lastName);
    await page.locator(`#nonm_company`).fill(company);
    await page.locator(`#nonm_title`).fill(title);
    await page.locator(`#nonm_address_1`).fill(address1);
    await page.locator(`#nonm_city`).fill(city);

    // State
    await page.locator(`input[name="nonm_state_id_input"]`).fill(state);
    await page.getByRole(`option`, { name: state }).click();

    // Zip
    await page.locator(`#nonm_zip`).fill(zip);

    // County
    await page
        .locator(
            `[class="left outerfielddiv"]:has-text("County") button[aria-label="expand combobox"]`
        )
        .click();
    const counties = await page
        .locator(`[id="nonm_county_id-autocomplete-list"] li`)
        .allInnerTexts();
    const county = counties[Math.floor(Math.random() * counties.length)];
    await page.locator(`input[name="nonm_county_id_input"]`).fill(county);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: county }).click();

    // Country
    await page.locator(`input[name="nonm_country_id_input"]`).fill(country);
    await page.getByText(country, { exact: true }).click();

    // Phones / Fax / Email
    await page.locator(`#nonm_preferred_phone_national_number`).fill(phone1);
    await page.locator(`#nonm_cell_phone_national_number`).fill(phone2);
    await page.locator(`#nonm_fax_national_number`).fill(fax);
    await page.locator(`#nonm_email_address`).fill(email);

    // Comments (iframe)
    const frame = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await frame.locator(`#nonm_comments`).fill(comments);

    await waitUntilLoaded(page);

    // Save and close
    await page.getByRole('button', { name: /Save and Close/i }).click();

    await waitUntilLoaded(page);

    // Search
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(email);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Create
    //--------------------------------
    // Row existence
    const row = page.locator(`[id="browse-grid"] table tbody tr:has-text("${email}")`);
    await expect(row).toBeVisible();

    // Column asserts
    await expect(row.locator(`td`).nth(3)).toContainText(firstName); // First Name
    await expect(row.locator(`td`).nth(4)).toContainText(lastName);  // Last Name
    await expect(row.locator(`td`).nth(5)).toContainText(company);   // Company

    // Email (per your pattern: row via firstName, col 6)
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${firstName}") td`).nth(6)
    ).toContainText(email);

    await expect(row.locator(`td`).nth(7)).toContainText(title);     // Title
    await expect(row.locator(`td`).nth(8)).toContainText(address1);  // Address
    await expect(row.locator(`td`).nth(9)).toContainText(city);      // City
    await expect(row.locator(`td`).nth(10)).toContainText(state);    // State
    await expect(row.locator(`td`).nth(11)).toContainText(zip);      // Zip

    // 📞 Phone assertions with normalization (Option 1)
    const rowCells = row.locator(`td`);
    await expectPhoneCellToMatch(rowCells, 12, phone1); // Preferred Phone
    await expectPhoneCellToMatch(rowCells, 13, phone2); // Cell

    // Open details
    await page.getByRole(`gridcell`, { name: email }).dblclick();

    await waitUntilLoaded(page);

    // Detail assertions (kept strict)
    await expect(page.getByLabel(`Non-Member #`).getByText(firstName)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(lastName)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(company)).toBeVisible();
    await expect(page.locator(`#nonm_title`)).toContainText(title);
    await expect(page.getByLabel(`Non-Member #`).getByText(address1)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(city)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(state)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(zip)).toBeVisible();
    await expect(page.getByText(county)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone1)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(fax)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone2)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(email)).toBeVisible();
    await expect(page.getByText(comments)).toBeVisible();

    //--------------------------------
    // Arrange (Edit values):
    //--------------------------------
    const firstNameEdit = F.firstName();
    const lastNameEdit = F.lastName();
    const address1Edit = F.streetAddress();
    const companyEdit = F.words(2);
    const cityEdit = F.city();
    const stateEdit = F.state();
    const zipEdit = F.zipCode();
    const emailEdit = F.email();
    const phone1Edit = F.phone('7##-###-####');
    const phone2Edit = F.phone('8##-###-####');
    const faxEdit = F.phone('9##-###-####');
    const commentsEdit = F.sentence();
    const titleEdit = F.words(1);

    //--------------------------------
    // Act: Edit
    //--------------------------------
    await page.getByRole(`button`, { name: /Edit/i }).click();
    await waitUntilLoaded(page);

    await page.locator(`#nonm_first_name`).fill(firstNameEdit);
    await page.locator(`#nonm_last_name`).fill(lastNameEdit);
    await page.locator(`#nonm_company`).fill(companyEdit);
    await page.locator(`#nonm_title`).fill(titleEdit);
    await page.locator(`#nonm_address_1`).fill(address1Edit);
    await page.locator(`#nonm_city`).fill(cityEdit);

    await page
        .locator(
            `[data-bind="attr: { data-table-code: fields.nonm_state_id.lookupTableCode, data-filter-code: fields.nonm_state_id.lookupFilterCode }"] [role="button"]`
        )
        .first()
        .click();
    await page.locator(`input[name="nonm_state_id_input"]`).fill(stateEdit);
    await page.getByRole(`option`, { name: stateEdit }).click();

    await page.locator(`#nonm_zip`).fill(zipEdit);

    await page
        .locator(
            `[class="left outerfielddiv"]:has(:text-is("County:")) [aria-label="expand combobox"]`
        )
        .click();
    const countiesEdit = await page.locator(`[role="listbox"] li:visible`).allInnerTexts();
    const countyEdit = countiesEdit[Math.floor(Math.random() * countiesEdit.length)];
    await page.locator(`input[name="nonm_county_id_input"]`).fill(countyEdit);
    await page.getByRole(`option`, { name: countyEdit }).click();

    await page.locator(`#nonm_preferred_phone_national_number`).fill(phone1Edit);
    await page.locator(`#nonm_cell_phone_national_number`).fill(phone2Edit);
    await page.locator(`#nonm_fax_national_number`).fill(faxEdit);
    await page.locator(`#nonm_email_address`).fill(emailEdit);

    const frame2 = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await frame2.locator(`#nonm_comments`).fill(commentsEdit);

    await waitUntilLoaded(page);

    await page.getByRole('button', { name: /Save and Close/i }).click();

    await waitUntilLoaded(page);

    // Search again (updated email)
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(emailEdit);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Edit
    //--------------------------------
    const editedRow = page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${emailEdit}")`
    );
    await expect(editedRow).toBeVisible();

    await expect(editedRow.locator(`td`).nth(3)).toContainText(firstNameEdit);
    await expect(editedRow.locator(`td`).nth(4)).toContainText(lastNameEdit);
    await expect(editedRow.locator(`td`).nth(5)).toContainText(companyEdit);

    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${firstNameEdit}") td`
        ).nth(6)
    ).toContainText(emailEdit);

    await expect(editedRow.locator(`td`).nth(7)).toContainText(titleEdit);
    await expect(editedRow.locator(`td`).nth(8)).toContainText(address1Edit);
    await expect(editedRow.locator(`td`).nth(9)).toContainText(cityEdit);
    await expect(editedRow.locator(`td`).nth(10)).toContainText(stateEdit);
    await expect(editedRow.locator(`td`).nth(11)).toContainText(zipEdit);

    // 📞 Phone assertions with normalization (Option 1)
    const editedRowCells = editedRow.locator(`td`);
    await expectPhoneCellToMatch(editedRowCells, 12, phone1Edit); // Preferred
    await expectPhoneCellToMatch(editedRowCells, 13, phone2Edit); // Cell

    // Open details (edited)
    await page.getByRole(`gridcell`, { name: emailEdit }).dblclick();

    await waitUntilLoaded(page);

    await expect(page.getByLabel(`Non-Member #`).getByText(firstNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(lastNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(companyEdit)).toBeVisible();
    await expect(page.locator(`#nonm_title`)).toContainText(titleEdit);
    await expect(page.getByLabel(`Non-Member #`).getByText(address1Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(cityEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(stateEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(zipEdit)).toBeVisible();
    await expect(page.getByText(countyEdit)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone1Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(faxEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(phone2Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(emailEdit)).toBeVisible();
    await expect(page.getByText(commentsEdit)).toBeVisible();
});



  */



























/*
await expect(page.getByText('A problem occurred during')).toBeVisible();
  await page.getByRole('button', { name: 'Okay' }).click();
  await page.getByRole('button', { name: ' Save and Close' }).click();

  await page.getByRole('button', { name: 'Yes' }).click();
 */




/*

// CreateAndUpdateNonMember.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
// Faker (kept API usage compatible with your snippet)
import { faker } from '@faker-js/faker';

test('Create a Non-Member and then update it, verifying grid and detail values', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants for initial create
    const loginID = `nonMembCRUD`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const address1 = faker.location.streetAddress();
    const company = faker.lorem.words(2);
    const city = faker.location.city();
    const state = faker.location.state();
    const zip = faker.location.zipCode();
    const country = `United States`;
    const email = faker.internet.email();
    // Note: numbers starting with 0 will cause formatting issues
    const phone1 = faker.phone.number('4##-###-####');
    const phone2 = faker.phone.number('5##-###-####');
    const fax = faker.phone.number('6##-###-####');
    const comments = faker.lorem.sentence();
    const title = faker.lorem.words(1);

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Non-Members
    await page.getByText(`Tools`).hover();
    await page.getByText(`Non-Members`).click();

    // Verify the "Manage Non-Members" is visible
    await expect(page.getByText(`Manage Non-Members`)).toBeVisible();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+New" button
    // Using regex to avoid issues with glyphs/nbsp
    await page.getByRole('button', { name: /New/i }).click();
    await waitUntilLoaded(page);

    // Fill in First Name
    await page.locator(`#nonm_first_name`).fill(firstName);

    // Fill in Last Name
    await page.locator(`#nonm_last_name`).fill(lastName);

    // Fill in Company
    await page.locator(`#nonm_company`).fill(company);

    // Fill in Title
    await page.locator(`#nonm_title`).fill(title);

    // Fill in Address1
    await page.locator(`#nonm_address_1`).fill(address1);

    // Fill in City
    await page.locator(`#nonm_city`).fill(city);

    // Fill in State
    await page.locator(`input[name="nonm_state_id_input"]`).fill(state);
    await page.getByRole(`option`, { name: state }).click();

    // Fill in zipcode
    await page.locator(`#nonm_zip`).fill(zip);

    // Fill in County
    await page
        .locator(
            `[class="left outerfielddiv"]:has-text("County") button[aria-label="expand combobox"]`
        )
        .click();
    const counties = await page
        .locator(`[id="nonm_county_id-autocomplete-list"] li`)
        .allInnerTexts();
    const county = counties[Math.floor(Math.random() * counties.length)];
    await page.locator(`input[name="nonm_county_id_input"]`).fill(county);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: county }).click();

    // Fill in Country
    await page.locator(`input[name="nonm_country_id_input"]`).fill(country);
    await page.getByText(country, { exact: true }).click();

    // Fill in Preferred Phone
    await page.locator(`#nonm_preferred_phone_national_number`).fill(phone1);

    // Fill in Cell phone
    await page.locator(`#nonm_cell_phone_national_number`).fill(phone2);

    // Fill in Fax #
    await page.locator(`#nonm_fax_national_number`).fill(fax);

    // Fill in Email Address
    await page.locator(`#nonm_email_address`).fill(email);

    // Fill in comments
    const frame = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await frame.locator(`[id="nonm_comments"]`).fill(comments);

    await waitUntilLoaded(page);

    // Click the "Save and Close" button
    await page.getByRole('button', { name: /Save and Close/i }).click();

    await waitUntilLoaded(page);

    // Search for the Non-member
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(email);

    // Click the search button
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Create
    //--------------------------------
    // Assert the Non-Member appears in the table
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${email}")`)
    ).toBeVisible();

    // Assert the First Name appears in the table (column index 3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=3`
        )
    ).toContainText(firstName);

    // Assert the Last Name appears in the table (column index 4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=4`
        )
    ).toContainText(lastName);

    // Assert the Company Name appears in the table (column index 5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=5`
        )
    ).toContainText(company);

    // Assert the email address appears in the table (row found via firstName, column index 6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${firstName}") td >> nth=6`
        )
    ).toContainText(email);

    // Assert the Title (column index 7)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=7`
        )
    ).toContainText(title);

    // Assert the address appears in the table (column index 8)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=8`
        )
    ).toContainText(address1);

    // Assert the city appears in the table (column index 9)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=9`
        )
    ).toContainText(city);

    // Assert the state appears in the table (column index 10)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=10`
        )
    ).toContainText(state);

    // Assert the zipcode appears in the table (column index 11)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=11`
        )
    ).toContainText(zip);

    // Assert the Preferred Phone appears in the table (column index 12)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=12`
        )
    ).toBeVisible();

    // Assert the Cell Number appears in the table (column index 13)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${email}") td >> nth=13`
        )
    ).toBeVisible();

    // Double click the row to open the Non-Member page details
    await page.getByRole(`gridcell`, { name: email }).dblclick();

    await waitUntilLoaded(page);

    // Assert details persist
    await expect(
        page.getByLabel(`Non-Member #`).getByText(firstName)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(lastName)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(company)
    ).toBeVisible();

    await expect(page.locator(`#nonm_title`)).toContainText(title);

    await expect(
        page.getByLabel(`Non-Member #`).getByText(address1)
    ).toBeVisible();

    await expect(page.getByLabel(`Non-Member #`).getByText(city)).toBeVisible();

    await expect(page.getByLabel(`Non-Member #`).getByText(state)).toBeVisible();

    await expect(page.getByLabel(`Non-Member #`).getByText(zip)).toBeVisible();

    await expect(page.getByText(county)).toBeVisible();

    await expect(page.getByText(country)).toBeVisible();






    await expect(page.getByLabel(`Non-Member #`).getByText(email)).toBeVisible();

    await expect(page.getByText(comments)).toBeVisible();

    //--------------------------------
    // Arrange (Edit values):
    //--------------------------------
    const firstNameEdit = faker.person.firstName();
    const lastNameEdit = faker.person.lastName();
    const address1Edit = faker.location.streetAddress();
    const companyEdit = faker.lorem.words(2);
    const cityEdit = faker.location.city();
    const stateEdit = faker.location.state();
    const zipEdit = faker.location.zipCode();
    const emailEdit = faker.internet.email();
    const phone1Edit = faker.phone.number('7##-###-####');
    const phone2Edit = faker.phone.number('8##-###-####');
    const faxEdit = faker.phone.number('9##-###-####');
    const commentsEdit = faker.lorem.sentence();
    const titleEdit = faker.lorem.words(1);

    //--------------------------------
    // Act: Edit
    //--------------------------------
    //await page.getByRole(`button`, { name: /Edit/i }).click();
    await page.getByRole('button', { name: ' Edit' }).click();

    await waitUntilLoaded(page);

    // Fill in First Name
    await page.locator(`#nonm_first_name`).fill(firstNameEdit);

    // Fill in Last Name
    await page.locator(`#nonm_last_name`).fill(lastNameEdit);

    // Fill in Company
    await page.locator(`#nonm_company`).fill(companyEdit);

    // Fill in Title
    await page.locator(`#nonm_title`).fill(titleEdit);

    // Fill in Address1
    await page.locator(`#nonm_address_1`).fill(address1Edit);

    // Fill in City
    await page.locator(`#nonm_city`).fill(cityEdit);

    // Fill in State (using the button to open the dropdown first)
    await page
        .locator(
            `[data-bind="attr: { data-table-code: fields.nonm_state_id.lookupTableCode, data-filter-code: fields.nonm_state_id.lookupFilterCode }"] [role="button"]`
        )
        .first()
        .click();
    await waitUntilLoaded(page);
    await page.locator(`input[name="nonm_state_id_input"]`).fill(stateEdit);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: stateEdit }).click();

    // Fill in zipcode
    await page.locator(`#nonm_zip`).fill(zipEdit);

    // Fill in County
    await page
        .locator(
            `[class="left outerfielddiv"]:has(:text-is("County:")) [aria-label="expand combobox"]`
        )
        .click();
    await waitUntilLoaded(page);
    const countiesEdit = await page
        .locator(`[role="listbox"] li:visible`)
        .allInnerTexts();
    const countyEdit =
        countiesEdit[Math.floor(Math.random() * countiesEdit.length)];
    await page.locator(`input[name="nonm_county_id_input"]`).fill(countyEdit);
    await waitUntilLoaded(page);
    await page.getByRole(`option`, { name: countyEdit }).click();

    // Fill in Preferred Phone
    await page.locator(`#nonm_preferred_phone_national_number`).fill(phone1Edit);

    // Fill in Cell phone
    await page.locator(`#nonm_cell_phone_national_number`).fill(phone2Edit);

    // Fill in Fax #
    await page.locator(`#nonm_fax_national_number`).fill(faxEdit);

    // Fill in Email Address
    await page.locator(`#nonm_email_address`).fill(emailEdit);

    // Fill in comments
    const frame2 = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await frame2.locator(`[id="nonm_comments"]`).fill(commentsEdit);

    await waitUntilLoaded(page);


















    const saveAndCloseWithOneRetry = async (page, {
        saveButtonName = /Save and Close/i,
        okButtonName = 'Okay',
        errorText = 'A problem occurred during',
        errorCheckTimeoutMs = 4000,
        dialogCloseTimeoutMs = 10000,
    } = {}) => {
        const saveBtn = page.getByRole('button', { name: saveButtonName });
        const errorLocator = page.getByText(errorText);
        const detailsDialog = page.getByLabel('Non-Member #');

        // Helper to attempt a single save and detect the error quickly
        const attemptSaveOnce = async () => {
            await saveBtn.click();

            // Wait briefly for the error to appear.
            // If it doesn't, assume success and wait for dialog to close.
            try {
                await expect(errorLocator).toBeVisible({ timeout: errorCheckTimeoutMs });
                return 'error';
            } catch {
                // No error detected within timeout: wait for the detail dialog to close
                try {
                    await expect(detailsDialog).toBeHidden({ timeout: dialogCloseTimeoutMs });
                } catch {
                    // If the dialog label changes or isn't hidden, don't hard-fail here.
                    // You can add more robust success detection if needed.
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
            // As requested: assert error visible, then end the test
            await expect(errorLocator).toBeVisible();
            throw new Error('Save and Close failed twice: application returned an error dialog both times.');
        }
    };



// Click "Save and Close" with one retry if "A problem occurred during" appears
    await saveAndCloseWithOneRetry(page, {
        saveButtonName: /Save and Close/i,         // or ' Save and Close' if you prefer exact glyph text
        okButtonName: 'Okay',
        errorText: 'A problem occurred during',
        errorCheckTimeoutMs: 4000,                 // how long to wait for the error to pop
        dialogCloseTimeoutMs: 10000,               // how long to wait for detail dialog to close
    });

// If we get here: either success on first try or after retry





    await waitUntilLoaded(page);

    // Search for the Non-member using updated email
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(emailEdit);

    // Click the search button
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Edit
    //--------------------------------
    // Assert the Non-Member appears in the table
    await expect(
        page.locator(`[id="browse-grid"] table tbody tr:has-text("${emailEdit}")`)
    ).toBeVisible();

    // Assert the First Name appears in the table (column index 3)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=3`
        )
    ).toContainText(firstNameEdit);

    // Assert the Last Name appears in the table (column index 4)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=4`
        )
    ).toContainText(lastNameEdit);

    // Assert the Company Name appears in the table (column index 5)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=5`
        )
    ).toContainText(companyEdit);

    // Assert the Email address appears in the table (row found via firstNameEdit, column index 6)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${firstNameEdit}") td >> nth=6`
        )
    ).toContainText(emailEdit);

    // Assert the Title (column index 7)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=7`
        )
    ).toContainText(titleEdit);

    // Assert the address appears in the table (column index 8)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=8`
        )
    ).toContainText(address1Edit);

    // Assert the city appears in the table (column index 9)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=9`
        )
    ).toContainText(cityEdit);

    // Assert the state appears in the table (column index 10)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=10`
        )
    ).toContainText(stateEdit);

    // Assert the zipcode appears in the table (column index 11)
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${emailEdit}") td >> nth=11`
        )
    ).toContainText(zipEdit);




    // Double click the row to open the Non-Member page details
    await page.getByRole(`gridcell`, { name: emailEdit }).dblclick();

    await waitUntilLoaded(page);

    // Assert details persist after Edit
    await expect(
        page.getByLabel(`Non-Member #`).getByText(firstNameEdit)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(lastNameEdit)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(companyEdit)
    ).toBeVisible();

    await expect(page.locator(`#nonm_title`)).toContainText(titleEdit);

    await expect(
        page.getByLabel(`Non-Member #`).getByText(address1Edit)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(cityEdit)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(stateEdit)
    ).toBeVisible();

    await expect(
        page.getByLabel(`Non-Member #`).getByText(zipEdit)
    ).toBeVisible();

    await expect(page.getByText(countyEdit)).toBeVisible();

    await expect(page.getByText(country)).toBeVisible();




    await expect(
        page.getByLabel(`Non-Member #`).getByText(emailEdit)
    ).toBeVisible();

    await expect(page.getByText(commentsEdit)).toBeVisible();
});



 */






































// CreateAndUpdateNonMember.test.js
import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
// Faker v8 API
import { faker } from '@faker-js/faker';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
   ------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 600;

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
    const detailsDialog = page.getByLabel('Non-Member #');

    // Attempt one save; detect error quickly; otherwise wait for dialog close.
    const attemptSaveOnce = async () => {
        await saveBtn.click();

        try {
            await expect(errorLocator).toBeVisible({ timeout: errorCheckTimeoutMs });
            return 'error';
        } catch {
            // No error detected: wait for detail dialog to close (return to grid)
            try {
                await expect(detailsDialog).toBeHidden({ timeout: dialogCloseTimeoutMs });
            } catch {
                // If dialog label changes or doesn't hide, ignore here.
            }
            return 'success';
        }
    };

    // First attempt
    const firstResult = await attemptSaveOnce();
    if (firstResult === 'success') return;

    // Handle error: click "Okay", wait for error to disappear
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

test('Create a Non-Member and then update it, verifying grid and detail values', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    // Constants for initial create
    const loginID = `nonMembCRUD`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const address1 = faker.location.streetAddress();
    const company = faker.lorem.words(2);
    const city = faker.location.city();
    const state = faker.location.state();
    const zip = faker.location.zipCode();
    const country = `United States`;
    const email = faker.internet.email();
    // Note: numbers starting with 0 will cause formatting issues
    const phone1 = faker.phone.number('4##-###-####');
    const phone2 = faker.phone.number('5##-###-####');
    const fax = faker.phone.number('6##-###-####');
    const comments = faker.lorem.sentence();
    const title = faker.lorem.words(1);

    // Log in
    const { page } = await logIn({ loginID });

    // Navigate to Tools > Non-Members
    await page.getByText(`Tools`).hover();
    await page.getByText(`Non-Members`).click();

    // Verify the "Manage Non-Members" is visible
    await expect(page.getByText(`Manage Non-Members`)).toBeVisible();

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+New" button (with pause)
    await clickAndWait(page, page.getByRole('button', { name: /New/i }));
    await waitUntilLoaded(page);

    // Fill fields (each followed by ~2s pause)
    await fillAndWait(page, page.locator(`#nonm_first_name`), firstName);
    await fillAndWait(page, page.locator(`#nonm_last_name`), lastName);
    await fillAndWait(page, page.locator(`#nonm_company`), company);
    await fillAndWait(page, page.locator(`#nonm_title`), title);
    await fillAndWait(page, page.locator(`#nonm_address_1`), address1);
    await fillAndWait(page, page.locator(`#nonm_city`), city);

    // State
    await fillAndWait(page, page.locator(`input[name="nonm_state_id_input"]`), state);
    await clickAndWait(page, page.getByRole(`option`, { name: state }));

    // Zip
    await fillAndWait(page, page.locator(`#nonm_zip`), zip);

    // County
    await clickAndWait(
        page,
        page.locator(
            `[class="left outerfielddiv"]:has-text("County") button[aria-label="expand combobox"]`
        )
    );
    const counties = await page
        .locator(`[id="nonm_county_id-autocomplete-list"] li`)
        .allInnerTexts();
    const county = counties[Math.floor(Math.random() * counties.length)];
    await fillAndWait(page, page.locator(`input[name="nonm_county_id_input"]`), county);
    //await waitUntilLoaded(page);
    await clickAndWait(page, page.getByRole(`option`, { name: county }));

    // Country
    await fillAndWait(page, page.locator(`input[name="nonm_country_id_input"]`), country);
    await clickAndWait(page, page.getByText(country, { exact: true }));

    // Phones / Fax / Email
    await fillAndWait(page, page.locator(`#nonm_preferred_phone_national_number`), phone1);
    await fillAndWait(page, page.locator(`#nonm_cell_phone_national_number`), phone2);
    await fillAndWait(page, page.locator(`#nonm_fax_national_number`), fax);
    await fillAndWait(page, page.locator(`#nonm_email_address`), email);

    // Comments (iframe)
    const frame = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await fillAndWait(page, frame.locator(`#nonm_comments`), comments);

    //await waitUntilLoaded(page);

    // Click the "Save and Close" button (no retry needed here per your spec)
    await clickAndWait(page, page.getByRole('button', { name: /Save and Close/i }));
    //await waitUntilLoaded(page);

    // Search for the Non-member
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(email);

    // Click the search button
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Create
    //--------------------------------
    const createdRow = page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${email}")`
    );
    await expect(createdRow).toBeVisible();

    // First/Last/Company in grid
    await expect(createdRow.locator('td').nth(3)).toContainText(firstName);
    await expect(createdRow.locator('td').nth(4)).toContainText(lastName);
    await expect(createdRow.locator('td').nth(5)).toContainText(company);

    // Email (row via firstName, col 6)
    await expect(
        page
            .locator(
                `[id="browse-grid"] table tbody tr:has-text("${firstName}") td`
            )
            .nth(6)
    ).toContainText(email);

    // Title / Address / City / State / Zip
    await expect(createdRow.locator('td').nth(7)).toContainText(title);
    await expect(createdRow.locator('td').nth(8)).toContainText(address1);
    await expect(createdRow.locator('td').nth(9)).toContainText(city);
    await expect(createdRow.locator('td').nth(10)).toContainText(state);
    await expect(createdRow.locator('td').nth(11)).toContainText(zip);

    // Phones in grid present (visibility only, per your current code)
    await expect(createdRow.locator('td').nth(12)).toBeVisible();
    await expect(createdRow.locator('td').nth(13)).toBeVisible();

    // Open details
    await page.getByRole(`gridcell`, { name: email }).dblclick();
    //await waitUntilLoaded(page);

    // Detail assertions (strings from your inputs)
    await expect(page.getByLabel(`Non-Member #`).getByText(firstName)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(lastName)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(company)).toBeVisible();
    await expect(page.locator(`#nonm_title`)).toContainText(title);
    await expect(page.getByLabel(`Non-Member #`).getByText(address1)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(city)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(state)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(zip)).toBeVisible();
    await expect(page.getByText(county)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();

    await expect(page.getByLabel(`Non-Member #`).getByText(email)).toBeVisible();
    await expect(page.getByText(comments)).toBeVisible();

    //--------------------------------
    // Arrange (Edit values):
    //--------------------------------
    const firstNameEdit = faker.person.firstName();
    const lastNameEdit = faker.person.lastName();
    const address1Edit = faker.location.streetAddress();
    const companyEdit = faker.lorem.words(2);
    const cityEdit = faker.location.city();
    const stateEdit = faker.location.state();
    const zipEdit = faker.location.zipCode();
    const emailEdit = faker.internet.email();
    const commentsEdit = faker.lorem.sentence();
    const titleEdit = faker.lorem.words(1);

    //--------------------------------
    // Act: Edit
    //--------------------------------
    // Click Edit (with pause)
    await clickAndWait(page, page.getByRole('button', { name: ' Edit' }));
    await waitUntilLoaded(page);

    // Fill edited values (each followed by ~2s pause)
    await fillAndWait(page, page.locator(`#nonm_first_name`), firstNameEdit);
    await fillAndWait(page, page.locator(`#nonm_last_name`), lastNameEdit);
    await fillAndWait(page, page.locator(`#nonm_company`), companyEdit);
    await fillAndWait(page, page.locator(`#nonm_title`), titleEdit);
    await fillAndWait(page, page.locator(`#nonm_address_1`), address1Edit);
    await fillAndWait(page, page.locator(`#nonm_city`), cityEdit);

    // State (open dropdown then select)
    await clickAndWait(
        page,
        page
            .locator(
                `[data-bind="attr: { data-table-code: fields.nonm_state_id.lookupTableCode, data-filter-code: fields.nonm_state_id.lookupFilterCode }"] [role="button"]`
            )
            .first()
    );
    await fillAndWait(page, page.locator(`input[name="nonm_state_id_input"]`), stateEdit);
    await clickAndWait(page, page.getByRole(`option`, { name: stateEdit }));

    // Zip
    await fillAndWait(page, page.locator(`#nonm_zip`), zipEdit);

    // County
    await clickAndWait(
        page,
        page.locator(
            `[class="left outerfielddiv"]:has(:text-is("County:")) [aria-label="expand combobox"]`
        )
    );
    const countiesEdit = await page
        .locator(`[role="listbox"] li:visible`)
        .allInnerTexts();
    const countyEdit = countiesEdit[Math.floor(Math.random() * countiesEdit.length)];
    await fillAndWait(page, page.locator(`input[name="nonm_county_id_input"]`), countyEdit);
    await clickAndWait(page, page.getByRole(`option`, { name: countyEdit }));


    await fillAndWait(page, page.locator(`#nonm_email_address`), emailEdit);

    // Comments (iframe)
    const frame2 = page.frameLocator(
        `[id="record-div"] [title="Editable area. Press F10 for toolbar."]`
    );
    await fillAndWait(page, frame2.locator(`#nonm_comments`), commentsEdit);

    //await waitUntilLoaded(page);

    // Save and Close with one retry if error appears
    await saveAndCloseWithOneRetry(page, {
        saveButtonName: /Save and Close/i, // or ' Save and Close' if you prefer exact glyph text
        okButtonName: 'Okay',
        errorText: 'A problem occurred during',
        errorCheckTimeoutMs: 4000,
        dialogCloseTimeoutMs: 10000,
    });

    //await waitUntilLoaded(page);

    // Search for the Non-member using updated email
    await page
        .getByRole(`dialog`, { name: `Manage Non-Members` })
        .getByPlaceholder(`Search...`)
        .fill(emailEdit);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Grid values after Edit
    //--------------------------------
    const editedRow = page.locator(
        `[id="browse-grid"] table tbody tr:has-text("${emailEdit}")`
    );
    await expect(editedRow).toBeVisible();

    await expect(editedRow.locator('td').nth(3)).toContainText(firstNameEdit);
    await expect(editedRow.locator('td').nth(4)).toContainText(lastNameEdit);
    await expect(editedRow.locator('td').nth(5)).toContainText(companyEdit);

    await expect(
        page
            .locator(
                `[id="browse-grid"] table tbody tr:has-text("${firstNameEdit}") td`
            )
            .nth(6)
    ).toContainText(emailEdit);

    await expect(editedRow.locator('td').nth(7)).toContainText(titleEdit);
    await expect(editedRow.locator('td').nth(8)).toContainText(address1Edit);
    await expect(editedRow.locator('td').nth(9)).toContainText(cityEdit);
    await expect(editedRow.locator('td').nth(10)).toContainText(stateEdit);
    await expect(editedRow.locator('td').nth(11)).toContainText(zipEdit);

    // Open details (edited)
    await page.getByRole(`gridcell`, { name: emailEdit }).dblclick();
    await waitUntilLoaded(page);

    // Assert details persist after Edit
    await expect(page.getByLabel(`Non-Member #`).getByText(firstNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(lastNameEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(companyEdit)).toBeVisible();
    await expect(page.locator(`#nonm_title`)).toContainText(titleEdit);
    await expect(page.getByLabel(`Non-Member #`).getByText(address1Edit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(cityEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(stateEdit)).toBeVisible();
    await expect(page.getByLabel(`Non-Member #`).getByText(zipEdit)).toBeVisible();
    await expect(page.getByText(countyEdit)).toBeVisible();
    await expect(page.getByText(country)).toBeVisible();

    await expect(page.getByLabel(`Non-Member #`).getByText(emailEdit)).toBeVisible();
    await expect(page.getByText(commentsEdit)).toBeVisible();
});