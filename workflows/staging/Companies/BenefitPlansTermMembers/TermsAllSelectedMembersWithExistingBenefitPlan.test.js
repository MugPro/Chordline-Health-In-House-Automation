// Filename: TermsAllSelectedMembersWithExistingBenefitPlan.test.js

import { test, expect } from '@playwright/test';
import {logIn, waitUntilLoaded, addMember, logIn3} from '../../../../helpers/Node20Helpers.js';

// ---- Provide npmImports for helpers that expect it (no config needed) ----
import { faker as rawFaker } from '@faker-js/faker';
import * as dateFns from 'date-fns';
import {env} from "../../../../environments/staging.env.js";

// Optional: Shim Faker v8+ to old API your helper uses (faker.name.*, faker.address.*)
const faker = {
    ...rawFaker,
    name: {
        firstName: rawFaker.person.firstName,
        lastName: rawFaker.person.lastName,
    },
    address: {
        streetAddress: rawFaker.location.streetAddress,
        city: rawFaker.location.city,
        zipCode: rawFaker.location.zipCode,
        state: rawFaker.location.state,
    },
};

// Expose for your helper (kept untouched)
globalThis.npmImports = { faker, dateFns };
// --------------------------------------------------------------------------

test.describe('Term Members — All selected members with existing benefit plan', () => {
    test('Terms all selected members with the existing benefit plan and verifies term date/details', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `TermMembers`;
       // const benefitPlan = `Benefit Plan - Term all selected`;
        const benefitPlan = `PLAN A`;
        const benefitPlanDesc = `Test for term and re-enroll members`;

        // Dates (use date-fns to match your app’s calendar & display formats)
        const today = new Date();
        const oneDayFromNow = dateFns.addDays(today, 1);
        const day = dateFns.format(oneDayFromNow, 'dd');
        const fullDay = dateFns.format(oneDayFromNow, 'MM/dd/yyyy');
        const weekday = dateFns.format(oneDayFromNow, 'EEEE'); // e.g., "Wednesday"
        const monthName = dateFns.format(oneDayFromNow, 'MMMM'); // e.g., "August"
        const year = dateFns.format(oneDayFromNow, 'yyyy');

        // Title formats used by the calendar widget (robust: try full title, then fallback)
        const calendarTitleFull = `${weekday}, ${monthName} ${day}, ${year}`;
        const calendarTitleShort = `${weekday}, ${monthName} ${day},`;

        // Login
        //const { page, context, browser } = await logIn({ loginID, slowMo: 10 });


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url, slowMo: 10 });





        try {
            //--------------------------------
            // Create new member (in the given benefit plan)
            //--------------------------------
            await addMember(page, {dontCloseWorklog: true});
            //await waitUntilLoaded(page);

            //--------------------------------
            // Act:
            //--------------------------------
            // Save and close the member record
            await page.getByRole(`button`, {name: ` Save and Close`}).click();
           // await waitUntilLoaded(page);

            // Tools > Companies
            await page.getByText(`Tools`).click();
            await page.getByText(`Companies`).click();
           // await waitUntilLoaded(page);

            // Benefit Plans tab
            await page.getByText(`Benefit Plans`, {exact: true}).click();
           // await waitUntilLoaded(page);

            // Plan Maintenance (Term and Re-*)
            await page
                .getByRole(`button`)
                .filter({hasText: `Plan Maintenance Term and Re-`})
                .click();
            //await waitUntilLoaded(page);

            // Term Members flow
            await page.getByRole(`link`, {name: `Term Members`}).click();
            //await waitUntilLoaded(page);

            // Existing Benefit Plan combobox (expand & pick by description)
            await page.getByRole(`button`, {name: `expand combobox`}).click();
           // await waitUntilLoaded(page);
            await page.getByRole(`option`, {name: 'benefits description'}).locator(`span`).first().click();
           // await waitUntilLoaded(page);

            // Open calendar for Term Date
            await page
                .getByRole(`dialog`, {name: `Term Members`})
                .getByLabel(`select`)
                .click();
           // await waitUntilLoaded(page);

            // Pick the date (try full title first; fallback to shorter title if needed)
            const calendar = page.locator(`#plan_benefit_plan_term_date_dateview`);
            const fullTitleLocator = calendar.getByTitle(calendarTitleFull).first();
            const shortTitleLocator = calendar.getByTitle(calendarTitleShort).first();

            if (await fullTitleLocator.count()) {
                await fullTitleLocator.click();
            } else {
                await shortTitleLocator.click();
            }


        } finally {
            // Cleanup
            await context.close();
            await browser.close();
        }
    });
});