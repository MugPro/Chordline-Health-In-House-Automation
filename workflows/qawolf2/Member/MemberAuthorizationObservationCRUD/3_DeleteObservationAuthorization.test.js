/*import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

export async function cleanupTabOnMembersPage(page, options = {}) {
    const tab = options.tab || 'Authorizations';
    const gridId = options.gridId || '[id="authorizations-grid"]';
    const memberName = options.memberName || 'Blackwell, Megan';
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page.getByRole('textbox', { name: 'Search...' }).fill(memberName);
        await page.keyboard.press('Enter');

        try {
            await page.getByRole('gridcell', { name: memberName }).dblclick();
            await helpers.waitUntilLoaded(page);
        } catch {
            console.log(`Member row not found by name`);
        }

        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();
    }

    // Wait for grid to be visible
    await page.locator(`${gridId} table tbody`).waitFor({ state: 'visible', timeout: 10000 });

    // Delete all rows created by loginID
    let rowLocator = page.locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`);

    while (await rowLocator.count() > 0) {
        const firstRow = rowLocator.first();
        await firstRow.scrollIntoViewIfNeeded();
        await firstRow.hover();

        const deleteButton = firstRow.locator('[title="Delete"]').first();
        await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
        await deleteButton.click();

        // Wait for confirmation dialog and click 'Yes'
        const yesButton = page.getByRole('button', { name: 'Yes' });
        await yesButton.waitFor({ state: 'visible', timeout: 5000 });
        await yesButton.click();

        await helpers.waitUntilLoaded(page);

        // Handle workflow lock notification, if it appears
        const workflowNotification = page.locator('#notif-message', {
            hasText: 'This record is locked by Workflow Rule Account.',
        });

        if (await workflowNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
            const okButton = page.locator('#positiveButton');
            await okButton.click();
            console.log('Skipped workflow-locked record by clicking Okay');
            break; // Stop trying to delete this locked record
        }

        // Update rowLocator to continue loop
        rowLocator = page.locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`);
    }
}

test('Delete all Observation Authorizations', async () => {
    const loginID = 'ObservationCRUD';
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const member = { name: 'Blackwell, Megan' };
    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';

    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    await cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    // Log remaining rows (should only be workflow-locked records)
    const remainingRows = await page.locator(`${gridId} table tbody tr:visible:has-text("${loginID}")`).count();
    console.log(`Remaining rows for ${loginID}:`, remainingRows);
});


 */
























import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/qawolf2.env.js';

// Helper: wait for at least one row for loginID to appear
async function waitForRows(page, selector, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const count = await page.locator(selector).count();
        if (count > 0) return true; // rows found
        await page.waitForTimeout(500); // short wait before retry
    }
    return false; // no rows found after timeout
}

export async function cleanupTabOnMembersPage(page, options = {}) {
    const tab = options.tab || 'Authorizations';
    const gridId = options.gridId || '[id="authorizations-grid"]';
    const memberName = options.memberName || 'Blackwell, Megan';
    const loginID = options.loginID;
    const onScreen = options.onScreen || false;

    if (!onScreen) {
        // Navigate to Home > Members
        await page.getByText('Home', { exact: true }).click();
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        await page.getByRole('textbox', { name: 'Search...' }).fill(memberName);
        await page.keyboard.press('Enter');

        try {
            await page.getByRole('gridcell', { name: memberName }).dblclick();
            await helpers.waitUntilLoaded(page);
        } catch {
            console.log(`Member row not found by name`);
        }

        await page
            .getByLabel(memberName)
            .getByText(tab, { exact: true })
            .first()
            .click();
    }

    // Wait for grid container
    await page.locator(gridId).waitFor({ state: 'visible', timeout: 10000 });

    const rowSelector = `${gridId} table tbody tr:visible:has-text("${loginID}")`;
    const rowsExist = await waitForRows(page, rowSelector, 15000); // wait up to 15s

    if (!rowsExist) {
        console.log(`No records found for ${loginID}. Nothing to delete.`);
        return;
    }

    console.log(`Records found for ${loginID}. Deleting...`);

    let rowLocator = page.locator(rowSelector);

    while (await rowLocator.count() > 0) {
        const firstRow = rowLocator.first();
        await firstRow.scrollIntoViewIfNeeded();
        await firstRow.hover();

        const deleteButton = firstRow.locator('[title="Delete"]').first();

        if ((await deleteButton.count()) === 0) {
            console.log('Row found but no delete button. Stopping.');
            break;
        }

        await deleteButton.click();

        const yesButton = page.getByRole('button', { name: 'Yes' });
        if (await yesButton.isVisible().catch(() => false)) {
            await yesButton.click();
        }

        await helpers.waitUntilLoaded(page);

        const workflowNotification = page.locator('#notif-message', {
            hasText: 'This record is locked by Workflow Rule Account.',
        });

        if (await workflowNotification.isVisible().catch(() => false)) {
            await page.locator('#positiveButton').click();
            console.log('Skipped workflow-locked record.');
            break;
        }

        // Re-query rows
        rowLocator = page.locator(rowSelector);
    }

    const remaining = await rowLocator.count();
    console.log(`Cleanup complete. Remaining rows for ${loginID}: ${remaining}`);
}

test('Delete Outpatient and other Authorizations', async () => {
    const loginID = 'ObservationCRUD';
    const password = process.env.DEFAULT_PASS_OCT_2025;
    const member = { name: 'Blackwell, Megan' };
    const tab = 'Authorizations';
    const gridId = '[id="authorizations-grid"]';

    const { page } = await helpers.logIn({
        loginID,
        password,
        url: env.DEFAULT_URL_2,
    });

    await cleanupTabOnMembersPage(page, {
        tab,
        memberName: member.name,
        loginID,
        gridId,
    });

    // Optional: log remaining rows (for verification)
    const remainingRows = await page.locator(
        `${gridId} table tbody tr:visible:has-text("${loginID}")`
    ).count();

    console.log(`Final remaining rows for ${loginID}: ${remainingRows}`);



});
