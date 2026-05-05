// helpers/helpers.js

import { chromium } from 'playwright';

import { format } from 'date-fns';

// Load environment variables from .env
//import 'dotenv/config';


import { test, expect } from '@playwright/test';









import { faker } from '@faker-js/faker';
import { subYears } from 'date-fns';






export async function launch(options = {}) {
    const isHeadedCLI = process.argv.includes('--headed');

    // Determine headless mode
    const headless =
        options.headless !== undefined
            ? options.headless            // explicit override
            : process.env.CI === 'true'   // GitHub Actions
                ? true
                : isHeadedCLI             // CLI --headed
                    ? false
                    : process.env.HEADLESS === 'true';          // default locally headed

    console.log(`🚀 Launching browser with headless: ${headless ? 'true' : 'false'}`);

    const browser = await chromium.launch({
        headless,
        slowMo: options.slowMo ?? 0,
    });

    return { browser };
}





export async function launchWithoutLogin(options = {}) {
    const url = options.url || process.env.DEFAULT_URL;

    // Launch Playwright browser
    const browser = await chromium.launch({ headless: true, slowMo: 50 });

    // Create a context
    const context = await browser.newContext();

    // Open a new page
    const page = await context.newPage();

    // Go to the URL
    await page.goto(url);

    return { page, context, browser };
}

export async function reportCleanupFailed({ dedupKey, errorMsg } = {}) {
    // Construct payload
    const payload = {
        runId: process.env.QAWOLF_RUN_ID,
        teamId: process.env.QAWOLF_TEAM_ID,
        workflowId: process.env.QAWOLF_WORKFLOW_ID,
        suiteId: process.env.QAWOLF_SUITE_ID,
        dedupKey,
        errorMsg,
    };

    // Prevents alerts when running in editor (RUN_ID will be undefined)
    if (!payload.runId) return;

    // Make a POST to the Cleanup Failure API to report failure
    const CLEANUP_API_URL =
        "https://qawolf-automation.herokuapp.com/apis/cleanup-fail";
    try {
// Click email on dropdown menu
        const response = await fetch(CLEANUP_API_URL, {
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
            method: "POST",
        });

        // If response is okay
        if (response.ok) {
            // Parse and return response
            return await response.json();
        }

        // Throw error is response is NOT ok
        throw Error(`HTTP error! Status: ${response.status}`);
    } catch (error) {
        // Throw if an error occurs during fetch or parsing response
        throw Error(`Fetch or parsing error! ${error.message}`);
    }
}








/*
export async function logIn(options = {}) {
  const loginID = options.loginID ?? process.env.DEFAULT_LOGIN;
  const password = options.password ?? process.env.DEFAULT_PASS_OCT_2025;
  const url =
    options.url ??
    process.env.DEFAULT_URL_2 ??
    process.env.DEFAULT_URL;

  if (!loginID || !password || !url) {
    throw new Error('Missing loginID, password, or URL');
  }

  const { browser } = await launch(options);
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  await page.goto(url);

  // Fill login form
  await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
  await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
  await page.getByRole('button', { name: 'SIGN IN' }).click();

  // ✅ Wait for either success OR error
  const loginError = page.getByText('Error Logging In');

  await Promise.race([
    page.waitForURL(/dashboard|home|main/i),
    loginError.waitFor({ timeout: 6000 }).catch(() => {})
  ]);

  if (await loginError.isVisible()) {
    throw new Error(
      `Login failed for ${loginID} at ${url} (credentials/environment mismatch)`
    );
  }

  return { page, context, browser };
}
 */




export async function logIn(options = {}) {
    const loginID = options.loginID || process.env.DEFAULT_LOGIN;
    const password = options.password || process.env.DEFAULT_PASS_OCT_2025;
    const url = options.url || process.env.DEFAULT_URL;

    // Allow explicit override via CLI --headed
    if (options.headless === undefined && process.argv.includes('--headed')) {
        options.headless = false;
    }

    const { browser } = await launch(options);
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();
    await page.goto(url);


    // ----- Login steps -----
    try {
        await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
        await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
        await page.getByRole('button', { name: 'SIGN IN' }).click();

        await page.waitForTimeout(3500);
        await expect(page.getByText('Error Logging In')).not.toBeVisible({ timeout: 2500 });
    } catch {
        await page.getByText('Return To Login Screen').click();
        await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
        await page.getByRole('textbox', { name: 'Enter your Password' }).fill(process.env.DEFAULT_PASS_OCT_2025);
        await page.getByRole('button', { name: 'SIGN IN' }).click();
        await page.waitForTimeout(3500);
        await expect(page.getByText('Error Logging In')).not.toBeVisible();
    }

    // Handle Change Password screen
    try {
        await page.getByText('Change Your Password', { exact: true }).waitFor({ timeout: 5000 });
        await page.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
        await page.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);
        await page.getByText('Reset password').click();
    } catch {
        console.log('Change Your Password did not appear.');
    }

    return { page, context, browser };
}



















export async function logIn2(options = {}) {
    const loginID = options.loginID;
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const url2 = process.env.DEFAULT_URL_2;

    // Allow explicit override via CLI --headed
    if (options.headless === undefined && process.argv.includes('--headed')) {
        options.headless = false;
    }

    const { browser } = await launch(options);
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    const page = await context.newPage();
    await page.goto(url2);


    // ----- Login steps -----
    try {
        await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
        await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
        await page.getByRole('button', { name: 'SIGN IN' }).click();

        await page.waitForTimeout(3500);
        await expect(page.getByText('Error Logging In')).not.toBeVisible({ timeout: 2500 });
    } catch {
        await page.getByText('Return To Login Screen').click();
        await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
        await page.getByRole('textbox', { name: 'Enter your Password' }).fill(process.env.DEFAULT_PASS_OCT_2025);
        await page.getByRole('button', { name: 'SIGN IN' }).click();
        await page.waitForTimeout(3500);
        await expect(page.getByText('Error Logging In')).not.toBeVisible();
    }

    // Handle Change Password screen
    try {
        await page.getByText('Change Your Password', { exact: true }).waitFor({ timeout: 5000 });
        await page.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
        await page.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);
        await page.getByText('Reset password').click();
    } catch {
        console.log('Change Your Password did not appear.');
    }

    return { page, context, browser };
}
















export async function logIn3(options = {}) {
    const loginID = options.loginID ?? process.env.DEFAULT_LOGIN;
    const password = String(
        options.password ?? process.env.DEFAULT_PASS_OCT_2025
    ).trim();
    const url = options.url ?? process.env.DEFAULT_URL;

    // Allow explicit override via CLI --headed
    if (options.headless === undefined && process.argv.includes('--headed')) {
        options.headless = false;
    }

    const { browser } = await launch(options);
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
    });
    const page = await context.newPage();

    await page.goto(url);

    // ---------- Login ----------
    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // Wait and check for login error (NO exception-based flow)
    const loginError = await page
        .getByText('Error Logging In')
        .isVisible()
        .catch(() => false);

    if (loginError) {
        // Retry exactly once with SAME password
        await page.getByText('Return To Login Screen').click();
        await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
        await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
        await page.getByRole('button', { name: 'SIGN IN' }).click();

        await expect(page.getByText('Error Logging In')).not.toBeVisible();
    }

    // ---------- Handle Change Password ----------
    const changePasswordVisible = await page
        .getByText('Change Your Password', { exact: true })
        .isVisible()
        .catch(() => false);

    if (changePasswordVisible) {
        await page.getByRole('textbox', { name: 'Enter your New Password', exact: true })
            .fill(password);
        await page.getByRole('textbox', { name: 'Re-Enter your New Password' })
            .fill(password);
        await page.getByText('Reset password').click();
    }

    return { page, context, browser };
}



















/*
export async function cleanupScreenTemplateCopy(page, options = {}) {
    const { screenTemplateGroup, screenName, defaultTemplate } = options;

    // Navigate to Tools > Screen Templates
    await page.getByText('Tools').hover();
    await page.getByText('Screen Templates').click();
    await waitUntilLoaded(page);

    // Expand group
    await page
        .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
        .locator('span')
        .nth(1)
        .click();

    await waitUntilLoaded(page);

    // Delete any existing copies
    const copyCount = await page.locator(`[id="browse-grid"] table tbody tr:has(td:nth-child(4):has-text("${screenName}"))`).count();
    for (let i = 0; i < copyCount; i++) {
        await page.locator(`[id="browse-grid"] table tbody tr:has(td:nth-child(4):has-text("${screenName}"))`).first().hover();
        await page.locator(`[id="browse-grid"] table tbody tr:has(td:nth-child(4):has-text("${screenName}"))`)
            .first()
            .locator(`[title="Delete"]`)
            .click();
        await page.getByRole('button', { name: 'Yes' }).click();
        //await waitUntilLoaded(page);
    }

    // Verify deletion
    await expect(page.locator(`[role="gridcell"]`, { hasText: screenName })).not.toBeVisible();

    // Close all modals safely
    await closeAllModals(page);
}

 */











export async function cleanupScreenTemplateCopy(page, options = {}) {
    const { screenTemplateGroup, screenName, defaultTemplate } = options;
    const onScreen = options.onScreen;
    const dontClose = options.dontClose;
    const external = options.external;

    if (!onScreen) {
        // Hover over the "Tools" text
        await page.getByText(`Tools`).hover();

        // Hover over the "Screen Templates" text
        await page.getByText(`Screen Templates`).click();

        // Wait page load
        await waitUntilLoaded(page);

        // Click the treeitem to expand the group
        await page
            .getByRole(`treeitem`, { name: `${screenTemplateGroup}`, exact: true })
            .locator(`span`)
            .nth(1)
            .click();

        if (external) {
            // Click `Externat` tab
            await page.getByText(`External`).click();
        }

        // Wait page load
        await waitUntilLoaded(page);
    }

    if (
        !(await page
            .locator(`[role="row"]:has(:text-is("${defaultTemplate}")) input`, {
                exact: true,
            })
            .first()
            .isDisabled({ timeout: 7000 }))
    ) {
        await page
            .locator(`[role="row"]:has(:text-is("${defaultTemplate}")) input`, {
                exact: true,
            })
            .first()
            .click({ timeout: 70000 });
    }
    // Wait page load
    await waitUntilLoaded(page);

    const screenTemplateCopyCount = await page
        .locator(
            `[id="browse-grid"] table tbody tr:has(td:nth-child(4):has-text("${screenName}"))`,
        )
        .count();

    console.log("screenTemplateCopyCount: ", screenTemplateCopyCount);
    for (let i = 0; i < screenTemplateCopyCount; i++) {
        // Hover over the screen template name in the grid to reveal action buttons
        await page
            .locator(
                `[id="browse-grid"] table tbody tr:has(td:nth-child(4):has-text("${screenName}"))`,
            )
            .first()
            .hover();

        // Click the delete button for the specified screen template
        await page
            .locator(
                `[id="browse-grid"] table tbody tr:has(td:nth-child(4):has-text("${screenName}"))`,
            )
            .first()
            .locator(`[title="Delete"]`)
            .click();

        // Confirm the deletion by clicking the "Yes" button in the confirmation dialog
        await page.getByRole(`button`, { name: `Yes` }).click();
    }

    // Verify that the screen template is NOT visible,
    await expect(
        page.getByRole(`gridcell`, { name: screenName }),
    ).not.toBeVisible();

    // Click the "Close" label to fully exit the dialog or screen
    if (!dontClose) await page.getByLabel(`Close`).click();
}















export async function ensureDefaultScreenIsActive(page, defaultTemplate) {
    const defaultRow = page
        .getByRole('row')
        .filter({ hasText: defaultTemplate })
        .first();

    await expect(defaultRow).toBeVisible({ timeout: 10_000 });

    await defaultRow.scrollIntoViewIfNeeded();
    await defaultRow.hover();

    const checkbox = defaultRow.locator('input[type="checkbox"]');

    const isChecked = await checkbox.isChecked().catch(() => false);
    const isEnabled = await checkbox.isEnabled().catch(() => false);

    // Already active → nothing to do
    if (isChecked) return;

    // Cannot activate → system-required limitation
    if (!isEnabled) {
        console.warn(
            `⚠️ Default screen "${defaultTemplate}" cannot be activated (checkbox disabled)`,
        );
        return;
    }

    // Activate default
    await checkbox.click();

    // Handle backend activation popup
    const activationError = page.getByText(
        'An error occurred while activating the screen',
        { exact: false },
    );

    if (await activationError.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await page.getByRole('button', { name: 'Okay' }).click();
    }

    await waitUntilLoaded(page);
}






export async function cleanupScreenTemplateCopy02(page, options = {}) {
    const {
        screenTemplateGroup,
        screenName,
        defaultTemplate,
        onScreen = false,
        dontClose = false,
        external = false,
    } = options;

    //--------------------------------
    // Navigate to Screen Templates
    //--------------------------------
    if (!onScreen) {
        await page.getByText('Tools').hover();
        await page.getByText('Screen Templates').click();
        await waitUntilLoaded(page);

        await page
            .getByRole('treeitem', {
                name: screenTemplateGroup,
                exact: true,
            })
            .locator('span')
            .nth(1)
            .click();

        await waitUntilLoaded(page);

        if (external) {
            await page.getByText('External').click();
            await waitUntilLoaded(page);
        }
    }

    //--------------------------------
    // Find ALL copies by name
    //--------------------------------
    const rows = page
        .getByRole('row')
        .filter({ hasText: screenName });

    const count = await rows.count();
    console.log(`cleanup: found ${count} copy instance(s)`);

    //--------------------------------
    // Delete each copy safely
    //--------------------------------
    for (let i = 0; i < count; i++) {
        const row = rows.first();
        await expect(row).toBeVisible({ timeout: 10_000 });

        await row.scrollIntoViewIfNeeded();
        await row.hover();

        //--------------------------------
        // Attempt DELETE first
        //--------------------------------
        await row.locator('[title="Delete"]').click();
        await page.getByRole('button', { name: 'Yes' }).click();

        //--------------------------------
        // Handle "active screen" delete block
        //--------------------------------
        const deleteBlocked = page.getByText(
            'We are unable to delete this Screen because this is currently the active screen',
            { exact: false },
        );

        if (await deleteBlocked.isVisible({ timeout: 3_000 }).catch(() => false)) {

            // Acknowledge error popup
            await page.getByRole('button', { name: 'Okay' }).click();

            //--------------------------------
            // ✅ ENSURE DEFAULT IS ACTIVE (CRITICAL STEP)
            //--------------------------------
            await ensureDefaultScreenIsActive(page, defaultTemplate);

            //--------------------------------
            // Deactivate COPY if allowed
            //--------------------------------
            await row.hover();

            const activeCheckbox = row.locator('input[type="checkbox"]');

            const isChecked = await activeCheckbox.isChecked().catch(() => false);
            const isEnabled = await activeCheckbox.isEnabled().catch(() => false);

            if (isChecked && isEnabled) {
                await activeCheckbox.click();

                const deactivateError = page.getByText(
                    'An error occurred while activating the screen',
                    { exact: false },
                );

                if (
                    await deactivateError
                        .isVisible({ timeout: 3_000 })
                        .catch(() => false)
                ) {
                    await page.getByRole('button', { name: 'Okay' }).click();
                }

                await waitUntilLoaded(page);
            } else if (isChecked && !isEnabled) {
                console.warn(
                    `⚠️ "${screenName}" cannot be deactivated (system requires it active)`,
                );
                break;
            }

            //--------------------------------
            // Retry DELETE after deactivation
            //--------------------------------
            /*
            await row.hover();
            await row.locator('[title="Delete"]').click();
            await page.getByRole('button', { name: 'Yes' }).click();
            await waitUntilLoaded(page);

             */









            // 1. Try to delete the copy
            await row.hover();
            await row.locator('[title="Delete"]').click();
            await page.getByRole('button', { name: 'Yes' }).click();

// 2. Detect delete error (do NOT assert)
            const deleteError = page.getByText(
                'We are unable to delete this Screen',
                { exact: false },
            );

            if (await deleteError.isVisible({ timeout: 3000 }).catch(() => false)) {

                // 3. Acknowledge delete error
                await page.getByRole('button', { name: 'Okay' }).click();

                // 4. Activate DEFAULT screen
                const defaultRow = page
                    .getByRole('row')
                    .filter({ hasText: defaultTemplate })
                    .first();

                await defaultRow.hover();

                const defaultCheckbox = defaultRow.locator('input[type="checkbox"]');

                if (
                    !(await defaultCheckbox.isChecked()) &&
                    (await defaultCheckbox.isEnabled())
                ) {
                    await defaultCheckbox.click();
                    await waitUntilLoaded(page);
                }

                // 5. Deactivate the COPY
                await row.hover();

                const copyCheckbox = row.locator('input[type="checkbox"]');

                if (
                    await copyCheckbox.isChecked().catch(() => false) &&
                    await copyCheckbox.isEnabled().catch(() => false)
                ) {
                    await copyCheckbox.click();
                    await waitUntilLoaded(page);
                }

                // 6. Retry delete
                await row.hover();
                await row.locator('[title="Delete"]').click();
                await page.getByRole('button', { name: 'Yes' }).click();
                await waitUntilLoaded(page);
            }














        }
    }

    //--------------------------------
    // Verify cleanup complete
    //--------------------------------
    await expect(
        page.getByRole('gridcell', { name: screenName }),
    ).not.toBeVisible();

    //--------------------------------
    // Close dialog
    //--------------------------------
    if (!dontClose) {
        await page.getByLabel('Close').click();
    }
}





















export async function closeAllModals(page) {
    const modalLabels = ['New Screen - Internal', 'New Screen - External', 'Screen Templates'];

    for (const label of modalLabels) {
        const modal = page.getByLabel(label);
        if ((await modal.count()) > 0) {
            const footerButton = modal.locator('button#close');
            if ((await footerButton.count()) > 0) {
                await footerButton.click();
                await modal.waitFor({ state: 'detached' });
            }
        }
    }
}





/*
export async function copyDefaultScreenTemplate(page, options = {}) {
    const { defaultTemplate, screenTemplateGroup, customScreenName } = options;

    // Navigate Tools > Screen Templates
    await page.getByText('Tools').hover();
    await page.getByText('Screen Templates').click();
    await waitUntilLoaded(page);

    // Expand group
    await page
        .getByRole('treeitem', { name: screenTemplateGroup, exact: true })
        .locator('span')
        .nth(1)
        .click();

    await waitUntilLoaded(page);

    // Hover default template & click copy
    await page.getByRole('gridcell', { name: defaultTemplate, exact: true }).hover();
    await waitUntilLoaded(page);
    await page.locator(`[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`).click({ timeout: 500 });
    await waitUntilLoaded(page);
    await page.getByRole('button', { name: 'Yes' }).click();

    // Fill custom screen name if provided
    if (customScreenName) {
        await waitUntilLoaded(page);
        await page.getByRole('textbox', { name: 'Screen Name:' }).fill(customScreenName);
    }

   // await waitUntilLoaded(page);

    await page.getByRole('button', { name: 'Save' }).click();
    await waitUntilLoaded(page);

    // Close all modals safely
    await closeAllModals(page);
}

 */










export async function copyDefaultScreenTemplate(page, options = {}) {
    const { defaultTemplate, screenTemplateGroup } = options;
    const dontClose = false || options.dontClose;
    const onScreen = false || options.onScreen;
    const external = false || options.external;
    const customScreenName = options.customScreenName;

    if (!onScreen) {
        // Hover over the "Tools" menu to reveal its dropdown options
        await page.getByText(`Tools`).hover();

        // Click on the "Screen Templates" option to navigate to the Screen Templates section
        await page.getByText(`Screen Templates`).click();

        // Click the specified screen template group (e.g., "Authorization - BH IP") to expand the group
        await page
            .getByRole(`treeitem`, { name: `${screenTemplateGroup}`, exact: true })
            .locator(`span`)
            .nth(1)
            .click();
    }

    await waitUntilLoaded(page);

    if (external && !onScreen) {
        // Click `Externat` tab
        await page.getByText(`External`).click();
    }

    await waitUntilLoaded(page);

    // Hover over the default screen template in the grid to reveal action buttons
    await page
        .getByRole(`gridcell`, { name: defaultTemplate, exact: true })
        .hover();

    // Click the copy button for the specified default screen template with a timeout of 400ms
    await page
        .locator(
            `[role="row"]:has(:text-is("${defaultTemplate}")) [title="Copy"]`,
        )
        .click({ timeout: 500 });

    // Confirm the copy action by clicking the "Yes" button in the confirmation dialog
    await page.getByRole(`button`, { name: `Yes` }).click();

    await waitUntilLoaded(page);

    // If custom Screen Name:
    if (customScreenName) {
        await waitUntilLoaded(page);
        await page
            .getByRole(`textbox`, { name: `Screen Name:` })
            .fill(customScreenName);

        await waitUntilLoaded(page);
    }

    // Save the new copied screen template by clicking the "Save" button
    await page.getByRole(`button`, { name: `Save` }).click();

    await waitUntilLoaded(page);

    if (!dontClose) {
        // Close the "New Screen - Internal" dialog by clicking the "Close" button within it
        await waitUntilLoaded(page);

        try {
            // Click the "Close" text
            await page.getByText(`Close`, { exact: true }).click();
            await waitUntilLoaded(page);
        } catch {
            console.log("external: ", external);
            if (!external) {
                // Click close modal
                await page
                    .getByLabel(`New Screen - Internal`)
                    .getByText(`Close`, { exact: true })
                    .click();
                await waitUntilLoaded(page);
            } else {
                // Click close modal
                await page
                    .getByLabel(`New Screen - External`)
                    .getByText(`Close`)
                    .click();
                await waitUntilLoaded(page);
            }

            // Click the "Close" text
            await page.locator(`#close`).last().click();
        }
    }
}



















export async function waitUntilLoaded(page) {
    try {
        // Wait for the loading modal to appear (optional step - might not always show up)
        await expect(page.locator(`[id="loading"]`)).toBeVisible({
            timeout: 5000,
        });

        // Wait for the loading modal to disappear (indicates full page load)
        await expect(page.locator(`[id="loading"]`)).not.toBeVisible({
            timeout: 6 * 60 * 1000,
        });
    } catch {
        console.log(`Loading modal is not visible on the page`);
    }
}

export async function closeScreenTemplateModal(page) {
    // Wait page load
    await waitUntilLoaded(page);
    // Click `Close` button
    await page
        .getByLabel(`Edit Screen - Internal`)
        .getByText(`Close`, { exact: true })
        .click();

    try {
        // Assert the "Preview" button is not visible
        await expect(
            page.getByRole(`button`, { name: `Preview` }),
        ).not.toBeVisible();
    } catch {
        // Click `Close` button
        await page
            .getByLabel(`Edit Screen - Internal`)
            .getByText(`Close`, { exact: true })
            .click();
    }
}




export async function viewMemberCardTemplate(page, options = {}) {
    const { memberName, memberName2, templateType } = options;

    // Click the "Cancel" button to close any open dialog or modal
    await page.getByRole(`button`, { name: ` Cancel` }).click();

    // Navigate to the tab for the second member (memberName2)
    await page
        .getByRole(`tab`, { name: `   ${memberName2}    ` })
        .locator(`span`)
        .nth(2)
        .click();

    // Click on the member tab identified by memberName
    await page.locator(`[id="member-tab-name"]:text("${memberName}")`).click();

    // Access the "Authorizations" section for the member
    await page.getByLabel(memberName).getByText(`Authorizations`).first().click();

    // Click the "Authorization Inpatient" button
    await page
        .getByRole(`button`)
        .filter({ hasText: `Authorization Inpatient` })
        .click();

    await waitUntilLoaded(page);

    // Select the "BH Observation" option
    await page.getByText(templateType, { exact: true }).last().click();
}



export async function cleanMemberRoles(page) {
    // Click the "Tools" text
    await page.getByText(`Tools`).click();

    // Click the "Users & Roles" menuitem
    await page
        .getByRole(`menuitem`, { name: `Users & Roles` })
        .locator(`span`)
        .first()
        .click();

    // Click the "Member Roles" text
    await page.getByText(`Member Roles`).click();

    //await waitUntilLoaded(page);

    // Select all rows
    const rows = await page.locator('[role="row"]').all();

    for (let i = 3; i < rows.length; i++) {
        // Bring the row into view
        await rows[i].scrollIntoViewIfNeeded();

        // Click the row to select it
        await rows[i].click();

        // Click the delete button in the actions column of the selected row
        await rows[i].locator(".delete-button").click();


        // Click the "Yes" button to confirm deletion
        await page.getByRole("button", { name: "Yes" }).click();



        // Optionally, wait for the row to be removed
        await expect(rows[i]).not.toBeVisible();
    }

    // Click the "Close" text
    await page.getByText(`Close`, { exact: true }).click();
}






/*
export async function cleanupTeam(page, options = {}) {
    const { teamName, external } = options;

    // Click the "Tools" text
    await page.getByText(`Tools`).click();

    // Click the "Users & Roles" text
    await page.getByText(`Users & Roles`).click();

    // Click the "Teams" treeitem
    await page
        .getByRole(`treeitem`, { name: `Teams` })
        .locator(`span`)
        .first()
        .click();

    await waitUntilLoaded(page);



    try {
        if (external) {
            // Click the "External" text
            await page.getByText(`External`).click();

            await waitUntilLoaded(page);

            // Fill the "External" tabpanel with
            await page
                .getByRole(`tabpanel`, { name: `External` })
                .getByPlaceholder(`Search...`)
                .fill(teamName);


            // Click the "QAW team" gridcell
            await page.getByRole(`gridcell`, { name: teamName }).click();
        } else {

            await waitUntilLoaded(page);
            // Fill the "Search..." input in the "Internal" tabpanel with the team name
            await page
                .getByRole("tabpanel", { name: "Internal" })
                .getByPlaceholder("Search...")
                .fill(teamName);

            await waitUntilLoaded(page);

            // Click the search button to filter the grid
            await page.locator("#admin-search-button").click();

            // Click the grid cell that matches the team name to select the team
            await page
                .getByRole("gridcell", { name: teamName })
                .click({ timeout: 5000 });
        }

        // Click the "Delete" button to initiate deletion
        await page.getByRole("button", { name: "" }).click();

        // Click the "Yes" button to confirm deletion in the dialog
        await page.getByRole("button", { name: "Yes" }).click();
    } catch {
        console.log("Team name is not visible");
    }

    await waitUntilLoaded(page);
    // Click the "Close" text
    await page.getByText(`Close`, { exact: true }).click();
}

 */











export async function cleanupTeam(page, options = {}) {
    const { teamName, external } = options;

    // Fast exit if page is closed (defensive)
    if (!page || page.isClosed?.()) return false;

    // Helper: safe wait
    const safeWait = async (ms = 50) => {
        try { await page.waitForTimeout(ms); } catch { /* ignore */ }
    };

    // Helper: click Close if present and page is open
    const safeClickClose = async () => {
        if (!page || page.isClosed?.()) return;
        try {
            // Close may be a button with icon text or a plain label
            const closeBtn = page.getByText(`Close`, { exact: true });
            if (await closeBtn.isVisible({ timeout: 500 })) {
                await closeBtn.click();
                await waitUntilLoaded(page).catch(() => {});
            }
        } catch {
            // Ignore if not present or page closed
        }
    };

    let deleted = false;

    try {
        // Navigate to Teams
        await page.getByText(`Tools`).click();
        await page.getByText(`Users & Roles`).click();

        await page
            .getByRole(`treeitem`, { name: `Teams` })
            .locator(`span`)
            .first()
            .click();

        await waitUntilLoaded(page);

        if (external) {
            // External tab
            await page.getByText(`External`).click();
            await waitUntilLoaded(page);

            // Search
            await page
                .getByRole(`tabpanel`, { name: `External` })
                .getByPlaceholder(`Search...`)
                .fill(teamName);

            // ⬇️ This was missing in your code: click the External search button
            await page.locator(`#admin-search-button`).last().click();
            await waitUntilLoaded(page);

            // See if the team row is present
            const teamCell = page.getByRole(`gridcell`, { name: teamName, exact: true });
            const visible = await teamCell.isVisible({ timeout: 2000 }).catch(() => false);

            if (!visible) {
                console.log(`cleanupTeam: team "${teamName}" not found (External). Skipping delete.`);
                return false;
            }

            // Select the row
            await teamCell.click();
        } else {
            // Internal tab (default)
            await waitUntilLoaded(page);

            await page
                .getByRole(`tabpanel`, { name: `Internal` })
                .getByPlaceholder(`Search...`)
                .fill(teamName);

            await page.locator(`#admin-search-button`).click();
            await waitUntilLoaded(page);

            const teamCell = page.getByRole(`gridcell`, { name: teamName, exact: true });
            const visible = await teamCell.isVisible({ timeout: 2000 }).catch(() => false);

            if (!visible) {
                console.log(`cleanupTeam: team "${teamName}" not found (Internal). Skipping delete.`);
                return false;
            }

            await teamCell.click({ timeout: 5000 });
        }

        // Delete
        const deleteBtn = page.getByRole(`button`, { name: `` });
        const deleteVisible = await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false);

        if (!deleteVisible) {
            console.log(`cleanupTeam: Delete button not visible for team "${teamName}". Skipping.`);
            return false;
        }

        await deleteBtn.click();
        await page.getByRole(`button`, { name: `Yes` }).click();
        await waitUntilLoaded(page);

        deleted = true;
    } catch (e) {
        console.log(`cleanupTeam: Team "${teamName}" not visible or page changed.`, e?.message || e);
    } finally {
        // Only attempt to click Close if we are still on a screen that shows it.
        // If there's no modal/dialog open, Close might not exist — that's fine.
        await safeWait(50);
        await safeClickClose();
        await safeWait(50);
    }

    return deleted;
}










export async function cleanUpUser(page, options = {}) {
    const { firstName } = options;

    // Navigate to the Tools section by clicking the "Tools" text
    await page.getByText(`Tools`).click();

    // Access the Users & Roles section by clicking the "Users & Roles" text
    await page.getByText(`Users & Roles`).click();

    try {
        // Locate the search input within the "Internal" tab panel and click it
        await page
            .getByRole(`tabpanel`, { name: `Internal` })
            .getByPlaceholder(`Search...`)
            .click();

        // Enter the user's first name into the search input
        await page.keyboard.type(firstName);

        // Submit the search by pressing Enter
        await page.keyboard.press(`Enter`);

        // Click the grid cell containing the user's first name (e.g., "demo")
        await page
            .getByRole(`gridcell`, { name: firstName, exact: true })
            .click({ timeout: 5000 });

        // Initiate deletion by clicking the "Delete" button (identified by its icon)
        await page.getByRole(`button`, { name: `` }).click();

        // Confirm the deletion by clicking the "Yes" button
        await page.getByRole(`button`, { name: `Yes` }).click();
        await waitUntilLoaded(page);

    } catch {
        // Log a message if the user is not found or the process fails
        console.log("User is not visible");
    }

    // Close the panel by clicking the "Close" text
    await page.getByText(`Close`, { exact: true }).click();
}



export async function cleanUpUsers(page, options = {}) {
    const { userFirstNames } = options;

    for (let firstName of userFirstNames) {
        await cleanUpUser(page, { firstName });
    }
}




export async function cleanupImportedUsers(page, options = {}) {
    const { firstNames } = options;

    // Navigate to the Tools section by clicking the "Tools" text
    await page.getByText(`Tools`).click();

    // Access the Users & Roles section by clicking the "Users & Roles" text
    await page.getByText(`Users & Roles`).click();

    // Iterate over each expected user name and verify that thay have been imported successfully
    for (let name of firstNames) {
        // Fill in user name
        await page
            .getByRole(`tabpanel`, { name: `Internal` })
            .getByPlaceholder(`Search...`)
            .fill(name);

        // Hit enter to initiate search
        await page.keyboard.press(`Enter`);

        try {
            // Verify that user name is visible in search results
            await page
                .getByRole(`gridcell`, { name: name })
                .first()
                .click({ timeout: 5000 });

            // Click Delete button
            await page.getByRole(`button`, { name: `` }).click();

            await page.getByRole(`button`, { name: `Yes` }).click();
        } catch {
            console.log("User is not visible");
        }
    }

    // Close modal
    await page.getByText(`Close`, { exact: true }).click();
}














export async function cleanupImportedUsers2(page, options = {}) {
    const { firstNames = [] } = options;

    // Navigate to the Tools section by clicking the "Tools" text
    await page.getByText(`Tools`).click();

    // Access the Users & Roles section (handle &amp; vs & via regex)
    await page.getByText(/Users\s*&\s*Roles/).click();

    // Iterate over each expected user name and attempt deletion
    for (const name of firstNames) {
        // Fill in user name
        const internalTab = page.getByRole(`tabpanel`, { name: `Internal` });
        const searchBox = internalTab.getByPlaceholder(`Search...`);
        await searchBox.fill(name);

        // Hit enter to initiate search
        await page.keyboard.press(`Enter`);

        try {
            // Click on the user gridcell if found (short timeout to avoid slowing down when absent)
            await page.getByRole(`gridcell`, { name }).first().click({ timeout: 5000 });

            // Click Delete button (trash icon)
            await page.getByRole(`button`, { name: `` }).click();

            // Confirm delete
            await page.getByRole(`button`, { name: `Yes` }).click();

            // --- Handle "unable to delete" notification if it appears ---
            const notif = page.locator('#notif-message');
            try {
                await expect(notif).toContainText(
                    'We are unable to delete this User account because there are other records associated to it.',
                    { timeout: 2000 } // quick check; doesn't slow down when not shown
                );

                // Acknowledge the message
                const okBtn = page.getByRole('button', { name: 'Okay' });
                if (await okBtn.isVisible().catch(() => false)) {
                    await okBtn.click();

                }
            } catch {
                // Notification did not appear; continue normally
            }
        } catch {
            console.log(`User "${name}" not visible or already absent (skipping).`);
        }
    }

    // Close modal if it's still open
    const closeButton = page.getByText(`Close`, { exact: true });
    if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
    }
}












/*
export async function createUsers(page, options = {}) {
    const { faker } = npmImports;
    const { userFirstNames } = options;

    const lastName = `QAWolf`;
    const emailAddress = faker.internet.email();
    const upper = faker.random.alpha({ count: 1, upcase: true });
    const lower = faker.random.alpha({ count: 1, upcase: false });
    const number = faker.datatype.number({ min: 0, max: 9 }).toString();
    const securityRole = `administrator`;
    const memberRole = `All member Access`;
    const symbol = faker.random.arrayElement([
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
    ]);
    const rest = faker.internet.password(8, false, /[A-Za-z0-9]/);
    const password = faker.helpers
        .shuffle([upper, lower, number, symbol, ...rest])
        .join("");

    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Users & Roles` button
    await page.getByText(`Users & Roles`).click();

    for (let name of userFirstNames) {
        // Click the "+ New" button
        await page.getByRole(`button`, { name: `  New` }).click();

        await waitUntilLoaded(page);

        // Fill the "First Name" field
        await page.locator("#user_first_name").fill(name);

        // Fill the "Last Name" field
        await page.locator("#user_last_name").fill(`QAWolf`);

        // Fill the "Login ID" field with first and last name concatenated (no space)
        await page.locator("#user_login_name").fill(name + lastName);

        // Fill the "Email Address" field
        await page.locator("#user_email_address").fill(emailAddress);

        await page.locator(`#user_title`).fill(`QAE`);

        // Click `Access Justifiation` input field
        await page
            .locator("#record-div div")
            .filter({ hasText: "Access Justification" })
            .getByLabel("expand combobox")
            .first()
            .click();

        // Click the "​ Care Team Member" option
        await page
            .getByRole(`option`, { name: `​ Care Team Member` })
            .locator(`span`)
            .click();

        // Fill the "Password" field
        await page.locator("#user_password").fill(password);

        await page.waitForTimeout(2000);

        // Click in `Confirm Password` input
        await page.locator(`#user_password_confirm`).click();

        // Fill the "Confirm Password" with
        await page.locator(`#user_password_confirm`).fill(password);

        // Wait until loaded
        await waitUntilLoaded(page);

        // Fill the "Security Role" with
        await page
            .locator(`input[name="user_security_role_id_input"]`)
            .fill(securityRole);

        // Click the secority role option from dropdown menu
        await page
            .getByRole(`option`, { name: `​ ${securityRole}` })
            .locator(`span`)
            .click();

        // Fill the member role with
        await page
            .locator(`input[name="user_member_role_id_input"]`)
            .fill(memberRole);

        // Click the "​ All Member Access" option
        await page
            .getByRole(`option`, { name: `​ ${memberRole}` })
            .locator(`span`)
            .click();

        await waitUntilLoaded(page);

        // Click the " Save and Close" button
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    }
}

 */














// ... keep your other imports/exports above ...

export async function createUsers(page, options = {}) {
    // -------------------------------------------
    // Resolve faker in a safe, version-agnostic way
    // -------------------------------------------
    let fakerRef;
    try {
        if (globalThis.npmImports?.faker) {
            fakerRef = globalThis.npmImports.faker;
        } else {
            // Fallback: dynamically import @faker-js/faker
            const mod = await import('@faker-js/faker');
            fakerRef = mod?.faker ?? mod?.default?.faker ?? mod?.default ?? mod;
            // Cache it for future calls (optional)
            globalThis.npmImports = { ...(globalThis.npmImports || {}), faker: fakerRef };
        }
    } catch {
        throw new Error(
            'Unable to resolve @faker-js/faker. Make sure it is installed: `npm i -D @faker-js/faker`'
        );
    }
    const faker = fakerRef;

    // -------------------------------------------
    // Small adapter so old/new faker versions work
    // -------------------------------------------
    const alphaUpper = () =>
        (faker.string?.alpha
            ? faker.string.alpha({ length: 1, casing: 'upper' })
            : faker.random.alpha({ count: 1, upcase: true }));

    const alphaLower = () =>
        (faker.string?.alpha
            ? faker.string.alpha({ length: 1, casing: 'lower' })
            : faker.random.alpha({ count: 1, upcase: false }));

    const oneDigit = () =>
        (faker.number?.int
            ? String(faker.number.int({ min: 0, max: 9 }))
            : String(faker.datatype.number({ min: 0, max: 9 })));

    const pickOne = (arr) =>
        (faker.helpers?.arrayElement
            ? faker.helpers.arrayElement(arr)
            : faker.random.arrayElement(arr));

    const passwordAlnum = (len) => {
        // New API: options object; Old API: (length, memorable, pattern)
        if (faker.internet.password.length === 1) {
            return faker.internet.password({ length: len, memorable: false, pattern: /[A-Za-z0-9]/ });
        }
        return faker.internet.password(len, false, /[A-Za-z0-9]/);
    };

    // -------------------------------------------
    // Inputs from options
    // -------------------------------------------
    const { userFirstNames = [] } = options;
    if (!Array.isArray(userFirstNames) || userFirstNames.length === 0) {
        throw new Error('createUsers requires options.userFirstNames: string[] with at least one name.');
    }

    // -------------------------------------------
    // Data
    // -------------------------------------------
    const lastName = `QAWolf`;
    const emailAddress = faker.internet.email();
    const upper = alphaUpper();
    const lower = alphaLower();
    const number = oneDigit();
    const securityRole = `Administrator`;
    const memberRole = `All Member Access`;
    const symbol = pickOne(['!', '@', '#', '$', '%', '^', '&', '*']);
    const rest = passwordAlnum(8);
    const password = faker.helpers.shuffle([upper, lower, number, symbol, ...rest]).join('');

    // -------------------------------------------
    // UI Actions
    // -------------------------------------------
    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Users & Roles` button (your app renders &amp; as &)
    await page.getByText(`Users & Roles`).click();

    for (const name of userFirstNames) {
        // Click the "+ New" button (NBSP in label)
        await page.getByRole(`button`, { name: ` \u00A0New` }).click();

        await waitUntilLoaded(page);

        // Fill required fields
        await page.locator('#user_first_name').fill(name);
        await page.locator('#user_last_name').fill(`QAWolf`);
        await page.locator('#user_login_name').fill(name + lastName);
        await page.locator('#user_email_address').fill(emailAddress);
        await page.locator('#user_title').fill(`QAE`);

        // Access Justification combobox
        await page
            .locator('#record-div div')
            .filter({ hasText: 'Access Justification' })
            .getByLabel('expand combobox')
            .first()
            .click();

        await waitUntilLoaded(page);

        // Option may include a zero-width space; match with regex
        await page.getByRole(`option`, { name: /\u200B?\s*Care Team Member/ }).locator(`span`).click();

        // Password + confirm
        await page.locator('#user_password').fill(password);
        await waitUntilLoaded(page);
        //await page.waitForTimeout(2000);
        await page.locator('#user_password_confirm').click();
        await waitUntilLoaded(page);
        await page.locator('#user_password_confirm').fill(password);

        await waitUntilLoaded(page);

        // Security Role
        await page.locator(`input[name="user_security_role_id_input"]`).fill(securityRole);
        await waitUntilLoaded(page);
        /*
        await page
            .getByRole(`option`, { name: new RegExp(`\\u200B?\\s*${securityRole}`) })
            .locator(`span`)
            .click();

         */

        await page.getByRole('option', { name: securityRole }).click();

        // await page.getByRole('option', { name: 'Administrator' }).click();

        // Member Role
        await page.locator(`input[name="user_member_role_id_input"]`).fill(memberRole);
        await waitUntilLoaded(page);
        await page
            .getByRole(`option`, { name: new RegExp(`\\u200B?\\s*${memberRole}`) })
            .locator(`span`)
            .click();

        await waitUntilLoaded(page);

        // Save and Close
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    }
}


















/**
 * Extracts a flat array of security role nodes from a tree structure in the DOM.
 *
 * This function evaluates the page's DOM to traverse a tree view of security roles,
 * collecting each node's title, path, depth, checkboxId, and a locator for its checkbox.
 * The result is a flat array of all nodes, including their hierarchical relationships.
 *
 * @param {import('playwright').Page} page - The Playwright page object used to interact with the web application.
 * @returns {Promise<Array<Object>>} - Resolves to a flat array of security role node objects, each containing properties like title, path, depth, checkboxId, checkboxLocator, and descendants.
 *
 * @example
 * const flatTreeData = await grabSecurityRoles(page);
 */
export async function grabSecurityRoles(page) {
    const flatTreeData = await page.evaluate(() => {
        const flat = [];

        function walk(ul, path = [], depth = 0) {
            const nodes = [];
            const items = ul.querySelectorAll(":scope > li");

            items.forEach((li) => {
                const titleSpan = li.querySelector(
                    "span[data-security-role-privilege-id]",
                );
                const checkboxInput = li.querySelector('input[type="checkbox"]');

                if (!titleSpan || !checkboxInput) return;

                const title = titleSpan.textContent.trim();
                const checkboxId = checkboxInput.id || null;
                const currentPath = [...path, title];

                const checkboxLocator = `[data-security-role-privilege-id]:text("${title}") >> .. >> .. >> .. >> .. >> input[type="checkbox"]`;

                const node = {
                    title,
                    path: currentPath,
                    depth,
                    checkboxId,
                    checkboxLocator,
                    descendants: [],
                };

                const childUl = li.querySelector(":scope > ul.k-treeview-group");
                if (childUl) {
                    // Recursively walk children
                    const childNodes = walk(childUl, currentPath, depth + 1);

                    // Add all recursive children to this node's descendants
                    node.descendants = childNodes;
                }

                flat.push(node); // Add only this node to the flat list
                nodes.push(node); // Return to parent for its descendants
            });

            return nodes;
        }

        const rootUl = document.querySelector("#tree-view > ul.k-treeview-group");
        walk(rootUl); // builds both flat and nested tree
        return flat;
    });
    return flatTreeData;
}



export async function updateCheckBoxIdFromFlatTreeData(flatTreeData, rolesArr) {
    for (let role of rolesArr) {
        // Filter the flatTreeData to grab the corresponding Checbox data
        const treeRole = flatTreeData.filter((ele) => {
            // First check, is to see that it's at the same depth in the tree
            if (ele.path.length !== role.path.length) return false;

            // Second check, is to see that the title is the same
            if (ele.title !== role.title) return false;

            let isTrue = true;
            for (let i = 0; i < ele.path.length; i++) {
                // Check if the path at each branch is the same, if not break out of the loop as this is not the  checkbox we're looking for
                if (ele.path[i] !== role.path[i]) {
                    isTrue = false;
                    break;
                }
            }
            // If we reached this point then this is the checkbox we are looking for return true for the filter function
            return isTrue;
        });
        role.checkboxId = treeRole[0].checkboxId;
    }
}



export async function cleanupLetter(page, options = {}) {
    const { letterName } = options;
    // Click the "Tools" text
    await page.getByText(`Tools`).click();

    // Click the "Reports & Letters" text
    await page.getByText(`Reports & Letters`).click();

    // Click the "Letters" treeitem
    await page
        .getByRole(`treeitem`, { name: `Letters` })
        .locator(`span`)
        .first()
        .click();

    // Click the "Manage Reports & Letters" dialog and fill the search input
    await page
        .getByRole(`dialog`, { name: `Manage Reports & Letters` })
        .getByPlaceholder(`Search...`)
        .fill(letterName);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();

    try {
        // Click the letter gridcell by name
        await page.getByRole(`gridcell`, { name: letterName }).click();

        // Click the "" (delete) button
        await page.getByRole(`button`, { name: `` }).click();

        // Click the "Yes" button to confirm deletion
        await page.getByRole(`button`, { name: `Yes` }).click();
    } catch {
        // Log if the letter is not visible
        console.log("Letter is not visible");
    }

    // Click the "Close" text to close the dialog
    await page.getByText(`Close`, { exact: true }).click();
}



export async function viewCsv(filePath, mimeType = "application/octet-stream") {
    // launch with arg allowing window.showOpenFilePicker API in HTTP, then inject init script
    const { context } = await launch({
        browser: "chrome",
        args: [
            "--unsafely-treat-insecure-origin-as-secure=http://csv.psc.qaw.internal",
        ],
    });

    const page = await context.newPage();
    await mockShowOpenFilePicker(page, filePath, mimeType);

    // navigate to page after init script & load file
    await page.goto("http://csv.psc.qaw.internal");
    await page.keyboard.press("Control+o");

    return { context, page };
}



export async function mockShowOpenFilePicker(
    page,
    filePath,
    mimeType = "application/octet-stream",
) {
    // import dependencies
    const path = await import("node:path");
    const fs = await import("node:fs/promises");

    // resolve path and buffer
    const resolvedPath = path.resolve(filePath);
    const buffer = await fs.readFile(resolvedPath);
    const content = buffer.toString("utf-8");
    const fileName = path.basename(resolvedPath);

    await page.addInitScript(
        ({ name, type, content }) => {
            window.showOpenFilePicker = () => [
                {
                    getFile: async () =>
                        await Promise.resolve(new File([content], name, { type })),
                },
            ];
        },
        {
            name: fileName,
            type: mimeType,
            content,
        },
    );
}



export async function cleanUpStratificationRule(page, options = {}) {
    const { ruleName, schedules } = options;

    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Stratification` button
    await page.getByText(`Stratification`, { exact: true }).click();

    if (schedules) {
        // Click `Schedules` tab
        await page.getByText(`Schedules`).click();

        // Fill in search input field
        await page
            .getByRole(`dialog`, { name: `Manage Stratification Rules` })
            .getByPlaceholder(`Search...`)
            .fill(ruleName);

        // Click `Search` button
        await page.locator(`#admin-search-button`).click();
    } else {
        // Fill in search input field
        await page
            .getByRole(`dialog`, { name: `Manage Stratification Rules` })
            .getByPlaceholder(`Search...`)
            .fill(ruleName);

        // Click `Search` button
        await page.locator(`#admin-search-button`).click();
    }

    try {
        // Click Rule Name row
        await page.getByRole(`gridcell`, { name: ruleName }).click();

        // Click `Delete` button
        await page.getByRole(`button`, { name: `` }).click();

        // Click `Yes` button
        await page.getByRole(`button`, { name: `Yes` }).click();
    } catch {
        console.log(`Rules is not visible`);
    }

    await page.getByText(`Close`, { exact: true }).click();
}

















export async function cleanUpStratificationRuleWithCheckIfExistsCondition(page, options = {}) {
    const { ruleName, schedules } = options;

    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Stratification` button
    await page.getByText(`Stratification`, { exact: true }).click();


    await waitUntilLoaded(page);

    // Optional: switch to Schedules tab
    if (schedules) {
        await page.getByText(`Schedules`).click();
    }



    //await waitUntilLoaded(page);

    // Fill in search input field
    const manageDlg = page.getByRole(`dialog`, { name: `Manage Stratification Rules` });
    await manageDlg.getByPlaceholder(`Search...`).fill(ruleName);

    // Click `Search` button
    await page.locator(`#admin-search-button`).click();

    await waitUntilLoaded(page);

    // Check whether the rule exists
    const ruleCell = page.getByRole(`gridcell`, { name: ruleName });



    const count = await ruleCell.count();
    if (count === 0) {
        console.log(`No stratification rule named "${ruleName}" found. Nothing to delete.`);
        // Close the dialog and exit gracefully
        await page.getByText(`Close`, { exact: true }).click();
        return;
    }

    try {
        // Click Rule Name row
        await ruleCell.first().click({ trial: false });

        // Click `Delete` button
        await page.getByRole(`button`, { name: `` }).click();

        // Click `Yes` button
        await page.getByRole(`button`, { name: `Yes` }).click();

        // Optional: wait a bit for the row to be removed
        await waitUntilLoaded(page);
    } catch (err) {
        console.log(`Rule "${ruleName}" could not be deleted (possibly already removed):`, err?.message);
    } finally {
        // Close the dialog
        await page.getByText(`Close`, { exact: true }).click();
    }
}



















export async function cleanUpMyView(page, options = {}) {
    const viewName = options.viewName;

    // Hover over the `Select view` button
    await page.locator(`#view-menu [role="button"] >> nth=0`).hover();

    // Click `My Views` button
    await page.locator(`:text("My Views")`).first().click();

    // Click `Manage Views` button
    await page.locator(`:text("Manage Views")`).click();

    const manageDialog = page.getByRole('dialog', { name: 'Manage Views' });

    // Try to click "My Views" tab inside the dialog by text instead of role
    const myViewsTab = manageDialog.getByText('My Views', { exact: true });
    await expect(myViewsTab).toBeVisible({ timeout: 5000 });
    await myViewsTab.click();

    // Enter the view name in the search input
    const searchInput = manageDialog.getByPlaceholder('Search...');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill(viewName);

    // Click the Search button
    await page.locator('#admin-search-button').click();

    // Loop to delete all matching views
    let matchingViews = manageDialog.getByRole('gridcell').filter({ hasText: viewName });
    while ((await matchingViews.count()) > 0) {
        const viewCell = matchingViews.first();

        // Click the view to select it
        await viewCell.click();

        // Find the Delete button in the same row
        const row = viewCell.locator('xpath=ancestor::tr');
        const deleteButton = row.locator('button[title="Delete"]');

        await expect(deleteButton).toBeVisible({ timeout: 5000 });
        await deleteButton.click();

        // Confirm deletion
        const yesButton = page.getByRole('button', { name: 'Yes' });
        await expect(yesButton).toBeVisible({ timeout: 5000 });
        await yesButton.click();

        // Wait for UI to refresh
        await page.waitForTimeout(1000);

        // Re-query remaining matching views
        matchingViews = manageDialog.getByRole('gridcell').filter({ hasText: viewName });
    }

    // Close modal
    await manageDialog.getByText('Close', { exact: true }).click();
}










export async function grabAllProviders(page) {
    const providers = [];
    let attempts = 0;
    while (attempts < 5) {
        attempts++;
        let rows = await page.locator(`[id="browse-grid"] table tbody tr`).all();
        for (let i = 0; i < rows.length; i++) {
            let provider = {};
            provider.providerName = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=3`)
                .innerText();
            provider.firstName = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=4`)
                .innerText();
            provider.lastName = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=5`)
                .innerText();
            provider.npiNum = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=6`)
                .innerText();
            provider.siteName = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=7`)
                .innerText();
            provider.siteTaxId = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=8`)
                .innerText();
            provider.address1 = await page
                .locator(`[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=9`)
                .innerText();
            provider.address2 = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=10`,
                )
                .innerText();
            provider.city = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=11`,
                )
                .innerText();
            provider.state = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=12`,
                )
                .innerText();
            provider.zipCode = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=13`,
                )
                .innerText();
            provider.providerType = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=14`,
                )
                .innerText();
            provider.providerId = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=15`,
                )
                .innerText();
            provider.groups = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=16`,
                )
                .innerText();
            provider.specialties = await page
                .locator(
                    `[id="browse-grid"] table tbody tr >> nth=${i} >> td >> nth=17`,
                )
                .innerText();
            providers.push(provider);
        }
        // If the next page arrow is not disabled click the next page arrow
        if (
            (await page
                .locator(`#admin-browse-content [aria-label="Go to the next page"]`)
                .getAttribute("aria-disabled")) === "false"
        ) {
            await page
                .locator(`#admin-browse-content [aria-label="Go to the next page"]`)
                .click();
        } else {
            break;
        }
        await waitUntilLoaded(page);
    }
    return { providers };
}




export async function addMember(page, options = {}) {
    const { faker, dateFns } = npmImports;
    const firstName = options.firstName || `QAW${faker.name.firstName()}`;
    const lastName = options.lastName || faker.name.lastName();
    const coverageType = options.coverageType || `Permanent`; // [`Permanent`, `Temporary`]
    const memberId = options.memberId || `QAW${Date.now()}`; // Use format `QAW `
    const subscriberIs = options.subscriberIs || `Self`; // [`Self`, `Other`]
    const today = Date.now();
    const effectiveDate =
        options.effectiveDate || dateFns.format(today, "MM dd yyyy");
    const address1 = options.address1 || faker.address.streetAddress();
    const city = options.city || faker.address.city();
    const zip = options.zip || faker.address.zipCode();
    const state = options.state || faker.address.state();
    const otherAddress1 = options.otherAddress1 || faker.address.streetAddress();
    const otherCity = options.otherCity || faker.address.city();
    const otherZip = options.otherZip || faker.address.zipCode();
    const otherState = options.otherState || faker.address.state();
    const birthdate =
        options.birthdate ||
        dateFns.format(dateFns.subYears(today, 20), "MM dd yyyy");
    const dontCloseWorkLog = options.dontCloseWorklog || false;
    let workActDate = `Don't select worklog option was selected`;
    const benefitPlan = options.benefitPlan || "";

    //await waitUntilLoaded(page);

    // Click the "+ Add Member" button
    await page.getByRole(`button`, { name: ` Add Member` }).click();

    await waitUntilLoaded(page);

    // Fill in First and Last Name
    await page.locator(`#pers_first_name`).fill(firstName);

    //await waitUntilLoaded(page);

    await page.locator(`#pers_last_name`).fill(lastName);

    //await waitUntilLoaded(page);

    // Select Coverage Type
    await page.getByRole(`radio`, { name: coverageType, exact: true }).click();

    //await waitUntilLoaded(page);

    // Fill in Member Identifier
    await page.locator(`#pati_member_identifier`).fill(memberId);

    //await waitUntilLoaded(page);

    // TODO: Status is prefilled with Primary (seems to be only Coverage Status)

    // TODO:  If need Other, need to update code after this line
    // Select Subscriber is: Self or Other
    await page.getByRole(`radio`, { name: subscriberIs }).click();

    await waitUntilLoaded(page);

    // Fill in effective date
    if (effectiveDate) {
        await page.locator(`#elco_effective_date`).click();

        await waitUntilLoaded(page);

        await page.locator(`#elco_effective_date`).clear();

        await waitUntilLoaded(page);

        await page.locator(`#elco_effective_date`).pressSequentially(effectiveDate);

        await waitUntilLoaded(page);
    }

    if (benefitPlan) {
        // Click `...` button
        await page
            .locator(
                `[role="dialog"] [class="left outerfielddiv"]:has-text("Benefit Plan:") button:visible`,
            )
            .click();

        await waitUntilLoaded(page);

        // Click to select benefit plan
        await page.getByRole(`gridcell`, { name: benefitPlan }).click();

        //await waitUntilLoaded(page);

        // Click `Select` button
        await page.getByRole(`button`, { name: `Select`, exact: true }).click();

       // await waitUntilLoaded(page);
    }

    // Fill in Address1, city, zip code
    await page.locator(`#pad1_address_1`).fill(address1);

   // await waitUntilLoaded(page);

    await page.locator(`#pad1_city`).fill(city);

   // await waitUntilLoaded(page);

    await page.locator(`input[name="pad1_zip"]`).fill(zip);

   // await waitUntilLoaded(page);

    // Fill in State
    await page.locator(`input[name="pad1_state_id_input"]`).fill(state);

   // await waitUntilLoaded(page);

    await page.getByRole(`option`, { name: state }).locator(`span`).click();

   // await waitUntilLoaded(page);

    // Fill in Other Address
    // Fill in Address1
    await page.locator(`#pad2_address_1`).fill(otherAddress1);

   // await waitUntilLoaded(page);

    await page.locator(`#pad2_city`).fill(otherCity);

   // await waitUntilLoaded(page);

    await page.locator(`input[name="pad2_zip"]`).fill(otherZip);

   // await waitUntilLoaded(page);

    // Fill in State
    await page.locator(`input[name="pad2_state_id_input"]`).fill(otherState);

   // await waitUntilLoaded(page);

    await page.getByRole(`option`, { name: otherState }).locator(`span`).click();

    //await waitUntilLoaded(page);

    // Fill in birthdate
    await page.locator(`#pers_birthdate`).click();

    await waitUntilLoaded(page);

    await page.locator(`#pers_birthdate`).clear();

    await waitUntilLoaded(page);

    await page.locator(`#pers_birthdate`).pressSequentially(birthdate);

    await waitUntilLoaded(page);

    // Click the "Save and Close" button
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
    await waitUntilLoaded(page);

    if (!dontCloseWorkLog) {
        console.log(dontCloseWorkLog);
        await expect(page.getByText(`New Work Log`)).toBeVisible();
        workActDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value);


        await waitUntilLoaded(page);

        await page.getByRole(`button`, { name: ` Save and Close` }).click();
        await waitUntilLoaded(page);
    }

    return {
        firstName,
        lastName,
        memberId,
        effectiveDate,
        address1,
        city,
        state,
        zip,
        birthdate,
        workActDate,
        otherAddress1,
        otherCity,
        otherZip,
        otherState,
    };
}











export async function createAuthorizationForMember(page, options = {}) {
    // Constants
    //const { dateFns } = npmImports;
    const today = Date.now();
    const lastFirstName = options.lastFirstName || `Ace, Clancy`;
    const authorizationType = options.authorizationType || `Inpatient`;
    const patientStatus = options.patientStatus || `Admitted`;
    /*const admitDate =
        options.admitDate || dateFns.format(today, "MM dd yyyy hh mm ss aa");*/

    const admitDate =
        options.admitDate || format(today, "MM dd yyyy hh mm ss aa");

    const authStatus = options.authStatus || `In Progress`;
    const team = options.team || `Case Team`;
    const reviewer = options.reviewer;
    let worklogActivityDate = `No worklog appeared please check system configurations > Worklogs`;

    // Navigate to Home
    await page.getByText(`Home`, { exact: true }).click();

    // Navigate to the Members tab
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

    // Search for a member
    await page.getByRole(`textbox`, { name: `Search...` }).fill(lastFirstName);
    await page.keyboard.press("Enter");

    // Select the member to open member page
    await page.getByRole(`gridcell`, { name: lastFirstName }).dblclick();
    await waitUntilLoaded(page);

    // Click the "Authorizations" tab
    await page.locator(`#authorizations-menu`).click();

    // Hover over "+ Authorization" button and select option >> Inpatient
    await page
        .getByRole(`button`)
        .filter({ hasText: `Authorization Inpatient` })
        .hover();
    await page
        .getByLabel(lastFirstName)
        .getByText(authorizationType, { exact: true })
        .click();



    if (authorizationType === "Inpatient" || authorizationType === "Observation") {
        // Fill in the inpatient status and select the option
        await page
            .locator(`input[name="aush_inpatient_status_id__1_input"]`)
            .fill(patientStatus);
        await page
            .getByRole(`option`, { name: patientStatus })
            .locator(`span`)
            .click();
    }

    if (authorizationType === "Inpatient") {
        // Fill in the "Admit Date:"
        await page.locator(`#aush_admit_date__1`).click();
        await page.locator(`#aush_admit_date__1`).clear();
        await page.locator(`#aush_admit_date__1`).pressSequentially(admitDate);
    }

    // Fill in "Auth Status:" and select option
    await page.getByRole(`button`, { name: `` }).nth(2).click();
    await page.locator(`input[name="aush_status_id__1_input"]`).clear();

    await waitUntilLoaded(page);

    await page.locator(`input[name="aush_status_id__1_input"]`).fill(authStatus);
    await page.getByRole(`option`, { name: authStatus }).locator(`span`).click();

    // Fill in the "Summary > Team" section and select option
    await page.locator(`input[name="auth_team_reference_id_input"]`).fill(team);
    await page.getByRole(`option`, { name: team }).click();

    if (authorizationType === "Outpatient" || authorizationType === "Observation") {
        await page
            .locator(`input[name="auth_reviewer_user_id_input"]`)
            .fill(reviewer);
        await page
            .getByRole(`option`, { name: `${reviewer}` })
            .locator(`span`)
            .click();
    }

    // TODO: Need to make this dynamic possibly
    // Select Provider
    await page
        .locator(`[name="auth_provider_1_site_id"] ~ button[title="Lookup"]`)
        .click();




    // Check In and Out of Network boxes
    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();
    await page.getByRole(`checkbox`, { name: `In Network` }).check();

    // Search for the provider
    await page
        .getByRole(`textbox`, { name: `Search...` })
        .fill(`St. Catherine's Hospital`);
    await page
        .getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();
    await page
        .getByRole(`gridcell`, { name: `St. Catherine's Hospital` })
        .first()
        .click();
    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    // TODO: Need to make this dynamic possibly
    // Select Admitting Provider
    try {
        await page
            .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
            .click({ timeout: 3000 });
    } catch {
        // Handle the "Notification" pop up for admitting hospital duplicate
        await expect(page.getByText(`Notification`, { exact: true })).toBeVisible({
            timeout: 3000,
        });
        await page.getByRole(`button`, { name: `Okay` }).click({ timeout: 3000 });

        await page
            .locator(`[name="auth_provider_2_site_id"] ~ button[title="Lookup"]`)
            .click({ timeout: 3000 });
    }



    // Try to dimiss the notification
    try{
        await page.getByText(`Notification`, { exact: true, timeout: 5000 }).waitFor();
        await page.getByRole(`button`, { name: `Okay` }).click();
    }catch{
        console.log("Notification did not appear.");
    }



    // Check In and Out of Network boxes
    await page.getByRole(`checkbox`, { name: `Out of Network` }).check();



    await page.getByRole(`checkbox`, { name: `In Network` }).check();


    // Search for the provider
    await page
        .getByRole(`textbox`, { name: `Search...` })
        .fill(`St. Catherine's Hospital`);
    await page
        .getByRole(`dialog`, { name: `Lookup` })
        .locator(`#lookup-search-button`)
        .click();
    await page
        .getByRole(`gridcell`, { name: `St. Catherine's Hospital` })
        .first()
        .click();


    await page.getByRole(`button`, { name: `Select`, exact: true }).click();

    // Click the "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    await waitUntilLoaded(page);

    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        // Grab the work activity date of the work log
        worklogActivityDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({
            timeout: 3000,
        });
    }
    await waitUntilLoaded(page);

    // Grab the "Auth #"
    await page.locator(`#form-header .headerLabel`).waitFor();
    const authNum = await page.locator(`#form-header .headerLabel`).innerText();

    // Return the authNum for cleanup later
    return { authNum, worklogActivityDate };
}









export async function deactivateAllRateAuthorizations(page, options = {}) {
    const description = options.description || "";

    // Click `Tools` button
    await page.getByText(`Tools`).click();

    // Click `Companies` button
    await page.getByText(`Companies`).click();

    //await waitUntilLoaded(page);

    // Click `Rates` button
    await page.getByText(`Rates`).click();

    await waitUntilLoaded(page);

    // Click `Authorizations` tab
    await page.getByLabel(`Manage Companies`).getByText(`Authorizations`).click();

    //await waitUntilLoaded(page);

    // Fill in the Search bar and click search
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .getByPlaceholder(`Search...`)
        .fill(description);
    await page
        .getByRole(`tabpanel`, { name: `Authorizations` })
        .locator(`#admin-search-button`)
        .click();


    //await waitUntilLoaded(page);

    await page.waitForTimeout(10_000);
    let attempts = 0;
    while (attempts < 5) {
        attempts++;
        const count = await page
            .locator(
                `tr >> td[role="gridcell"] >> input[checked][class*="grid-active-checkbox"]:visible`,
            )
            .count();
        for (let i = 0; i < count; i++) {
            await page
                .locator(
                    `tr >> td[role="gridcell"] >> input[checked][class*="grid-active-checkbox"]:visible`,
                )
                .first()
                .click();
        }


        //await waitUntilLoaded(page);

        if (
            await page
                .locator(`[id="browse-grid"] [title="Go to the next page"]:visible`)
                .isDisabled()
        ) {
            break;
        }
        await page
            .locator(`[id="browse-grid"] [title="Go to the next page"]:visible`)
            .click();
        await page.waitForTimeout(3000);
    }

    //await waitUntilLoaded(page);

    // Click `Close` button
    await page.getByText(`Close`, { exact: true }).click();
}









export async function createComplianceForMember(page, options = {}) {
    const memberName = options.memberName || `Chin, Huang`;
    const complianceType = options.complianceType || `Appeal`; // ["Appeal", "Grievance"]
    const team = options.team || `Compliance Team`; // ["Case Team", "Compliance Team", "MD Team", "Review Team", "UM Team"]
    const appealType = options.appealType || `Claims Appeal`; // ["Claims Appeal", "Denial Appeal"]
    const appealCategory = options.appealCategory || `DMR`; // ["DMR", "DMR Reconsideration", "NCP Claim", "NCP Reconsideration", "PTS Determination", "PTS Reconsideration"]
    const level = options.level || `First Level`; // ["First Level", "Fourth Level", "Judicial Review", "Second Level", "Third Level"]
    const priority = options.priority || `Concurrent`; // ["Concurrent", "PTS-expedited", "PTS-Standard", "Retro"]
    const dueDateExtensionType = options.dueDateExtensionType || `None`; // ["Extension", "None", "Tolled"]
    let worklogActivityDate = `No worklog appeared please check system configurations > Worklogs`;

    // Navigate to Home > Members
    await page.getByText(`Home`, { exact: true }).click();
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

    // Search for member
    await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
    await page.keyboard.press("Enter");

    // Double click {memberName} to open member page
    await page.getByRole(`gridcell`, { name: memberName }).dblclick();
    await waitUntilLoaded(page);

    // Click the "Compliance" tab
    await page
        .getByLabel(memberName)
        .getByText(`Compliance`, { exact: true })
        .first()
        .click();

    // Hover the "+ Compliance" button
    await page
        .getByRole(`button`)
        .filter({ hasText: `Compliance Appeal Grievance` })
        .hover();
    await page
        .getByRole(`menuitem`, { name: complianceType, exact: true })
        .locator(`a`)
        .click();

    // Fill in Team and select option
    await page.locator(`input[name="cpch_team_reference_id_input"]`).fill(team);
    await page
        .getByRole(`option`, { name: team, exact: true })
        .locator(`span`)
        .click();

    // Fill in Appeal Type and select option
    await page.locator(`input[name="cpch_type_input"]`).fill(appealType);
    await page
        .getByRole(`option`, { name: appealType, exact: true })
        .locator(`span`)
        .click();

    // Fill in Appeal Category
    await page
        .locator(`input[name="cpch_appeal_category_input"]`)
        .fill(appealCategory);
    await page
        .getByRole(`option`, { name: appealCategory, exact: true })
        .locator(`span`)
        .click();

    // Appeal Status should default to Open
    // Opened Date should be date of creation

    // Fill in level and select option
    await page.locator(`input[name="cpch_level_input"]`).fill(level);
    await page
        .getByRole(`option`, { name: level, exact: true })
        .locator(`span`)
        .click();

    // Fill Priority and select option
    await page.locator(`input[name="cpch_priority_input"]`).fill(priority);
    await page
        .getByRole(`option`, { name: priority, exact: true })
        .locator(`span`)
        .click();

    // Toggle on "Due Date Extention Type" radio button
    await page.getByRole(`radio`, { name: dueDateExtensionType }).click();

    // TODO: If needed
    // // Get iframe locator
    // const frame = page.frameLocator(`[title="Editable area. Press F10 for toolbar."]`).first();

    // // Fill in the "Reason for Appeal"
    // await frame.locator(`[id="cpch_reason"]`).fill(`Test`)

    // Click "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();
    await waitUntilLoaded(page);

    try {
        await expect(page.getByText(`New Work Log`)).toBeVisible({ timeout: 3000 });
        // Grab the work activity date of the work log
        worklogActivityDate = await page
            .locator(`#work_activity_date`)
            .evaluate((e) => e.value);
        await page.getByRole(`button`, { name: ` Save and Close` }).click();
    } catch {
        await expect(page.getByText(`New Work Log`)).not.toBeVisible({
            timeout: 3000,
        });
    }

    const appealNum = await page.getByText(`Appeal #`).innerText();
    return { appealNum, worklogActivityDate };
}











export async function cleanupNotesFromMember(page, options = {}) {
    const onMemberPage = options.onMemberPage || false;
    const loginID = options.loginID;
    const memberName = options.memberName;

    if (!onMemberPage) {
        // Navigate to Home > Members
        await page.getByText(`Home`, { exact: true }).click();
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Fill in memberName and press enter
        await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
        await page.keyboard.press("Enter");

        // Double click the member name to open the member page
        await page.getByRole(`gridcell`, { name: memberName }).dblclick();
    }

    // Navigate to the Notes section
    await page.locator(`[id="shortcuts"] [data-value="notes-anchor"]`).click();

    // Fill in the search bar for Notes section and hit enter
    await page
        .locator(`#notes-anchor`)
        .getByRole(`textbox`, { name: `Search...` })
        .fill(`${loginID}`);
    await page.keyboard.press("Enter");
    await waitUntilLoaded(page);

    let count = await page
        .locator(`[id="notes-child-grid"] table tbody tr:has-text("${loginID}")`)
        .count();

    for (let i = 0; i < count; i++) {
        // Hover over the note and click the delete button
        await page
            .locator(`[id="notes-child-grid"] table tbody tr:has-text("${loginID}")`)
            .first()
            .hover();
        await page
            .locator(
                `[id="notes-child-grid"] table tbody tr:has-text("${loginID}") [title="Delete"]`,
            )
            .first()
            .click();

        // Click the "Yes" button
        await page.getByRole(`button`, { name: `Yes` }).click();
        await waitUntilLoaded(page);
    }
}












export async function cleanupTabOnMembersPage(page, options = {}) {
    const tab = options.tab || `Compliance`;
    const gridId = options.gridId || `[id="compliance-grid"]`; // [`[id="authorizations-grid"]`, `[id="member-coverage-grid"]` ]
    const memberName = options.memberName || `Blackwell, Megan`;
    const memberId = options.memberId || ``;
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;

    await waitUntilLoaded(page);

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText(`Home`, { exact: true }).click();
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Fill search bar
        await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
        await page.keyboard.press("Enter");

        await waitUntilLoaded(page);

        // Double click the member name row
        try {
            await page.getByRole(`gridcell`, { name: memberName }).dblclick();
            await waitUntilLoaded(page);
        } catch {
            await page.getByRole(`gridcell`, { name: memberId }).dblclick();
            await waitUntilLoaded(page);
        }

        // Navigate to tab on members page
        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();
    }

    // Grab the count of rows visible that are created by our user
    let count = await page
        .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`)
        .count();

    await waitUntilLoaded(page);

    for (let i = 0; i < count; i++) {
        // Hover the first row created by our user and click the trash icon
        await page
            .locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`)
            .first()
            .hover();

        await waitUntilLoaded(page);

        await page
            .locator(
                `${gridId} table tbody tr:visible:has-text("${loginID}") [title="Delete"]`,
            )
            .first()
            .click();

        await waitUntilLoaded(page);

        // Click Yes button on the warning pop up
        await page.getByRole(`button`, { name: `Yes` }).click();
        await waitUntilLoaded(page);
    }
}















export async function cleanupTabOnMembersPage2(page, options = {}) {
    const tab = options.tab || `Compliance`;
    const gridId = options.gridId || `[id="compliance-grid"]`;
    const memberName = options.memberName || `Blackwell, Megan`;
    const memberId = options.memberId || ``;
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;

    await waitUntilLoaded(page);

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText(`Home`, { exact: true }).click();
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Search for member
        await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
        await page.keyboard.press(`Enter`);
        await waitUntilLoaded(page);

        // Open member
        try {
            await page.getByRole(`gridcell`, { name: memberName }).dblclick();
        } catch {
            await page.getByRole(`gridcell`, { name: memberId }).dblclick();
        }

        await waitUntilLoaded(page);

        // Navigate to target tab
        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();

        await waitUntilLoaded(page);
    }

    // ✅ Locator for ALL matching rows
    const rows = page.locator(
        `${gridId} table tbody tr:visible:has-text("${loginID}")`
    );

    // ✅ Delete rows UNTIL none remain
    while (await rows.count() > 0) {
        const row = rows.first();

        // Stabilize row
        await row.scrollIntoViewIfNeeded();
        await row.hover();

        // Click delete
        await row.locator('[title="Delete"]').click();

        // Confirm delete
        await page.getByRole(`button`, { name: `Yes` }).click();

        // ✅ CRITICAL: wait for THIS row to be gone
        //await expect(row).toBeHidden({ timeout: 5000 });

        // Allow grid to fully re-render
        await waitUntilLoaded(page);
    }
}













export async function createACaseForMember(page, options = {}) {
    const memberName = options.memberName;

    // Navigate to Home > Members
    await page.getByText(`Home`, { exact: true }).click();
    await page.locator(`#home-tabs-tab-4`).click();

    // Search for member
    await page.getByRole(`textbox`, { name: `Search...` }).fill(memberName);
    await page.keyboard.press("Enter");

    // Double click the member row to open the members page
    await page.getByRole(`gridcell`, { name: memberName }).dblclick();

    // Click the "Case" tab
    await page.getByText(`Case`, { exact: true }).first().click();

    // Click the "+Case"button
    await page.getByRole(`button`, { name: ` Case` }).click();
    await waitUntilLoaded(page);

    // Click the "Save" button
    await page.getByRole(`button`, { name: ` Save` }).click();

    // Click the "Save and Close" button on the "New Work Log" pop up
    await page.getByRole(`button`, { name: ` Save and Close` }).click();

    // Grab the case number
    const caseNum = await page.locator(`#form-header .headerLabel`).innerText();

    return { caseNum };
}




export async function cleanUpDisabilities(page, options) {
    // Set variable(s)
    const memberName = options.memberName || "";

    // Delete previously-created disability, if needed
    try {
        await expect(
            page.locator(`.formSection:has-text("Disability") .formSectionContent`),
        ).not.toBeVisible({ timeout: 3000 });
    } catch {
        // Click Edit button
        await page.getByRole(`button`, { name: ` Edit` }).click();

        // Click `Disability` tab
        await page.locator(`#shortcuts`).getByText(`Disability`).click();

        // Click `Trash` icon
        await page
            .locator(
                `div[class*="formCollection"]:has-text("Disability Type:") button[title="Delete"]`,
            )
            .click();

        // Click `Save` button
        await page.getByRole(`button`, { name: ` Save` }).click();

        // Click `Save and close` button
        await page.getByRole(`button`, { name: ` Save and Close` }).click();

        // Wait for save to be successful
        await expect(
            page.locator(`.formSection:has-text("Disability")`),
        ).toBeVisible();
        await expect(
            page.locator(`.formSection:has-text("Disability") .formSectionContent`),
        ).not.toBeVisible();

        // Wait 3 seconds to make sure changes are saved
        await page.waitForTimeout(3000);
    }
}



export async function reloadMemberDetailsPage(page, options = {}) {
    let headerSelector = options.selector;

    // Reload page
    await page.reload();

    // Get back to member's info page
    await page.getByText(`Home`, { exact: true }).click();
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();
    await page
        .getByRole(`textbox`, { name: `Search...` })
        .fill(options.memberName);
    await page.keyboard.press("Enter");
    await page.getByRole(`gridcell`, { name: options.memberName }).dblclick();
    await waitUntilLoaded(page);

    // Scroll to a specific section so it's in view
    await headerSelector.scrollIntoViewIfNeeded();
}



export async function cleanUpOrganDonor(page, options = {}) {
    // Extract optional member name (reserved for future use)
    const memberName = options.memberName || "";

    // Attempt to confirm that no Organ Donor record is visible.
    try {
        await expect(page.getByText(`Do Not Resuscitate (Out of`)).not.toBeVisible({
            timeout: 3000,
        });
    } catch {
        // If visible, perform clean-up flow.

        // Click the `Edit` button to modify the record
        await page.getByRole(`button`, { name: ` Edit` }).click();

        // Open the `Organ Donor` tab
        await page.getByRole(`button`, { name: `  Organ Donor` }).click();

        // Click the first available `Trash` icon to delete the entry
        await page.getByRole(`button`, { name: `` }).first().click();

        // Save the changes
        await page.getByRole(`button`, { name: ` Save` }).click();

        // Save and close the dialog/form
        await page.getByRole(`button`, { name: ` Save and Close` }).click();

        // Wait a short period to ensure changes are persisted
        await page.waitForTimeout(3000);
    }
}




export async function cleanUpAttachementFromMemberPage(page, options = {}) {
    const memberName = options.memberName || "";

    // Click `Members` button
    await page
        .getByRole(`tab`, { name: `Members` })
        .locator(`span`)
        .last()
        .click();

    // Set timeout
    await page.waitForTimeout(2000);

    // Fill in search input field
    await page
        .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-text`)
        .fill(memberName);

    // Click `Search` input field
    await page
        .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-button`)
        .click();

    // Click memeber from search results
    await page.getByRole(`gridcell`, { name: memberName }).dblclick();

    // Click `Attamchents` tab
    await page
        .locator(`[data-value="attachments-anchor"]:has-text("Attachments")`)
        .click();

    const memeberDetailCount = await page
        .locator(`#attachments-child-grid`)
        .getByRole(`gridcell`, { name: `Member Detail` })
        .count();

    for (let i = 0; i < memeberDetailCount; i++) {
        // Hover over the first row
        await page
            .locator(`#attachments-child-grid`)
            .getByRole(`gridcell`, { name: `Member Detail` })
            .first()
            .hover();

        // Click `Trash` button
        await page.getByRole(`button`, { name: `` }).click();

        // Click `yes` button
        await page.getByRole(`button`, { name: `Yes` }).click();

        // wait for deletion
        await page.waitForTimeout(2000);
    }

    // Click `X` to close memeber tab
    await page.locator(`#main-tabs-tab-3 .k-font-icon`).click();
}



export async function addAttachementToMember(page, options = {}) {
    const memberName = options.memberName || "";
    const documentHeader = options.documentHeader || "";

    // Click `Members` button
    await page
        .getByRole(`tab`, { name: `Members` })
        .locator(`span`)
        .last()
        .click();

    // Set timeout
    await page.waitForTimeout(2000);

    // Fill in search input field
    await page
        .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-text`)
        .fill(memberName);

    // Click `Search` input field
    await page
        .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-button`)
        .click();

    // Click memeber from search results
    await page.getByRole(`gridcell`, { name: memberName }).dblclick();

    // Click `Attamchents` tab
    await page
        .locator(`[data-value="attachments-anchor"]:has-text("Attachments")`)
        .click();

    // Click `+Attachment` button
    await page.getByRole(`button`, { name: `  Attachment` }).click();

    // Create event listener to watch for a "file upload pop up"
    page.once(
        "filechooser",
        (chooser) =>
            void chooser.setFiles(`/home/wolf/team-storage/Medication Summary.pdf`),
    );

    // Click `Select files` button
    await page.getByRole(`button`, { name: `Select files...` }).click();

    // Fill in `Reason` input field
    await page.getByRole(`button`, { name: `expand combobox` }).first().click();

    // Click `Consent Form` from dropdown menu
    await page.getByText(`Consent Form`).click();

    // Click `Type` input field
    await page.getByRole("button", { name: "expand combobox" }).nth(1).click();

    // Click `Compliance` from dropdown menu
    await page
        .getByRole(`option`, { name: `Compliance` })
        .locator(`span`)
        .click();

    // Fill in `Description` input field
    await page.locator(`[name="atch_description__1"]`).fill(documentHeader);

    // Click `Save and Close` button
    await page.getByRole(`button`, { name: ` Save and Close` }).click();
}



export async function cleanUpMedications(
    page,
    userFirstAndLastName,
    memberIdentifier,
) {
    try {
        // Click `Members` tab
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Fill in search input field
        await page
            .getByRole(`textbox`, { name: `Search...` })
            .fill(memberIdentifier);

        // Click `Search` button
        await page.locator(`#lookup-search-button:visible`).click();

        // Click `Member Identifier` from search results
        await page.getByRole(`gridcell`, { name: memberIdentifier }).dblclick();

        // Click `Medications` tab
        await page
            .locator(`[data-module="medications-menu"][role="menuitem"]`)
            .click();
    } catch {
        console.log("");
    }
    // Count `Reviewer` in row
    const count = await page
        .getByRole("gridcell", { name: userFirstAndLastName, exact: true })
        .count();

    for (let i = 0; i < count; i++) {
        await page
            .getByRole("gridcell", { name: userFirstAndLastName, exact: true })
            .first();

        // Click `Reviewer` in row
        await page
            .getByRole("gridcell", { name: userFirstAndLastName, exact: true })
            .click();

        // Click `Trash` button
        await page.getByRole(`button`, { name: `` }).click();

        // Click `Yes` button on modal
        await page.getByRole(`button`, { name: `Yes` }).click();
    }

    // Close memeber card
    await page.locator(`.k-icon.k-font-icon.k-i-close`).first().click();
}














export async function cleanUpMedications2(
    page,
    userFirstAndLastName,
    memberIdentifier,
) {

    // Navigate safely (best effort)
    try {
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(memberIdentifier);

        await page.locator('#lookup-search-button:visible').click();

        await page
            .getByRole('gridcell', { name: memberIdentifier })
            .dblclick();

        await page
            .locator('[data-module="medications-menu"][role="menuitem"]')
            .click();

    } catch {
        // already on page
    }

    // Locator for reviewer rows
    const reviewerCells = page.getByRole('gridcell', {
        name: userFirstAndLastName,
        exact: true,
    });

    // DELETE UNTIL NONE LEFT
    while (await reviewerCells.count() > 0) {

        const rowCell = reviewerCells.first();

        // Scroll + ensure visibility (important in headed)
        await rowCell.scrollIntoViewIfNeeded();
        await rowCell.click();

        // Click delete
        await page.getByRole('button', { name: '' }).click();

        // Confirm
        await page.getByRole('button', { name: 'Yes' }).click();

        // ✅ CRITICAL: wait for THAT row to be gone
        await expect(rowCell).toBeHidden({ timeout: 10_000 });
    }

    // Close member card safely
    const closeBtn = page.locator('.k-icon.k-font-icon.k-i-close').first();
    if (await closeBtn.isVisible()) {
        await closeBtn.click();
    }
}















export async function cleanUpEmailForMember(page, options) {
    const {member, emailAddress} = options;

    try {
        // Click members tab
        await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

        // Fill in search input field
        await page.getByRole(`textbox`, {name: `Search...`}).fill(member);

        // Click `Search` button
        await page
            .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-button`)
            .click();

        // Click `Member` in search results
        await page.getByRole(`gridcell`, {name: member}).dblclick();
    } catch {
        console.log("Already on members page");
    }

    try {
        await page
            .getByLabel(`Email #`)
            .getByText(`Close`, {exact: true})
            .click();
    } catch {
        console.log("Click close button");
    }

    try {
        // Click `Close` button on modal
        await page
            .getByLabel(`Email #`)
            .getByText(`Close`, {exact: true})
            .click();
    } catch {
        console.log("Modal is not visible");
    }

    // Fill in search input field
    await page
        .locator(`#emails-anchor [placeholder="Search..."]`)
        .fill(emailAddress);

    await page.locator(`[data-grid-prefix="emails"]`).click();

    try {
        // Click external email in search results
        await page.getByRole(`gridcell`, {name: emailAddress}).click();

        // Click `Trash` icon
        await page.getByRole(`button`, {name: ``}).click();

        // Click `Yes` button
        await page.getByRole(`button`, {name: `Yes`}).click();
    } catch {
        console.log("emails cleared");
    }
    // Click `X` button
    await page.locator(`.k-icon.k-font-icon.k-i-close`).first().click();


}

















/*
export async function cleanUpEmailForMember2(page, options) {
    const { member, emailAddress } = options;

    // Try to navigate to the member (safe if already there)
    try {
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member);

        await page
            .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
            .click();

        await page.getByRole('gridcell', { name: member }).dblclick();

        await waitUntilLoaded(page);

    } catch {
        console.log('Already on member page or navigation not needed');
    }

    // Ensure Emails tab is visible
    try {
        await page.locator('#shortcuts').getByText('Emails').click();
    } catch {
        console.log('Emails tab already selected');
    }

    await waitUntilLoaded(page);

    // Close email modal if open
    try {
        await page
            .getByLabel('Email #')
            .getByText('Close', { exact: true })
            .click();
    } catch {
        // modal not open — fine
    }

    await waitUntilLoaded(page);

    // Search emails grid
    await page
        .locator('#emails-anchor [placeholder="Search..."]')
        .fill(emailAddress);

    await page.locator('[data-grid-prefix="emails"]').click();

    await waitUntilLoaded(page);

    // Delete matching email if present
    try {
        await page.getByRole('gridcell', { name: emailAddress }).click();
        await page.getByRole('button', { name: '' }).click();
        await page.getByRole('button', { name: 'Yes' }).click();
    } catch {
        console.log('No emails to delete');
    }

    await waitUntilLoaded(page);

    // ✅ DO NOT close the page here
}

 */











/*
export async function cleanUpEmailForMember2(page, options) {

const { member, emailAddress, clickEmailShortcut } = options;

try {
    // Click members tab
    await page.locator(`#home-tabs-tab-4`).getByText(`Members`).click();

    // Fill in search input field
    await page.getByRole(`textbox`, { name: `Search...` }).fill(member);

    // Click `Search` button
    await page
        .locator(`[data-browse-code="mainBrowse_PATI"] #lookup-search-button`)
        .click();

    // Click `Member` in search results
    await page.getByRole(`gridcell`, { name: member }).dblclick();
} catch {
    console.log("Already on members page");
}



    await expect(page.locator('#emails-anchor').getByText('Emails')).toBeVisible();
    await page.locator('#shortcuts').getByText('Emails').click();


    const emailCells = page.getByRole('gridcell', { name: emailAddress });

    let attempt = 0;

    while ((await emailCells.count()) > 0 && attempt < 5) {
        attempt++;

        try {
            await emailCells.first().click();

            await page.getByRole('button', { name: '' }).click();
            await page.getByRole('button', { name: 'Yes' }).click();

            // Optional: wait for grid refresh / deletion to complete
            await page.waitForTimeout(500);
        } catch (err) {
            console.warn('Attempt to delete email failed:', err);
            break;
        }
    }

// ✅ ASSERTION (VERY IMPORTANT)
    await expect(emailCells).toHaveCount(0);
// Click `X` button
await page.locator(`.k-icon.k-font-icon.k-i-close`).first().click();
}

 */






















export async function cleanUpEmailForMember2(page, options) {
    if (!page || page.isClosed()) {
        console.log('cleanUpEmailForMember2 skipped: page is closed');
        return;
    }

    const { member, emailAddress } = options;

    //--------------------------------
    // Navigate to member (safe / idempotent)
    //--------------------------------
    try {
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page
            .getByRole('textbox', { name: 'Search...' })
            .fill(member);

        await page
            .locator('[data-browse-code="mainBrowse_PATI"] #lookup-search-button')
            .click();

        await page
            .getByRole('gridcell', { name: member })
            .dblclick();

        await waitUntilLoaded(page);
    } catch {
        // Already on member or navigation not possible — safe to continue
    }

    if (page.isClosed()) return;

    //--------------------------------
    // Ensure Emails tab is active
    //--------------------------------
    try {
        await page.locator('#shortcuts').getByText('Emails').click();
    } catch {
        // Emails tab already active
    }

    if (page.isClosed()) return;

    //--------------------------------
    // Wait for Emails grid to be ready
    //--------------------------------
    // Ensure grid exists in DOM (visibility is not guaranteed in Kendo)
    await expect(
        page.locator('#emails-child-grid')
    ).toBeAttached();

    const emailCells = page.getByRole('gridcell', { name: emailAddress });

    // ✅ Wait until either rows appear OR the grid reports no records
    try {
        await Promise.race([
            emailCells.first().waitFor({ state: 'visible', timeout: 5000 }),
            page.getByText('No records', { exact: false }).waitFor({
                timeout: 5000,
            }),
        ]);
    } catch {
        // Grid may already be empty — safe to continue

        await page.getByText('Home', { exact: true }).click();

    }

    //--------------------------------
    // Delete all matching emails
    //--------------------------------
    let attempt = 0;

    while ((await emailCells.count()) > 0 && attempt < 5) {
        attempt++;

        try {
            await emailCells.first().click();

            await page
                .getByRole('button', { name: '' }) // Trash
                .click();

            await page
                .getByRole('button', { name: 'Yes' })
                .click();

            // Allow grid to refresh after deletion
            await page.waitForTimeout(500);
        } catch (err) {
            console.warn('Email deletion attempt failed:', err);
            break;
        }
    }

    //--------------------------------
    // Final assertion: grid is clean
    //--------------------------------
    await expect(emailCells).toHaveCount(0);
}


















export async function maybeHandleNotificationOk1(
    page,
    { dialogName = 'Notification', okButtonName = 'Okay', timeout = 3000 } = {},
) {
    const dialog = page.getByRole('dialog', { name: dialogName });
    const appeared = await dialog
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
    if (!appeared) return false;
    await dialog.getByRole('button', { name: okButtonName }).click({ timeout });
    return true;
}