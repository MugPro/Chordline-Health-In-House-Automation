
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












// --- Date helpers (no external deps) ---
const pad2 = (n) => String(n).padStart(2, '0');
const WEEKDAYS = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
function formatCalLong(date) {
    // EEEE, MMMM dd, yyyy  -> e.g., "Wednesday, March 11, 2026"
    const wd = WEEKDAYS[date.getDay()];
    const m = MONTHS[date.getMonth()];
    const d = pad2(date.getDate());
    const y = date.getFullYear();
    return `${wd}, ${m} ${d}, ${y}`;
}
function formatMMDDYYYY(date, sep = '/') {
    return `${pad2(date.getMonth() + 1)}${sep}${pad2(date.getDate())}${sep}${date.getFullYear()}`;
}
function formatMMDDYYYY_Spaced(date) {
    // "MM dd yyyy" (with spaces, used for typing)
    return `${pad2(date.getMonth() + 1)} ${pad2(date.getDate())} ${date.getFullYear()}`;
}
function addDays(d, days) {
    const nd = new Date(d.getTime());
    nd.setDate(nd.getDate() + days);
    return nd;
}

test.describe('Term & Re-Enroll Members — All selected members, existing plan → new plan', () => {
    test('Terms existing eligibility and re-enrolls into new benefit plan with correct dates', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `TermReEnrollMembers`;
        const benefitPlan = `DND TermReEnroll Plan`;
        const benefitPlanDesc = `Test for term and re-enroll members`;

        const today = new Date();
        const todayCalFormat = formatCalLong(today);          // EEEE, MMMM dd, yyyy
        const todayEffDateFormat = formatMMDDYYYY(today, '/'); // MM/dd/yyyy
        const effDate = formatMMDDYYYY_Spaced(today);          // MM dd yyyy

        const oneDayFromNow = addDays(today, 1);
        const oneDayCalFormat = formatCalLong(oneDayFromNow);
        const oneDayEffDateFormat = formatMMDDYYYY(oneDayFromNow, '/');

        // Login
        //const { page, context, browser } = await logIn({ loginID });


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url });




        try {
            //--------------------------------
            // Navigate to Tools > Companies > Benefit Plans
            //--------------------------------
            await page.getByText(`Tools`).click();
            await page.getByText(`Companies`).click();

            await waitUntilLoaded(page);

            // Click the "Benefit Plans" tab on the "Manage Companies" page
            await page
                .getByRole(`treeitem`, { name: `Benefit Plans` })
                .locator(`span`)
                .first()
                .click();


            await waitUntilLoaded(page);

            // Search for our benefit plan
            await page
                .getByRole(`dialog`, { name: `Manage Companies` })
                .getByPlaceholder(`Search...`)
                .fill(benefitPlan);
            await waitUntilLoaded(page);
            await page.locator(`#admin-search-button`).click();
            await waitUntilLoaded(page);

            try {
                // Verify that the benefit plan exists
                await expect(
                    page.locator(`[id="browse-grid"] table tbody tr:has-text("${benefitPlan}")`)
                ).toBeVisible();

                await waitUntilLoaded(page);

                // Close the Manage Companies dialog
                await page.getByText(`Close`, { exact: true }).click();

                await waitUntilLoaded(page);

            } catch {
                // Create the benefit plan if it does not exist
                await page.getByRole(`button`, { name: ` \u00A0New` }).click();

                await waitUntilLoaded(page);

                // Fill fields
                await page.locator(`#plan_benefit_plan_code`).fill(benefitPlan);

                await waitUntilLoaded(page);

                await page.locator(`#plan_benefit_plan_description`).fill(benefitPlanDesc);

                await waitUntilLoaded(page);

                // Effective Date (type "MM dd yyyy")
                await page.locator(`#plan_benefit_plan_effective_date`).clear();

                await waitUntilLoaded(page);

                await page.locator(`#plan_benefit_plan_effective_date`).pressSequentially(effDate);

                await waitUntilLoaded(page);

                // Save & Close
                await page.getByRole(`button`, { name: ` Save and Close` }).click();
                await waitUntilLoaded(page);

                // Search again & verify
                await page
                    .getByRole(`dialog`, { name: `Manage Companies` })
                    .getByPlaceholder(`Search...`)
                    .fill(benefitPlan);


                await waitUntilLoaded(page);

                await page.locator(`#admin-search-button`).click();

                await waitUntilLoaded(page);

                await expect(
                    page.locator(`[id="browse-grid"] table tbody tr:has-text("${benefitPlan}")`)
                ).toBeVisible();

                // Close the Manage Companies popup
                await page.getByText(`Close`, { exact: true }).click();
            }


            await waitUntilLoaded(page);

            //--------------------------------
            // Create new member in this benefit plan
            //--------------------------------
            await addMember(page, { benefitPlan, dontCloseWorklog: true });

            await waitUntilLoaded(page);

            // Save and Close on the Member screen
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Act: Term & Re-Enroll Members
            //--------------------------------
            // Tools > Companies
            await page.getByText(`Tools`).click();
            await page.getByText(`Companies`).click();

            await waitUntilLoaded(page);

            // Benefit Plans tab
            await page.getByText(`Benefit Plans`, { exact: true }).click();

            await waitUntilLoaded(page);

            // Plan Maintenance (Term and Re-*)
            await page
                .getByRole(`button`)
                .filter({ hasText: `Plan Maintenance Term and Re-` })
                .click();


            await waitUntilLoaded(page);

            // Term and Re-Enroll Members link
            await page.getByRole(`link`, { name: `Term and Re-Enroll Members` }).click();


            await waitUntilLoaded(page);

            // Existing Benefit Plan
            await page.locator(`input[name="plan_benefit_plan_id_input"]`).fill(benefitPlanDesc);

            await waitUntilLoaded(page);

            await page.getByRole(`option`, { name: benefitPlanDesc }).locator(`span`).first().click();


            await waitUntilLoaded(page);

            // Eligibility Term Date → calendar (first)
            await page
                .getByRole(`dialog`, { name: `Term and Re-enroll Members` })
                .getByLabel(`select`)
                .first()
                .click();


            await waitUntilLoaded(page);

            // Pick today's date by title
            await page
                .locator(`#plan_benefit_plan_term_date_dateview`)
                .getByTitle(todayCalFormat)
                .first()
                .click();


            await waitUntilLoaded(page);

            // New Benefit Plan
            await page.locator(`input[name="plan_benefit_new_plan_id_input"]`).fill(benefitPlanDesc);

            await waitUntilLoaded(page);

            await page.getByRole(`option`, { name: benefitPlanDesc }).locator(`span`).click();


            await waitUntilLoaded(page);

            // Eligibility Effective Date → calendar (second)
            await page
                .getByRole(`dialog`, { name: `Term and Re-enroll Members` })
                .getByLabel(`select`)
                .nth(1)
                .click();


            await waitUntilLoaded(page);

            // Pick tomorrow's date by title
            await page
                .locator(`#plan_benefit_plan_effective_date_dateview`)
                .getByTitle(oneDayCalFormat)
                .click();



            await waitUntilLoaded(page);

            // Save and close
            await page.getByRole(`button`, { name: ` Save and Close` }).click();

            await waitUntilLoaded(page);

            // Verify the confirmation prompt
            await expect(
                page.getByText(`Members eligible to term & re-enroll : `) // render uses '&'
            ).toBeVisible();

            // Confirm
            await page.getByRole(`button`, { name: `Yes` }).click();

            await waitUntilLoaded(page);

            // Close Manage Companies
            await page.getByLabel(`Manage Companies`).getByText(`Close`).click();


            await waitUntilLoaded(page);

            //--------------------------------
            // Verify member coverage (eligibility rows & dates)
            //--------------------------------
            await page.getByText(`Member Coverage`).first().click();

            await waitUntilLoaded(page);

            // Open the coverage detail by double-clicking the benefit plan row
            await page.getByRole(`gridcell`, { name: benefitPlanDesc }).dblclick();

            await waitUntilLoaded(page);

            // Show "All" in eligibility filter
            await page.locator(`[id*="quickfilter-eligibility-active-all"]`).click();


            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // There should be two eligibility rows
            const eligRows = page.locator(`#eligibility-child-grid table tbody tr`);
            await expect(eligRows).toHaveCount(2);

            // Build locators for the two rows for this benefitPlanDesc
            const planRows = page
                .locator(`#eligibility-child-grid table tbody tr:has-text("${benefitPlanDesc}")`);

            // First row (index 0): Effective date = today, Term date = today
            const firstRowEffCell = planRows.nth(0).locator('td').nth(3);
            const firstRowTermCell = planRows.nth(0).locator('td').nth(4);
            await expect(firstRowEffCell).toContainText(todayEffDateFormat);
            await expect(firstRowTermCell).toContainText(todayEffDateFormat);

            // Second row (index 1): Effective date = tomorrow, Term date = empty
            const secondRowEffCell = planRows.nth(1).locator('td').nth(3);
            const secondRowTermCell = planRows.nth(1).locator('td').nth(4);
            await expect(secondRowEffCell).toContainText(oneDayEffDateFormat);
            await expect(secondRowTermCell).toHaveText('');
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});