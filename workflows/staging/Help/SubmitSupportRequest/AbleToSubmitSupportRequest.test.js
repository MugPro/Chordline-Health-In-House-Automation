import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';
import { env } from '../../../../environments/staging.env.js';

test('Help → Able to Submit a Support Request modal works', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'HelpSubmitSupportRequest';
    const linkToUse = 'Submit a Support Request';

    // Sign in to the app
    const { page } = await helpers.logIn({ loginID });

    //--------------------------------
    // Act
    //--------------------------------

    // Hover over the "Help" dropdown
    await page.getByText('Help', { exact: true }).hover();

    // Select a specific option from the dropdown menu
    await page.getByText(linkToUse).click();

    // Grab iframe
    const frame = page.frameLocator('iframe');

    //--------------------------------
    // Assert
    //--------------------------------

    // Assert technical support modal appears
    await expect(page.locator('[role="dialog"] :text("Technical Support")')).toBeVisible();

    // Assert "To:" field is autofilled correctly
    await expect(page.getByText('* To: Chordline Tech Support')).toBeVisible();

    // Assert "Subject:" field is marked as required
    await expect(page.locator('.required:has-text("Subject:")')).toBeVisible();

    // Assert "Message:" field is marked as required
    await expect(page.locator('.required:has-text("Message:")')).toBeVisible();

    // Assert subject field is visible and enabled
    await expect(page.locator('[id*="email_subject"]')).toBeEnabled();

    // Assert message input field is visible and enabled
    await expect(frame.locator('[id*="email_message"]')).toBeEnabled();

    // Assert message has a format bar
    await expect(page.locator('[data-role="toolbar"]')).toBeVisible();

    // Assert 'Close' button is visible and enabled
    await expect(page.getByRole('button', { name: ' Close' })).toBeEnabled();

    // Assert 'Send' button is visible but not enabled
    await expect(page.locator('#save-and-close')).toBeVisible();
    await expect(page.locator('#save-and-close')).not.toBeEnabled();

    // Optional: keep browser open for inspection
    //await page.pause();
});
