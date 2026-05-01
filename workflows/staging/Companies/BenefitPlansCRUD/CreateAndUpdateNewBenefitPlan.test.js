// Filename: CreateAndUpdateNewBenefitPlan.test.js

import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';
import {env} from "../../../../environments/staging.env.js";

test.describe('Benefit Plans — Create & Update', () => {
    test('Create a new Benefit Plan, verify, edit fields, and re-verify', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const loginID = `BenefitPlans`;
        const benefitsPlan = `benefitPlan${Date.now()}`;
        const benefitsPlansDesc = `benefits description`;
        const editedCompanyDesc = benefitsPlansDesc + ' edited';
        const companyComment = `benefits comment`;

        // Login
        //const { page, context, browser } = await logIn({ loginID, slowMo: 300 });


        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url, slowMo: 300 });




        try {
            //--------------------------------
            // Act:
            //--------------------------------
            // Click `Tools` button
            await page.getByText(`Tools`).click();

            // Click `Companies` button from dropdown menu
            await page.getByText(`Companies`).click();

            //await waitUntilLoaded(page);

            // Click `Benefit Plans` button
            await page.getByLabel(`Manage Companies`).getByText(`Benefit Plans`).click();

            // Click `New` button (NBSP between icon and New)
            await page.getByRole(`button`, { name: ` \u00A0New` }).click();



            // Fill in Company code
            await page.locator(`#plan_benefit_plan_code`).fill(benefitsPlan);

            // Fill in description
            await page.locator(`#plan_benefit_plan_description`).fill(benefitsPlansDesc);

            //await waitUntilLoaded(page);

            // Click `Effective Date` calendar button (3rd select in form)
            await page.getByRole(`button`, { name: `select` }).nth(2).click();
            //await waitUntilLoaded(page);
            await page.keyboard.press(`Enter`);




            // Click `Save and close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();


            // Fill in newly created company name in search
            await page
                .getByRole(`dialog`, { name: `Manage Companies` })
                .getByPlaceholder(`Search...`)
                .fill(benefitsPlan);

            // Click `Search` button
            await page.locator(`#admin-search-button`).click();
            //await waitUntilLoaded(page);

            //--------------------------------
            // Assert (after create):
            //--------------------------------
            // Verify that newly created company record is visible
            await expect(page.getByRole(`gridcell`, { name: benefitsPlan })).toBeVisible();

            // Verify that newly created company description is visible
            await expect(page.getByRole(`gridcell`, { name: benefitsPlansDesc })).toBeVisible();

            //--------------------------------
            // Act (edit):
            //--------------------------------
            // Click company code
            await page.getByRole(`gridcell`, { name: benefitsPlan }).click();

            // Click `Edit` button
            await page.getByRole(`button`, { name: `` }).click();



            // Fill in updated description
            await page.locator(`#plan_benefit_plan_description`).fill(editedCompanyDesc);

            // Fill in comment
            await page.locator(`#plan_benefit_plan_comments`).fill(companyComment);

            // Click `Active` checkbox to deactivate company
            // (Using generic label as provided in source data)
            await page.getByLabel(``, { exact: true }).click();

           // await waitUntilLoaded(page);

            // Click Term Date
            await page
                .locator(`button[aria-label="select"][role="button"]`)
                .last()
                .click()

            //Select date with enter
            await page.keyboard.press(`Enter`);

            // Click `Effective Date` calendar button
            await page
                .locator(`button[aria-label="select"][role="button"]`)
                .first()
                .click();

            // Click back button
            await page.getByRole(`button`, { name: `Previous`, exact: true }).click();
            await page.keyboard.press(`Enter`);

            // Click Term Date
            await page
                .locator(`button[aria-label="select"][role="button"]`)
                .last()
                .click()

            //Select date with enter
            await page.keyboard.press(`Enter`);









            // Click `Save and close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();


            //--------------------------------
            // Assert (after update):
            //--------------------------------
            // Verify that company description has been updated
            await expect(page.getByRole(`gridcell`, { name: editedCompanyDesc })).toBeVisible();

            // Verify that the company comment is visible
            await expect(page.getByRole(`gridcell`, { name: companyComment })).toBeVisible();

            // Verify that the active checkbox is unchecked
            // (Assumes the grid shows a single active checkbox for the selected row)
            await expect(page.getByRole(`checkbox`)).not.toBeChecked();
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});