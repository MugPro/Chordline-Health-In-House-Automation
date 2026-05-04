import { test, expect } from '@playwright/test';

// ✅ Match your helpers location used in prior tests
import {
    logIn, logIn3,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';
import {env} from "../../../../environments/staging.env.js";

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 20;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) => page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test('Search for Member and verify demographic details', async () => {
    //--------------------------------
    // Arrange:
    //--------------------------------
    const loginID = `CreateInternalUser`;
    const lastName = `Bayer`;
    const firstName = `QAWSavanna`;
    const street = `72454 Hodkiewicz Point`;
    const county = ` `;
    const city = ` Nitzscheport`;
    const zipcode = `50452`;
    const state = `Wyoming`;

    const memeber = `${lastName}, ${firstName}`;

    // Sign in to the app
    //const { page } = await logIn({ loginID });

    const password = env.DEFAULT_PASS_OCT_2025;   // ✅ use env wrapper
    const url = env.DEFAULT_URL;





    // Sign in to the app
    const { page, context, browser } = await logIn3({ loginID, password,
        url });



    //--------------------------------
    // Act: Search for Member
    //--------------------------------
    // Click the "Members" tab
    await clickAndWait(
        page,
        page.getByRole('tab', { name: 'Members' }).locator('span'),
    );

    await waitUntilLoaded(page);

    // Focus the Search textbox
    const searchBox = page.getByRole('textbox', { name: 'Search...' });
    await clickAndWait(page, searchBox);

    // Type member name
    await page.keyboard.type(memeber);

    // Press Enter to search
    await page.keyboard.press('Enter');
    await waitUntilLoaded(page);

    // Open member record (double‑click grid cell)
    await page.getByRole('gridcell', { name: memeber }).dblclick();
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: Member Details Page
    //--------------------------------
    // Name

    await expect(page.getByText(firstName, { exact: true })).toBeVisible();

    // Assert that the last name is visible on memeber page
    await expect(page.getByText(lastName, { exact: true })).toBeVisible();

    // Assert that the street is visible on the member page
    await expect(page.getByText(street, { exact: true })).toBeVisible();

    // Assert that the city is visible on the member page
    await expect(page.getByText(city, { exact: true })).toBeVisible();

    // Assert that the state is visible on the member page
    await expect(page.getByText(state, { exact: true })).toBeVisible();

    // Assert that the county is visible on the member page
    await expect(
        page
            .locator(
                `[class*="outerfielddiv"]:has-text("County:"):has-text("${county}")`,
            )
            .first(),
    ).toBeVisible();

    // Assert that the zipcode is visible on the member page
    await expect(page.getByText(zipcode, { exact: true })).toBeVisible();
});
