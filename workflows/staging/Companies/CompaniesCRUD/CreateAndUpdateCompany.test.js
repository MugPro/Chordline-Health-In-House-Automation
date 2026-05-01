
import { test, expect } from '@playwright/test';
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";








async function acceptDeactivationWarningIfPresent(page) {
    const notif = page.locator('#notif-message');

    // Fast presence check (no throw if absent)
    const visible = await notif.isVisible({ timeout: 1200 }).catch(() => false);
    if (!visible) return;

    // Optional content guard; relax if your wording changes
    const text = (await notif.textContent()) || '';
    const looksLikeDeactivation =
        /once saved.*deactivates.*child companies linked to this record/i.test(text);

    // Find the specific Notification dialog that contains this message
    const dialog = page
        .getByRole('dialog', { name: /notification/i })
        .filter({ has: notif });

    const dialogCount = await dialog.count();

    if (dialogCount > 0) {
        // Click "OK" / "Okay" within that dialog
        const okButton = dialog.getByRole('button', { name: /^(ok|okay)$/i });
        if (await okButton.isVisible().catch(() => false)) {
            await okButton.click();
            return;
        }
    }

    // Fallback: if for some reason we couldn't scope, click a global "Okay"
    // (This should be rare; scoping above avoids strict mode issues.)
    await page.getByRole('button', { name: /^(ok|okay)$/i }).click();
}







test.describe('Companies CRUD - Create and Update Company', () => {
    test('Create a company, then update it and verify changes', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        // Constants
        const loginID = 'CompaniesCRUD';
        const screenTemplateCopyName = `company${Date.now()}`;
        const companyDesc = 'company description';
        const editedCompanyDesc = `${companyDesc} edited`;
        const companyComment = 'company comment';

        // Login
        //const { page, context, browser } = await logIn({ loginID, slowMo: 300 });



        const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
        const url = env.DEFAULT_URL;





        // Sign in to the app
        const { page, context, browser } = await logIn3({ loginID, password,
            url, slowMo: 300 });





        //--------------------------------
        // Act: Create
        //--------------------------------

        // Click `Tools` button
        await page.getByText('Tools').click();

        // Click `Companies` button from dropdown menu
        await page.getByText('Companies', { exact: true }).click();


        //await waitUntilLoaded(page);


        // Click `New` button (glyph text may vary; use a resilient matcher)
        const newButton = page.getByRole('button', { name: /new/i });
        await newButton.click();

        //await waitUntilLoaded(page);

        // Fill in Company code
        await page.locator('#comp_code').fill(screenTemplateCopyName);

        // Fill in description
        await page.locator('#comp_description').fill(companyDesc);

        //await waitUntilLoaded(page);

        // Click `Save and Close` button (use regex to avoid glyph issues)
        const saveAndClose = page.getByRole('button', { name: /save and close/i });
        await saveAndClose.click();

        //await waitUntilLoaded(page);

        // Wait for the Manage Companies dialog to appear
        const manageCompaniesDialog = page.getByRole('dialog', { name: /manage companies/i });
        await expect(manageCompaniesDialog).toBeVisible();

        // Fill in newly created company name in search
        await manageCompaniesDialog.getByPlaceholder('Search...').fill(screenTemplateCopyName);

        // Click `Search` button
        await page.locator('#admin-search-button').click();

        //await waitUntilLoaded(page);


        //--------------------------------
        // Assert: Verify creation in grid
        //--------------------------------
        // Verify that newly created company record is visible
        await expect(page.getByRole('gridcell', { name: screenTemplateCopyName })).toBeVisible();

        // Verify that newly created company description is visible
        await expect(page.getByRole('gridcell', { name: companyDesc })).toBeVisible();


        //--------------------------------
        // Act: Edit
        //--------------------------------
        // Click company code
        await page.getByRole('gridcell', { name: screenTemplateCopyName }).click();

        //await waitUntilLoaded(page);

        // Click `Edit` button
        // If your UI only shows a glyph like "", keep the first line;
        // If there is an accessible label "Edit", the fallback helps.
        const editButtonGlyph = page.getByRole('button', { name: '' });
        const editButtonLabeled = page.getByRole('button', { name: /edit/i });
        if (await editButtonGlyph.count()) {
            await editButtonGlyph.first().click();

            //await waitUntilLoaded(page);

        } else {
            await editButtonLabeled.click();

            //await waitUntilLoaded(page);
        }

        // Fill in updated description
        await page.locator('#comp_description').fill(editedCompanyDesc);

        // Fill in comment
        await page.locator('#comp_comment').fill(companyComment);

        //await waitUntilLoaded(page);

        // Click `Active` checkbox to deactivate company
        // Prefer a labeled checkbox if available; fallback to the unlabeled locator from your snippet.
        let activeCheckbox;
        if (await page.getByRole('checkbox', { name: /active/i }).count()) {
            activeCheckbox = page.getByRole('checkbox', { name: /active/i }).first();

            //await waitUntilLoaded(page);

        } else {
            activeCheckbox = page.getByLabel('', { exact: true });
        }
        await activeCheckbox.click();

        //await waitUntilLoaded(page);



        // If the deactivation warning appears here, accept it
        await acceptDeactivationWarningIfPresent(page);


        await page.getByRole('button', { name: 'select' }).nth(3).click();
        await page.locator('#comp_end_date').press('Enter');



        //await waitUntilLoaded(page);

        // Click `Save and Close` button
        await page.getByRole('button', { name: /save and close/i }).click();

        //await waitUntilLoaded(page);

        // Ensure the grid is back and search is still applied (or re-apply search if needed)
        const manageCompaniesDialog2 = page.getByRole('dialog', { name: /manage companies/i });
        await expect(manageCompaniesDialog2).toBeVisible();

        // If the grid reloaded, ensure the row shows again
        await manageCompaniesDialog2.getByPlaceholder('Search...').fill(screenTemplateCopyName);

        //await waitUntilLoaded(page);

        await page.locator('#admin-search-button').click();

       // await waitUntilLoaded(page);



        //--------------------------------
        // Assert: Verify updates in grid
        //--------------------------------
        // Verify that updated description is visible
        await expect(page.getByRole('gridcell', { name: editedCompanyDesc })).toBeVisible();

        // Verify that the company comment is visible
        await expect(page.getByRole('gridcell', { name: companyComment })).toBeVisible();

        // Verify that the "Active" checkbox is unchecked for the row of this company
        // Scope to the corresponding row to avoid false positives on other rows
        const companyRow = page.getByRole('row', { name: new RegExp(`${screenTemplateCopyName}`) });
        await expect(companyRow).toBeVisible();

        const rowCheckbox = companyRow.getByRole('checkbox');
        await expect(rowCheckbox).not.toBeChecked();

        // Cleanup
        await context.close();
        await browser.close();

    });
});


