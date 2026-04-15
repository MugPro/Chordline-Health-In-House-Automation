import { test, expect } from '@playwright/test';
// 🔧 Match your helpers location used in prior tests
import { logIn, waitUntilLoaded, cleanUpStratificationRuleWithCheckIfExistsCondition } from '../../../../helpers/Node20Helpers.js';

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
   Convenience helpers for this test
   ------------------------------------------- */
const searchForRule = async (page, value) => {
    const dlg = page.getByRole(`dialog`, { name: `Manage Stratification Rules` });
    await fillAndWait(dlg.getByPlaceholder(`Search...`), value);
    await clickAndWait(page, page.locator(`#admin-search-button`));
    //await waitUntilLoaded(page);
};

test('Create, Update, and Delete a Stratification Rule', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `StratificationRule`;
    const ruleName = `QAW rule`;
    const ruleNameEdited = `QAW rule - edited`;

    // Sign in to the app
    const { page } = await logIn({ loginID });

    // Ensure test is idempotent by cleaning up any pre-existing rule
    await cleanUpStratificationRuleWithCheckIfExistsCondition(page, { ruleName });

    //--------------------------------
    // Act: Navigate and Create
    //--------------------------------
    // Click the "Tools" button
    await clickAndWait(page, page.getByText(`Tools`));

    // Click the "Stratification" button
    await clickAndWait(page, page.getByText(`Stratification`, { exact: true }));
    //await waitUntilLoaded(page);

    // Click the " New" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` \u00A0New` })); // NBSP

    // Wait page load
    await waitUntilLoaded(page);

    // Fill "Rule Name:"
    await fillAndWait(page, page.getByRole(`textbox`, { name: `Rule Name:` }), ruleName);

    await waitUntilLoaded(page);

    // Click the "Save" button
    await clickAndWait(page, page.getByRole(`button`, { name: `Save` }));
    await waitUntilLoaded(page);

    // Close "New Stratification Rule" dialog
    await clickAndWait(page, page.getByLabel(`New Stratification Rule`).getByText(`Close`));

    await waitUntilLoaded(page);

    // Search for created rule
    //await searchForRule(page, ruleName);




    // Fill in search input field
    const manageDlg = page.getByRole(`dialog`, { name: `Manage Stratification Rules` });
    await manageDlg.getByPlaceholder(`Search...`).fill(ruleName);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);




    //--------------------------------
    // Assert: Rule created & active
    //--------------------------------
    // Assert the "QAW rule" gridcell is visible
    await expect(page.getByRole(`gridcell`, { name: ruleName })).toBeVisible();

    // Assert the "Active" column checkbox is checked
    await expect(page.locator(`.grid-active-checkbox`)).toBeChecked();

    //--------------------------------
    // Act: Edit and add a filter, rename rule
    //--------------------------------
    // Click the "QAW rule" gridcell
    await clickAndWait(page, page.getByRole(`gridcell`, { name: ruleName }));

    // Click the "" (Edit) button
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    await waitUntilLoaded(page);

    // Click the " Filter" button
    await clickAndWait(page, page.getByRole(`button`, { name: ` Filter` }));

    // Click the "Add" button
    await clickAndWait(page, page.getByRole(`button`, { name: `Add`, exact: true }));

    // Click "Select a field..." then choose "Age (yrs)"
    await clickAndWait(page, page.getByText(`Select a field...`).first());
    await clickAndWait(page, page.getByRole(`option`, { name: `Age (yrs)` }).locator(`span`));

    // Click "Increase value"
    await clickAndWait(page, page.getByRole(`button`, { name: `Increase value` }));

    // Update "Rule Name:" to edited name
    await fillAndWait(page, page.getByRole(`textbox`, { name: `Rule Name:` }), ruleNameEdited);

    await waitUntilLoaded(page);

    // Save changes
    await clickAndWait(page, page.getByRole(`button`, { name: `Save` }));
    await waitUntilLoaded(page);

    // Close the "Edit Stratification Rule" dialog
    await clickAndWait(page, page.getByLabel(`Edit Stratification Rule`).getByText(`Close`));

    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Edits persisted
    //--------------------------------
    // Assert the "QAW rule - edited" gridcell is visible
    await expect(page.getByRole(`gridcell`, { name: ruleNameEdited })).toBeVisible();

    // Open the edited rule again
    await clickAndWait(page, page.getByRole(`gridcell`, { name: ruleNameEdited }));
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    await waitUntilLoaded(page);

    // Verify updated name value
    await expect(page.locator(`#rule_name`)).toHaveValue(ruleNameEdited);

    // Verify the added filter field appears
    await expect(page.getByText(`Age (yrs)`, { exact: true })).toHaveText(`Age (yrs)`);

    //--------------------------------
    // Act: Close and Delete
    //--------------------------------
    // Close the editor
    await clickAndWait(page, page.getByLabel(`Edit Stratification Rule`).getByText(`Close`));

    await waitUntilLoaded(page);

    // Search for the original text just like your steps show
    //await searchForRule(page, ruleName);




    // Fill in search input field
    await manageDlg.getByPlaceholder(`Search...`).fill(ruleNameEdited);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);




    // Select the edited rule row
    await clickAndWait(page, page.getByRole(`gridcell`, { name: ruleNameEdited }));

    // Click Delete icon
    await clickAndWait(page, page.getByRole(`button`, { name: `` }));

    // Confirm delete
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
    await waitUntilLoaded(page);



    //--------------------------------
    // Assert: Rule removed
    //--------------------------------
    await expect(page.getByRole(`gridcell`, { name: ruleNameEdited })).not.toBeVisible();
});