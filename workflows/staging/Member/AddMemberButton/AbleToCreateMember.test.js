import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

// ✅ Match your helpers location used in prior tests
import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
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

test('Able to create a Member', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `AddMemberButton`;

    const firstName = `QAW${faker.person.firstName()}`;
    const lastName = faker.person.lastName();

    const coverageType = `Permanent`; // Permanent | Temporary
    const memberId = `QAW${Date.now()}`;
    const subscriberIs = `Self`; // Self | Other

    const today = Date.now();
    const effectiveDate = dateFns.format(today, 'MM dd yyyy');

    const address1 = faker.location.streetAddress();
    const city = faker.location.city();
    const zip = faker.location.zipCode();
    const state = faker.location.state();

    const birthdate = dateFns.format(
        dateFns.subYears(today, 20),
        'MM dd yyyy',
    );

    const birthdateFormat = dateFns.format(
        dateFns.subYears(today, 20),
        'MM/dd/yyyy',
    );

    const benefitPlan = 'Excellent Health Plan';

    // Log in
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });






    //--------------------------------
    // Act: Create Member
    //--------------------------------
    // Click the "+ Add Member" button
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Add Member' }),
    );
    await waitUntilLoaded(page);

    // Fill in First and Last Name
    await fillAndWait(page, page.locator('#pers_first_name'), firstName);
    await fillAndWait(page, page.locator('#pers_last_name'), lastName);

    // Select Coverage Type
    await clickAndWait(
        page,
        page.getByRole('radio', { name: coverageType, exact: true }),
    );

    // Fill in Member Identifier
    await fillAndWait(
        page,
        page.locator('#pati_member_identifier'),
        memberId,
    );

    // Select Subscriber is: Self
    await clickAndWait(
        page,
        page.getByRole('radio', { name: subscriberIs }),
    );

    // Fill in Effective Date
    const effectiveDateInput = page.locator('#elco_effective_date');
    await effectiveDateInput.click();
    await effectiveDateInput.clear();
    await effectiveDateInput.pressSequentially(effectiveDate);

    // Click "..." button on the Benefit Plan line (2nd instance)
    await clickAndWait(
        page,
        page.getByRole('button', { name: '...' }).nth(1),
    );
    await waitUntilLoaded(page);

    // Select Benefit Plan
    await clickAndWait(
        page,
        page.getByRole('gridcell', {
            name: benefitPlan,
            exact: true,
        }),
    );

    // Click "Select"
    await clickAndWait(
        page,
        page.getByRole('button', { name: 'Select', exact: true }),
    );
    await waitUntilLoaded(page);

    // Fill Address
    await fillAndWait(page, page.locator('#pad1_address_1'), address1);
    await fillAndWait(page, page.locator('#pad1_city'), city);
    await fillAndWait(page, page.locator('input[name="pad1_zip"]'), zip);

    // Fill State
    await fillAndWait(
        page,
        page.locator('input[name="pad1_state_id_input"]'),
        state,
    );

    await clickAndWait(
        page,
        page.getByRole('option', { name: state }).locator('span'),
    );

    // Fill Birthdate
    const birthdateInput = page.locator('#pers_birthdate');
    await birthdateInput.click();
    await birthdateInput.clear();
    await birthdateInput.pressSequentially(birthdate);

    // Save and Close
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );
    await waitUntilLoaded(page);

    // Save and Close Work Log popup
    await clickAndWait(
        page,
        page.getByRole('button', { name: ' Save and Close' }),
    );
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Member Created
    //--------------------------------
    /*
    // Member tab name
    await expect(
        page.locator(`#member-tab-name:has-text("${lastName}, ${firstName}")`),
    ).toBeVisible();


     */


    // Member Detail page
    await expect(
        page.locator('#membername-anchor').getByText('Member Name'),
    ).toBeVisible();

    /*

    // Name
    await expect(page.getByText(firstName)).toBeVisible();
    await expect(page.getByText(lastName)).toBeVisible();

     */




    // Member tab name
    await expect(
        page.locator('#member-tab-name')
    ).toHaveText(`${lastName}, ${firstName}`);

// Member Detail - Name fields
    await expect(
        page.locator('#pers_first_name').getByText(firstName)
    ).toBeVisible();

    await expect(
        page.locator('#pers_last_name').getByText(lastName)
    ).toBeVisible();




/*
    // Address
    await expect(page.getByText(address1)).toBeVisible();
    await expect(page.getByText(city)).toBeVisible();
    await expect(page.getByText(zip)).toBeVisible();
    await expect(page.getByText(state)).toBeVisible();

 */






    // Preferred Address - Address fields
    await expect(
        page.locator('#pad1_address_1').getByText(address1)
    ).toBeVisible();

    await expect(
        page.locator('#pad1_city').getByText(city)
    ).toBeVisible();





    await expect(page.getByText(zip, { exact: true })).toBeVisible();




    await expect(page.getByText(state, { exact: true })).toBeVisible();




    // Birthdate
    await expect(
        page.locator(`#pers_birthdate:has-text("${birthdateFormat}")`),
    ).toBeVisible();

    // Benefit Plan
    await expect(page.getByText(benefitPlan)).toBeVisible();
});