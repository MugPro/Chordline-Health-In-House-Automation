import { test, expect } from '@playwright/test';

// ✅ Match your helpers location used in prior tests
import {
    logIn,
    waitUntilLoaded,
    reportCleanupFailed,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData, logIn3,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

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
   Local utilities (replace faker usage)
   ------------------------------------------- */
function pickRandomElements(arr, count) {
    const copy = [...arr];
    const picked = [];
    const n = Math.min(count, copy.length);
    for (let i = 0; i < n; i++) {
        const idx = Math.floor(Math.random() * copy.length);
        picked.push(copy.splice(idx, 1)[0]);
    }
    return picked;
}

function pickRandomElement(arr) {
    if (!arr.length) return undefined;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx];
}

/**
 * Remove `count` random elements from `arr`, returning:
 *  - updated: array without the removed elements
 *  - removed: the elements that were removed
 */
function removeRandomElements(arr, count) {
    if (count >= arr.length) return { updated: [], removed: [...arr] };

    const result = [...arr]; // copy
    const removed = [];

    for (let i = 0; i < count; i++) {
        const indexToRemove = Math.floor(Math.random() * result.length);
        const [element] = result.splice(indexToRemove, 1);
        removed.push(element);
    }
    return { updated: result, removed };
}

test('Create, edit and delete Security Role (External)', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `SecRoleIntCRUD`;
    const securityRoleName = `internalTestCRUDExternal`;
    const securityRoleNameEdit = `internalTestCRUDExternal-edit`;

    // Sign in to the app
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    // Navigate: Tools > Users & Roles > Security Roles
    await page.getByText(`Tools`).hover();
    await clickAndWait(page, page.getByText(`Users & Roles`));
    await clickAndWait(page, page.getByText(`Security Roles`));
    await waitUntilLoaded(page);

    // Click `External` tab
    await clickAndWait(page, page.getByText(`External`, { exact: true }));
    await waitUntilLoaded(page);

    // -- Cleanup (idempotent): remove pre-existing test roles if present --
    try {
        // If the base name is present, delete it
        if (
            await page
                .getByRole(`gridcell`, { name: securityRoleName, exact: true })
                .isVisible()
        ) {
            // Focus the row
            await clickAndWait(
                page,
                page.getByRole(`gridcell`, { name: securityRoleName, exact: true }),
            );

            // Click "Trash" icon in its row
            await page
                .locator(
                    `tr:has(td:text-is("${securityRoleName}")) button[title="Delete"]`,
                )
                .click();

            // Confirm Yes
            await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
            //await waitUntilLoaded(page);
        }

        // If the edited name is present, delete it
        if (
            await page
                .getByRole(`gridcell`, { name: securityRoleNameEdit, exact: true })
                .isVisible()
        ) {
            // Focus the row
            await clickAndWait(
                page,
                page.getByRole(`gridcell`, { name: securityRoleNameEdit, exact: true }),
            );

            // Click "Trash" icon in its row
            await page
                .locator(`tr:has-text("${securityRoleNameEdit}") button[title="Delete"]`)
                .click();

            // Confirm Yes
            await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
            //await waitUntilLoaded(page);
        }
    } catch (e) {
        await reportCleanupFailed({
            errorMsg: e?.message ?? 'Unknown cleanup error',
        });
    }

    await waitUntilLoaded(page);

    //--------------------------------
    // Act: Create
    //--------------------------------
    // Click the "+ New" button (NBSP in label)
    await clickAndWait(
        page,
        page.getByRole(`button`, { name: ` \u00A0New` }),
    );

    await waitUntilLoaded(page);

    // Fill role name
    await fillAndWait(page, page.locator(`#roleName`), securityRoleName);

    // Click "Expand All"
    await clickAndWait(page, page.getByRole(`button`, { name: `Expand All` }));
    await waitUntilLoaded(page);

    // Grab the flattened structure of the roles with respective descendants and checkbox id/locators
    let flatTreeData = await grabSecurityRoles(page);

    // Grab random roles and check the checkboxes (pick 10)
    const randomSelectRoles = pickRandomElements(flatTreeData, 10);
    for (const role of randomSelectRoles) {
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    await waitUntilLoaded(page);

    // Click "Save and Close"
    await clickAndWait(page, page.getByRole(`button`, { name: `Save and Close` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert (post-create)
    //--------------------------------
    // Assert the newly created {securityRoleName} is visible
    await expect(
        page.getByRole(`gridcell`, { name: securityRoleName }),
    ).toBeVisible();

    // Open it (double-click)
    await page.getByRole(`gridcell`, { name: securityRoleName }).dblclick();

    await waitUntilLoaded(page);

    // Click "Expand All"
    await clickAndWait(page, page.getByRole(`button`, { name: `Expand All` }));
    await waitUntilLoaded(page);

    // Re-grab the flat tree to refresh checkbox ids (they can be generated)
    flatTreeData = await grabSecurityRoles(page);
    await updateCheckBoxIdFromFlatTreeData(flatTreeData, randomSelectRoles);

    await waitUntilLoaded(page);

    // Ensure all selected roles are still checked
    for (const role of randomSelectRoles) {
        await expect(page.locator(`input[id="${role.checkboxId}"]`)).toBeChecked({
            timeout: 4000,
        });
    }

    await waitUntilLoaded(page);

    //--------------------------------
    // Edit (rename + permissions tweak)
    //--------------------------------
    // Edit the Security Role Name
    await fillAndWait(page, page.locator(`#roleName`), securityRoleNameEdit);

    await waitUntilLoaded(page);

    // Uncheck some roles from {randomSelectRoles}
    const { updated, removed } = removeRandomElements(randomSelectRoles, 3);


    for (const role of removed) {
        await page.locator(`input[id="${role.checkboxId}"]`).uncheck();
    }

    await waitUntilLoaded(page);

    // Check three *new* roles not already in the selection
    const selectedIds = new Set(updated.map((r) => r.checkboxId));
    const threeRolesToAdd = [];

    // Build a candidate pool that excludes already-selected and already-removed (to avoid re-adding)
    const excludedIds = new Set([
        ...selectedIds,
        ...removed.map((r) => r.checkboxId),
    ]);
    const candidatePool = flatTreeData.filter(
        (r) => r.checkboxId && !excludedIds.has(r.checkboxId),
    );

    while (threeRolesToAdd.length < 3 && candidatePool.length > 0) {
        const candidate = pickRandomElement(candidatePool);
        if (candidate && !selectedIds.has(candidate.checkboxId)) {
            threeRolesToAdd.push(candidate);
            selectedIds.add(candidate.checkboxId);
            // Remove from candidate pool to avoid duplicates
            const idx = candidatePool.findIndex(
                (c) => c.checkboxId === candidate.checkboxId,
            );
            if (idx >= 0) candidatePool.splice(idx, 1);
        }
    }

    await waitUntilLoaded(page);

    for (const role of threeRolesToAdd) {
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    // Consolidate all the checked roles into one array
    const editedArr = [...updated, ...threeRolesToAdd];

    await waitUntilLoaded(page);

    // Save and close
    await clickAndWait(page, page.getByRole(`button`, { name: `Save and Close` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert (post-edit)
    //--------------------------------
    // Edited name should be visible
    await expect(
        page.getByRole(`gridcell`, { name: securityRoleNameEdit }),
    ).toBeVisible();

    // Open edited role
    await page.getByRole(`gridcell`, { name: securityRoleNameEdit }).dblclick();

    await waitUntilLoaded(page);

    // Click "Expand All"
    await clickAndWait(page, page.getByRole(`button`, { name: `Expand All` }));
    await waitUntilLoaded(page);

    // Refresh flat tree and update ids for edited arrays
    flatTreeData = await grabSecurityRoles(page);
    await updateCheckBoxIdFromFlatTreeData(flatTreeData, editedArr);
    await waitUntilLoaded(page);
    await updateCheckBoxIdFromFlatTreeData(flatTreeData, removed);

    await waitUntilLoaded(page);

    // Removed roles should be unchecked
    for (const role of removed) {
        await expect(page.locator(`input[id="${role.checkboxId}"]`)).not.toBeChecked({
            timeout: 4000,
        });
        // small pause to let any UI updates settle if needed
        await page.waitForTimeout(2000);
    }

    await waitUntilLoaded(page);

    //--------------------------------
    // Delete (cleanup)
    //--------------------------------
    // Close the edit modal
    await page
        .getByLabel(`Edit Security Role - External`)
        .getByText(`Close`, { exact: true })
        .click();

    // Focus the edited role row
    await clickAndWait(
        page,
        page.getByRole(`gridcell`, { name: securityRoleNameEdit }),
    );

    // Click "Trash" icon in its row
    await page
        .locator(`tr:has-text("${securityRoleNameEdit}") button[title="Delete"]`)
        .click();

    // Confirm Yes
    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));

    //await waitUntilLoaded(page);

    //--------------------------------
    // Assert (post-delete)
    //--------------------------------
    await expect(
        page.getByRole(`gridcell`, { name: securityRoleNameEdit }),
    ).not.toBeVisible();


});
