/*
import { test, expect } from '@playwright/test';
import { MailSlurp } from 'mailslurp-client';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('New User Setup fully automated with MailSlurp', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const loginID2 = `NewUserReset`;
    const firstName = `NewUserReset`;
    const lastName = `Qaw`;
    const password = `GhJkML#${Date.now()}`;
    const subject = `Welcome to ACUITYnxt!`;

    // --------- MailSlurp setup ---------
    const mailslurp = new MailSlurp({
        apiKey: 'sk_9eN39YvW0Gg2MtXq_EXUye1g5Hylt5TB8Hu47rLeQEcibQXmcYWEwqRZpvBXkxdWCXRFp4w58pXVu1lOF'
    });const inbox = await mailslurp.createInbox();
    const testEmail = inbox.emailAddress;
    console.log('MailSlurp inbox created:', testEmail);

    // Sign in as admin
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025
    });

    //--------------------------------
    // Act: Open Users & Roles > New User Setup
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'New User Setup' }).click();

    // Wait for modal to appear
    const modal = page.locator('#modal-window-USER0_wnd_title');
    await expect(modal).toBeVisible({ timeout: 30000 });

    // Fill MailSlurp inbox if input exists
    const modalInput = page.locator('#modal-window-USER0_wnd_body input[type="text"]');
    if (await modalInput.count() > 0) {
        await modalInput.fill(testEmail);
    }

    // Click Send immediately
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

    // Wait for success message and click Okay
    const okButton = page.getByRole('button', { name: 'Okay' });
    //await expect(page.getByText('Email was sent successfully.')).toBeVisible({ timeout: 30000 });

    await expect(page.getByText('You cannot reset your own account, so your account was skipped. Other emails were sent successfully.')).toBeVisible({ timeout: 30000 });


    if (await okButton.count() > 0) await okButton.click();

    //--------------------------------
    // Wait for setup email via MailSlurp
    //--------------------------------
    const after = new Date();
    const emailMessage = await mailslurp.waitForLatestEmail({
        inboxId: inbox.id,
        timeout: 30000,
        unreadOnly: true
    });

    const setupLinkMatch = emailMessage.body.match(/https?:\/\/[^\s"]+/);
    const setupLink = setupLinkMatch ? setupLinkMatch[0] : null;
    expect(setupLink).toBeTruthy();
    console.log('Setup link captured:', setupLink);

    //--------------------------------
    // Follow setup link and create password
    //--------------------------------
    const page1 = await browser.newPage();
    await page1.goto(setupLink);

    await expect(page1.getByText('Create Your Password')).toBeVisible();
    await page1.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page1.getByRole('textbox', { name: 'Enter your First Name' }).fill(firstName);
    await page1.getByRole('textbox', { name: 'Enter your Last Name' }).fill(lastName);
    await page1.getByRole('textbox', { name: 'Enter your Email Address' }).fill(testEmail);
    await page1.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
    await page1.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);
    await page1.getByText('Create Password').click();

    await expect(page1.getByText('Your password was created,')).toBeVisible();

    //--------------------------------
    // Sign in as new user
    //--------------------------------
    await page1.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page1.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page1.getByRole('button', { name: 'SIGN IN' }).click();

    await expect(page1.getByText(`${firstName} ${lastName}`)).toBeVisible();
    await expect(page1.locator('#menu-items').getByText('Logout')).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await page1.close();
    await browser.close();
});




 */




















import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('Reset User — Scenario 1 (admin cannot reset own account)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act: Open Users & Roles > Reset User
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();
    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'Reset User' }).click();

    // Click Send
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

    //--------------------------------
    // Assert Scenario 1
    //--------------------------------
    const scenario1Message = page.locator(
        'text=You cannot reset your own account, so your account was skipped. Other emails were sent successfully.'
    );
    await expect(scenario1Message).toBeVisible({ timeout: 30000 });

    // Click Okay if it exists
    const okButton = page.getByRole('button', { name: 'Okay' });
    if (await okButton.count() > 0) await okButton.click();

    console.log('Scenario 1 verified — test ends here.');

    //--------------------------------
    // Cleanup
    //--------------------------------
    await browser.close();
});
