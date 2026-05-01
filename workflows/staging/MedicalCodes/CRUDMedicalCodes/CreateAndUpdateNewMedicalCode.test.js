// CreateAndUpdateNewMedicalCode.test.js

import { test, expect } from '@playwright/test';

// 🔧 Match your helpers location used across your suite
import {logIn, logIn3, waitUntilLoaded} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

test('Create and update a new Medical Code', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `MedicalCode`;
    const medicalCode = `medical code${Date.now()}`;
    const medicalCodeDesc = `medical code desc`;
    const editedMedicalCodeDesc = medicalCodeDesc + ' edited';
    const editedMedicalCodeDescMedum = medicalCodeDesc + ' medium';

    // Login
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });





    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click `Tools`
    await page.getByText(`Tools`).click();

    // Click `Medical Codes`
    await page.getByText(`Medical Codes`).click();
   // await waitUntilLoaded(page);

    // Click `New`
    // Using regex for robustness against &nbsp; inside label
    await page.getByRole(`button`, { name: /New/i }).click();
    await waitUntilLoaded(page);

    // Medical Code
    await page.locator(`#code_code`).fill(medicalCode);

    // Code Set: CPT
    await page.getByRole(`button`, { name: `expand combobox` }).click();
    await page.getByRole(`option`, { name: `CPT` }).locator(`span`).click();

    // Code Type: Diagnosis
    await page
        .getByRole(`combobox`)
        .filter({ hasText: `DiagnosisProcedure` })
        .getByLabel(`select`)
        .click();
    await page.getByRole(`option`, { name: `Diagnosis` }).locator(`span`).click();

    // Description (short) — use baseline description so grid assertion matches
    await page.locator(`#code_description`).fill(medicalCodeDesc);

    // Effective Date: open calendar and select today's (Enter)
    await page.getByRole(`dialog`, { name: `New Medical Code` }).getByLabel(`select`).nth(1).click();
    await page.keyboard.press(`Enter`);

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    // Search by the medical code
    await page
        .getByRole(`dialog`, { name: `Manage Medical Codes` })
        .getByPlaceholder(`Search...`)
        .fill(medicalCode);
    await page.locator(`#admin-search-button`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Creation
    //--------------------------------
    // Medical Code appears in grid
    await expect(page.getByRole(`gridcell`, { name: medicalCode })).toBeVisible();

    // Short Description appears in grid
    await expect(page.getByRole(`gridcell`, { name: medicalCodeDesc })).toBeVisible();

    //--------------------------------
    // Act: Update
    //--------------------------------
    // Select the created record
    await page.getByRole(`gridcell`, { name: medicalCode }).click();

    // Click Edit
    await page.getByRole(`button`, { name: `` }).click();
    await waitUntilLoaded(page);

    // Update Short Description
    await page.locator(`#code_description`).fill(editedMedicalCodeDesc);

    // Update Medium Description
    await page.locator(`#code_description_medium`).fill(editedMedicalCodeDescMedum);

    // Toggle Active checkbox (turn OFF so it's unchecked in grid)
    // The original steps used `.click()`; keeping that to match your UI behavior.
    await page.locator(`#code_is_active-3`).click();

    await waitUntilLoaded(page);

    // Save and Close
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Update
    //--------------------------------
    // Edited short description visible in grid
    await expect(page.getByRole(`gridcell`, { name: editedMedicalCodeDesc })).toBeVisible();

    // Edited medium description visible in grid
    await expect(page.getByRole(`gridcell`, { name: editedMedicalCodeDescMedum })).toBeVisible();

    // Verify Active checkbox is unchecked in the grid row for this medical code
    await expect(
        page.locator(
            `[id="browse-grid"] table tbody tr:has-text("${medicalCode}") input[type="checkbox"]`
        )
    ).not.toBeChecked();
});