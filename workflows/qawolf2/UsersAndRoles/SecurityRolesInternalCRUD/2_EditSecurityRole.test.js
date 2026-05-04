/*
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    waitUntilLoaded,
    reportCleanupFailed,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData,
} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';



test('Security Roles - Edit existing role and modify privileges', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------

    const loginID = `SecRoleIntCRUD`;
    const securityRoleName = `internalTestCRUD`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;

    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
    });

    // Navigate to Security Roles
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);

    // Open existing role
    const existingRoleCell = page.getByRole(`gridcell`, {
        name: securityRoleName,
        exact: true,
    });

    await expect(existingRoleCell).toBeVisible({ timeout: 15000 });
    await existingRoleCell.dblclick();

    // Expand FIRST (Kendo re-render protection)
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Grab current tree
    let flatTreeData = await grabSecurityRoles(page);

    // Get currently checked roles
    const currentlyChecked = flatTreeData.filter(role =>
        role.checkboxId &&
        role.checkboxId !== null
    );

    //--------------------------------
    // Helper
    //--------------------------------
    function removeRandomElements(arr, count) {
        if (count >= arr.length) return { updated: [], removed: [...arr] };

        const result = [...arr];
        const removed = [];

        for (let i = 0; i < count; i++) {
            const indexToRemove = Math.floor(Math.random() * result.length);
            const [element] = result.splice(indexToRemove, 1);
            removed.push(element);
        }

        return { updated: result, removed };
    }

    //--------------------------------
    // Act
    //--------------------------------

    // Rename role AFTER expand
    const roleNameInput = page.locator(`#roleName`);
    await roleNameInput.fill(securityRoleNameEdit);
    await expect(roleNameInput).toHaveValue(securityRoleNameEdit);

    // Remove 3 checked roles
    const { updated, removed } = removeRandomElements(currentlyChecked, 3);

    for (const role of removed) {
        await page.locator(`input[id="${role.checkboxId}"]`).uncheck();
    }

    // Add 3 new random roles not already selected
    const availableRoles = flatTreeData.filter(
        role => !updated.find(r => r.checkboxId === role.checkboxId)
    );

    const threeRolesToAdd = faker.helpers.arrayElements(availableRoles, 3);

    for (const role of threeRolesToAdd) {
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    const editedArr = [...updated, ...threeRolesToAdd];

    // Save and Close
    await page.getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);

    // Wait for updated row
    await page.waitForSelector(
        `tr:has(td:text-is("${securityRoleNameEdit}"))`,
        { timeout: 15000 }
    );

    //--------------------------------
    // Assert
    //--------------------------------

    const editedCell = page.getByRole(`gridcell`, {
        name: securityRoleNameEdit,
        exact: true,
    });

    await expect(editedCell).toBeVisible();

    // Reopen
    await editedCell.dblclick();

    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    flatTreeData = await grabSecurityRoles(page);

    updateCheckBoxIdFromFlatTreeData(flatTreeData, editedArr);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, removed);


    // Assert checked
    for (const role of editedArr) {
        await expect(
            page.locator(`input[id="${role.checkboxId}"]`)
        ).toBeChecked({ timeout: 5000 });
    }

    // Assert unchecked
    for (const role of removed) {
        await expect(
            page.locator(`input[id="${role.checkboxId}"]`)
        ).not.toBeChecked({ timeout: 5000 });
    }



});


 */















/*
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    waitUntilLoaded,
    reportCleanupFailed,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData,
} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';



test('Security Roles - Edit existing role and modify privileges', async () => {


//--------------------------------
// Arrange
//--------------------------------

const loginID = `SecRoleIntCRUD`;
const securityRoleName = `internalTestCRUD`;
const securityRoleNameEdit = `internalTestCRUD-edit`;

const { page } = await logIn({
    url: process.env.DEFAULT_URL_2,
    loginID,
});

// Navigate to Security Roles
await page.getByText(`Tools`).hover();
await page.getByText(`Users & Roles`).click();
await page.getByText(`Security Roles`).click();
await waitUntilLoaded(page);

//--------------------------------
// Open existing role
//--------------------------------
const existingRoleCell = page.getByRole(`gridcell`, {
    name: securityRoleName,
    exact: true,
});

await expect(existingRoleCell).toBeVisible({ timeout: 15000 });
await existingRoleCell.dblclick();

// Expand all (triggers Kendo re-render)
await page.getByRole(`button`, { name: `Expand All` }).click();
await waitUntilLoaded(page);

// Grab current tree data after expand
let flatTreeData = await grabSecurityRoles(page);

// Get currently checked roles
const currentlyChecked = flatTreeData.filter(role =>
    role.checkboxId && role.checkboxId !== null
);

//--------------------------------
// Helper: remove random elements
//--------------------------------
function removeRandomElements(arr, count) {
    if (count >= arr.length) return { updated: [], removed: [...arr] };

    const result = [...arr];
    const removed = [];

    for (let i = 0; i < count; i++) {
        const indexToRemove = Math.floor(Math.random() * result.length);
        const [element] = result.splice(indexToRemove, 1);
        removed.push(element);
    }

    return { updated: result, removed };
}

//--------------------------------
// Act
//--------------------------------

// Fill role name AFTER expand
const roleNameInput = page.locator(`#roleName`);
await roleNameInput.fill(securityRoleNameEdit);
await expect(roleNameInput).toHaveValue(securityRoleNameEdit);

// Remove 3 currently checked roles
const { updated, removed } = removeRandomElements(currentlyChecked, 3);

for (const role of removed) {
    await page.locator(`input[id="${role.checkboxId}"]`).uncheck();
}

// Add 3 new random roles not already selected
const availableRoles = flatTreeData.filter(
    role => !updated.find(r => r.checkboxId === role.checkboxId)
);

const threeRolesToAdd = faker.helpers.arrayElements(availableRoles, 3);

for (const role of threeRolesToAdd) {
    await page.locator(`input[id="${role.checkboxId}"]`).check();
}

const editedArr = [...updated, ...threeRolesToAdd];

// Save and Close
await page.getByRole(`button`, { name: `Save and Close` }).click();
await waitUntilLoaded(page);

// Wait for updated role row
await page.waitForSelector(
    `tr:has(td:text-is("${securityRoleNameEdit}"))`,
    { timeout: 15000 }
);

//--------------------------------
// Assert
//--------------------------------

const editedCell = page.getByRole(`gridcell`, {
    name: securityRoleNameEdit,
    exact: true,
});

await expect(editedCell).toBeVisible({ timeout: 15000 });

// Reopen role
await editedCell.dblclick();

// Expand all again (re-render)
await page.getByRole(`button`, { name: `Expand All` }).click();
await waitUntilLoaded(page);

// --- Kendo stable: re-grab tree data ---
flatTreeData = await grabSecurityRoles(page);

// Update checkbox IDs in arrays using latest tree data
updateCheckBoxIdFromFlatTreeData(flatTreeData, editedArr);
updateCheckBoxIdFromFlatTreeData(flatTreeData, removed);

// --- Assert checked roles ---
for (const role of editedArr) {
    const checkbox = page.locator(`input[id="${role.checkboxId}"]`);
    await expect(checkbox).toBeChecked({ timeout: 5000 });
}

// --- Assert removed roles are unchecked ---
for (const role of removed) {
    const checkbox = page.locator(`input[id="${role.checkboxId}"]`);
    await expect(checkbox).not.toBeChecked({ timeout: 5000 });
}
});

 */














/*
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    waitUntilLoaded,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData,
} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';

test('Security Roles - Edit existing role and modify privileges (stable final)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SecRoleIntCRUD`;
    const securityRoleName = `internalTestCRUD`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;

    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
    });

    // Navigate to Security Roles
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Open existing role
    //--------------------------------
    const existingRoleCell = page.getByRole(`gridcell`, {
        name: securityRoleName,
        exact: true,
    });
    await expect(existingRoleCell).toBeVisible({ timeout: 15000 });
    await existingRoleCell.dblclick();

    // Expand all (triggers Kendo re-render)
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Grab current tree data
    let flatTreeData = await grabSecurityRoles(page);

    // Currently checked roles
    const currentlyChecked = flatTreeData.filter(
        role => role.checkboxId && role.checkboxId !== null
    );

    //--------------------------------
    // Helper to remove random elements
    //--------------------------------
    function removeRandomElements(arr, count) {
        if (count >= arr.length) return { updated: [], removed: [...arr] };

        const result = [...arr];
        const removed = [];
        for (let i = 0; i < count; i++) {
            const indexToRemove = Math.floor(Math.random() * result.length);
            const [element] = result.splice(indexToRemove, 1);
            removed.push(element);
        }
        return { updated: result, removed };
    }

    //--------------------------------
    // Act
    //--------------------------------
    // Fill role name AFTER expand
    const roleNameInput = page.locator(`#roleName`);
    await roleNameInput.fill(securityRoleNameEdit);
    await expect(roleNameInput).toHaveValue(securityRoleNameEdit);

    // Remove 3 currently checked roles
    const { updated, removed } = removeRandomElements(currentlyChecked, 3);
    for (const role of removed) {
        await page.locator(`input[id="${role.checkboxId}"]`).uncheck();
    }

    // Add 3 new random roles not already selected
    const availableRoles = flatTreeData.filter(
        role => !updated.find(r => r.checkboxId === role.checkboxId)
    );
    const threeRolesToAdd = faker.helpers.arrayElements(availableRoles, 3);
    for (const role of threeRolesToAdd) {
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    const editedArr = [...updated, ...threeRolesToAdd];

    // Save and Close
    await page.getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);

    // Wait for updated role row
    await page.waitForSelector(
        `tr:has(td:text-is("${securityRoleNameEdit}"))`,
        { timeout: 15000 }
    );

    //--------------------------------
    // Reopen role to assert
    //--------------------------------
    const editedCell = page.getByRole(`gridcell`, {
        name: securityRoleNameEdit,
        exact: true,
    });
    await expect(editedCell).toBeVisible({ timeout: 15000 });
    await editedCell.dblclick();

    // Expand all again (triggers re-render)
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    //--------------------------------
    // Re-grab tree and update checkbox IDs
    //--------------------------------
    flatTreeData = await grabSecurityRoles(page);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, editedArr);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, removed);

    //--------------------------------
    // Assert visual checkbox states (reliable)
    //--------------------------------
    for (const role of editedArr) {
        const checkboxSpan = page.locator(
            `span.k-checkbox-wrap:has(input#${role.checkboxId}) >> span.k-checkbox`
        );
        // `toHaveAttribute` automatically waits for element to appear
        await expect(checkboxSpan).toHaveAttribute('aria-checked', 'true', {
            timeout: 10000,
        });
    }

    for (const role of removed) {
        const checkboxSpan = page.locator(
            `span.k-checkbox-wrap:has(input#${role.checkboxId}) >> span.k-checkbox`
        );
        await expect(checkboxSpan).toHaveAttribute('aria-checked', 'false', {
            timeout: 10000,
        });
    }
});


 */













/*





import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
    waitUntilLoaded,
    grabSecurityRoles,
    updateCheckBoxIdFromFlatTreeData,
} from '../../../../helpers/Node20Helpers.js';
import { logIn } from '../../../../helpers/Node20Helpers.js';

test('Security Roles - Edit existing role and modify privileges', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `SecRoleIntCRUD`;
    const securityRoleName = `internalTestCRUD`;
    const securityRoleNameEdit = `internalTestCRUD-edit`;

    const { page } = await logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
    });

    // Navigate to Security Roles
    await page.getByText(`Tools`).hover();
    await page.getByText(`Users & Roles`).click();
    await page.getByText(`Security Roles`).click();
    await waitUntilLoaded(page);

    // Open existing role
    const roleCell = page.getByRole(`gridcell`, { name: securityRoleName, exact: true });
    await expect(roleCell).toBeVisible({ timeout: 15000 });
    await roleCell.dblclick();

    // Expand all (triggers Kendo re-render)
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Grab current tree
    let flatTreeData = await grabSecurityRoles(page);

    // Currently selected roles (randomSelectRoles from create)
    const randomSelectRoles = flatTreeData.filter(role => role.checkboxId);

    //--------------------------------
    // Helper to remove random elements
    //--------------------------------
    function removeRandomElements(arr, count) {
        if (count >= arr.length) return { updated: [], removed: [...arr] };
        const result = [...arr];
        const removed = [];
        for (let i = 0; i < count; i++) {
            const indexToRemove = Math.floor(Math.random() * result.length);
            const [element] = result.splice(indexToRemove, 1);
            removed.push(element);
        }
        return { updated: result, removed };
    }

    //--------------------------------
    // Act
    //--------------------------------
    // Edit role name
    const roleNameInput = page.locator('#roleName');
    await roleNameInput.fill(securityRoleNameEdit);
    await expect(roleNameInput).toHaveValue(securityRoleNameEdit);

    // Uncheck 3 random roles
    const { updated, removed } = removeRandomElements(randomSelectRoles, 3);
    for (const role of removed) {
        await page.locator(`input[id="${role.checkboxId}"]`).uncheck();
    }

    // Check 3 new random roles
    const availableRoles = flatTreeData.filter(
        role => !updated.find(r => r.checkboxId === role.checkboxId)
    );
    const threeRolesToAdd = faker.helpers.arrayElements(availableRoles, 3);
    for (const role of threeRolesToAdd) {
        await page.locator(`input[id="${role.checkboxId}"]`).check();
    }

    const editedArr = [...updated, ...threeRolesToAdd];

    // Save and Close
    await page.getByRole(`button`, { name: `Save and Close` }).click();
    await waitUntilLoaded(page);

    // Wait for updated role row
    await page.waitForSelector(`tr:has(td:text-is("${securityRoleNameEdit}"))`, { timeout: 15000 });

    //--------------------------------
    // Reopen role to assert
    //--------------------------------
    const editedCell = page.getByRole(`gridcell`, { name: securityRoleNameEdit, exact: true });
    await expect(editedCell).toBeVisible({ timeout: 15000 });
    await editedCell.dblclick();

    // Expand all again
    await page.getByRole(`button`, { name: `Expand All` }).click();
    await waitUntilLoaded(page);

    // Re-grab tree and update checkbox IDs
    flatTreeData = await grabSecurityRoles(page);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, editedArr);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, removed);

    //--------------------------------
    // Assert checkboxes using visible span (aria-checked)
    //--------------------------------
    for (const role of editedArr) {
        const checkboxSpan = page.locator(
            `span.k-checkbox-wrap:has(input#${role.checkboxId}) >> span.k-checkbox`
        );
        await expect(checkboxSpan).toHaveAttribute('aria-checked', 'true', { timeout: 10000 });
    }

    for (const role of removed) {
        const checkboxSpan = page.locator(
            `span.k-checkbox-wrap:has(input#${role.checkboxId}) >> span.k-checkbox`
        );
        await expect(checkboxSpan).toHaveAttribute('aria-checked', 'false', { timeout: 10000 });
    }
});


 */

















import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {waitUntilLoaded, updateCheckBoxIdFromFlatTreeData, logIn, logIn3} from '../../../../helpers/Node20Helpers.js';
import * as helpers from "../../../../helpers/Node20Helpers.js";
import {env} from "../../../../environments/qawolf2.env.js";

//////////////////////////////////////////
// Helper: grab security roles from tree
//////////////////////////////////////////
export async function grabSecurityRoles(page) {
    const rows = await page.locator('tr:has(input[type="checkbox"])').elementHandles();
    const treeData = [];

    for (const row of rows) {
        const checkbox = await row.$('input[type="checkbox"]');
        if (!checkbox) continue;

        const id = await checkbox.getAttribute('id');
        const checked = await checkbox.isChecked();

        // Get visible text from first td
        const label = await row.$eval('td:first-child', el => el.textContent.trim());
        treeData.push({ checkboxId: id, label, checked });
    }

    return treeData;
}

//////////////////////////////////////////
// Helper: remove random elements
//////////////////////////////////////////
function removeRandomElements(arr, count) {
    if (count >= arr.length) return { updated: [], removed: [...arr] };
    const result = [...arr];
    const removed = [];
    for (let i = 0; i < count; i++) {
        const indexToRemove = Math.floor(Math.random() * result.length);
        const [element] = result.splice(indexToRemove, 1);
        removed.push(element);
    }
    return { updated: result, removed };
}

//////////////////////////////////////////
// Test: Edit existing role
//////////////////////////////////////////
test('Security Roles - Edit existing role and modify privileges', async () => {
    //const loginID = 'SecRoleIntCRUD';
    //const loginID = `emailUsers`;
    const securityRoleName = 'internalTestCRUD';
    const securityRoleNameEdit = 'internalTestCRUD-edit';


   // const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    const loginID = 'LoginIdTest1';
    const password = env.DEFAULT_PASSWORD;   // ✅ use env wrapper

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url
    });


    /*
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

     */

    // Navigate
    await page.getByText('Tools').hover();
    await page.getByText('Users & Roles').click();
    await page.getByText('Security Roles').click();
    await waitUntilLoaded(page);

    // Open existing role
    const roleCell = page.getByRole('gridcell', { name: securityRoleName, exact: true });
    await expect(roleCell).toBeVisible({ timeout: 15000 });
    await roleCell.dblclick();

    // Expand all (triggers Kendo re-render)
    await page.getByRole('button', { name: 'Expand All' }).click();
    await waitUntilLoaded(page);

    // Grab current tree
    let flatTreeData = await grabSecurityRoles(page);

    // Pick currently selected roles
    const randomSelectRoles = flatTreeData.filter(r => r.checked);

    // Edit role name
    const roleNameInput = page.locator('#roleName');
    await roleNameInput.fill(securityRoleNameEdit);
    await expect(roleNameInput).toHaveValue(securityRoleNameEdit);

    // Uncheck 3 random roles
    const { updated, removed } = removeRandomElements(randomSelectRoles, 3);
    for (const role of removed) {
        const checkbox = page.locator(`tr:has(td:text-is("${role.label}")) input[type="checkbox"]`);
        await checkbox.uncheck();
    }

    // Check 3 new random roles
    const availableRoles = flatTreeData.filter(r => !updated.find(u => u.checkboxId === r.checkboxId));
    const threeRolesToAdd = faker.helpers.arrayElements(availableRoles, 3);
    for (const role of threeRolesToAdd) {
        const checkbox = page.locator(`tr:has(td:text-is("${role.label}")) input[type="checkbox"]`);
        await checkbox.check();
    }

    const editedArr = [...updated, ...threeRolesToAdd];

    // Save and Close
    await page.getByRole('button', { name: 'Save and Close' }).click();
    await waitUntilLoaded(page);

    // Wait for updated row
    await page.waitForSelector(`tr:has(td:text-is("${securityRoleNameEdit}"))`, { timeout: 15000 });

    // Reopen role to assert
    const editedCell = page.getByRole('gridcell', { name: securityRoleNameEdit, exact: true });
    await editedCell.dblclick();
    await page.getByRole('button', { name: 'Expand All' }).click();
    await waitUntilLoaded(page);

    // Re-grab tree
    flatTreeData = await grabSecurityRoles(page);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, editedArr);
    updateCheckBoxIdFromFlatTreeData(flatTreeData, removed);

    // Assert checked
    for (const role of editedArr) {
        const checkbox = page.locator(`tr:has(td:text-is("${role.label}")) input[type="checkbox"]`);
        await expect(checkbox).toBeChecked({ timeout: 5000 });
    }

    // Assert unchecked
    for (const role of removed) {
        const checkbox = page.locator(`tr:has(td:text-is("${role.label}")) input[type="checkbox"]`);
        await expect(checkbox).not.toBeChecked({ timeout: 5000 });
    }


    await browser.close();

});
