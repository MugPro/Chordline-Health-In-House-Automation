
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/qawolf2.env.js";
import {logIn3} from "../../../../helpers/Node20Helpers.js";


test('AddNewFieldWholeNumber', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'FieldNumber';
    const screenTemplateGroup = 'Medical Review - RF';
    const defaultTemplate = `${screenTemplateGroup} - Default`;
    const copyTemplate = `${defaultTemplate} - Copy`;


    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL_2;

    // Act
    const { page, browser } = await logIn3({
        loginID,
        password,
        url,
        slowMo: 400,
    });

    //--------------------------------
    // Clean up & setup
    //--------------------------------
    await helpers.cleanupScreenTemplateCopy(page, {
        screenTemplateGroup,
        defaultTemplate,
        screenName: copyTemplate,
    });

    await helpers.copyDefaultScreenTemplate(page, {
        screenTemplateGroup,
        defaultTemplate,
    });

    //--------------------------------
    // Create Number field
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Screen Templates').click();
    await page.getByText(screenTemplateGroup).click();

    await page.getByRole('gridcell', { name: copyTemplate }).click();
    await page.getByRole('button', { name: '' }).click();
    await page.getByRole('button', { name: ' Field' }).click();

    await page.getByText('Radio Button').nth(1).click();
    await page
        .getByRole('option', { name: ' Number' })
        .locator('div')
        .click();

    await page.getByRole('button', { name: 'Add', exact: true }).click();

    //--------------------------------
    // Configure field
    //--------------------------------
    await page.getByRole('checkbox', { name: 'Whole Number' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    //--------------------------------
    // Preview
    //--------------------------------
    await page.getByRole('button', { name: 'Preview' }).click();

    //--------------------------------
    // Dialog‑scoped locators (CRITICAL)
    //--------------------------------
    const dialog = page.getByRole('dialog', {
        name: 'Edit Screen - Internal (',
    });

    // ✅ Correct element for numeric inputs (Kendo / spin button)
    const numberInput = dialog.getByRole('spinbutton');

    //--------------------------------
    // Act: Increment
    //--------------------------------
    await dialog.getByLabel('Increase value').click();

    //--------------------------------
    // Assert: value increments to a whole number
    //--------------------------------
    await expect
        .poll(async () => Number(await numberInput.inputValue()))
        .toBeGreaterThan(0);

    //--------------------------------
    // Act: Decrement
    //--------------------------------
    await dialog.getByLabel('Decrease value').click();

    //--------------------------------
    // Assert: value returns to 0
    //--------------------------------
    await expect
        .poll(async () => Number(await numberInput.inputValue()))
        .toBe(0);
});