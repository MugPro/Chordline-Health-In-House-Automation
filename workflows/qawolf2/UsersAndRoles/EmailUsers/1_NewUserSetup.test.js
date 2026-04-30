/*import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('New User Setup workflow fully automated', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const loginID2 = `NewUserReset`;
    const firstName = `NewUserReset`;
    const lastName = `Qaw`;
    const email = `chordline+NewUserReset@qawolf.email`;
    const password = `GhJkML#${Date.now()}`;
    const subject = `Welcome to ACUITYnxt!`;

    // Sign in to the app as admin
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act: Open Users & Roles and New User Setup
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();

    // Click "Email Users" toolbar button
    await page.locator('#grid-toolbar-email-users').click();

    // Click "New User Setup" link
    await page.getByRole('link', { name: 'New User Setup' }).click();

    // Verify modal is visible
    const modal = page.locator('#modal-window-USER0_wnd_title');
    await expect(modal).toBeVisible();
    await expect(page.locator('#email-subject')).toHaveValue(subject);



    // Click Send
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

// Wait for spinner to disappear (adjust selector to your app's spinner)
    const spinner = page.locator('#modal-window-USER0_wnd_body .spinner, #modal-window-USER0_wnd_body .loading');
    await spinner.waitFor({ state: 'hidden', timeout: 30000 }); // wait up to 30s

// Optionally click Okay if the success message appears
    const okButton = page.getByRole('button', { name: 'Okay' });
    if (await okButton.count() > 0) {
        await okButton.click();
    }

// Now capture the setup link
    const setupLink = await page.locator('#modal-window-USER0_wnd_body input[type="text"]').inputValue();
    console.log('Setup link captured:', setupLink);






    //--------------------------------
    // Follow the setup link to create password
    //--------------------------------
    const page1 = await browser.newPage();
    await page1.goto(setupLink);

    await expect(page1.getByText('Create Your Password')).toBeVisible();

    await page1.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page1.getByRole('textbox', { name: 'Enter your First Name' }).fill(firstName);
    await page1.getByRole('textbox', { name: 'Enter your Last Name' }).fill(lastName);
    await page1.getByRole('textbox', { name: 'Enter your Email Address' }).fill(email);
    await page1.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
    await page1.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);

    await page1.getByText('Create Password').click();
    await expect(page1.getByText('Your password was created,')).toBeVisible();

    //--------------------------------
    // Sign in as the new user
    //--------------------------------
    await page1.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page1.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page1.getByRole('button', { name: 'SIGN IN' }).click();

    await expect(page1.getByText(`${firstName} ${lastName}`)).toBeVisible();
    await expect(page1.locator('#menu-items').getByText('Logout')).toBeVisible();

    //--------------------------------
    // Optional: verify user now appears in admin table
    //--------------------------------
    await page.reload(); // reload admin page as admin
    await page.getByText('Users & Roles').click();

    const internalTab = page.getByRole('tabpanel', { name: 'Internal' });
    await internalTab.getByPlaceholder('Search...').fill(loginID2);
    await page.locator('#admin-search-button').click();

    await expect(
        page.locator(`[id="browse-grid"] table:has(tr:has-text("${loginID2}")) tr`)
    ).toHaveCount(1); // now the user exists

    //--------------------------------
    // Cleanup
    //--------------------------------
    await page1.close();
    await browser.close();
});


 */















/*


// NewUserSetup.test.js
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('New User Setup workflow (without inbox check)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const loginID2 = `NewUserReset`;
    const firstName = `NewUserReset`;
    const lastName = `Qaw`;
    const email = `chordline+NewUserReset@qawolf.email`;
    const password = `GhJkML#${Date.now()}`;
    const subject = `Welcome to ACUITYnxt!`;

    // Sign in to the app
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();

    const internalTab = page.getByRole('tabpanel', { name: 'Internal' });
    await internalTab.getByPlaceholder('Search...').fill(loginID2);
    await page.locator('#admin-search-button').click();

    await expect(page.locator(`[id="browse-grid"] table:has(tr:has-text("${loginID2}")) tr`)).toHaveCount(1);

    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'New User Setup' }).click();

    await expect(page.locator('#modal-window-USER0_wnd_title')).toBeVisible();
    await expect(page.locator('#email-subject')).toHaveValue(subject);
    await expect(page.getByText('(1 users)')).toBeVisible();

    // Send the email (we cannot check it without an inbox)
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Email was sent successfully.')).toBeVisible();
    await page.getByRole('button', { name: 'Okay' }).click();

    //--------------------------------
    // Optional: simulate clicking the link
    //--------------------------------
    // If you know the URL pattern for the setup page, open it directly:
    // Example:
    await page.goto(`${process.env.DEFAULT_URL_2}/user-setup/${loginID2}`);

    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page.getByRole('textbox', { name: 'Enter your First Name' }).fill(firstName);
    await page.getByRole('textbox', { name: 'Enter your Last Name' }).fill(lastName);
    await page.getByRole('textbox', { name: 'Enter your Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
    await page.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);

    await page.getByText('Create Password').click();
    await expect(page.getByText('Your password was created,')).toBeVisible();

    await page.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible();
    await expect(page.locator('#menu-items').getByText('Logout')).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await browser.close();
});


 */













// NewUserSetup.test.js
import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('New User Setup workflow (without inbox check)', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `emailUsers`;
    const loginID2 = `NewUserReset`;
    const firstName = `NewUserReset`;
    const lastName = `Qaw`;
    const email = `chordline+NewUserReset@qawolf.email`;
    const password = `GhJkML#${Date.now()}`;
    const subject = `Welcome to ACUITYnxt!`;

    // Sign in to the app
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();

    const internalTab = page.getByRole('tabpanel', { name: 'Internal' });
    await internalTab.getByPlaceholder('Search...').fill(loginID2);
    await page.locator('#admin-search-button').click();

    await expect(page.locator(`[id="browse-grid"] table:has(tr:has-text("${loginID2}")) tr`)).toHaveCount(1);

    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'New User Setup' }).click();

    await expect(page.locator('#modal-window-USER0_wnd_title')).toBeVisible();
    await expect(page.locator('#email-subject')).toHaveValue(subject);
    await expect(page.getByText('(1 users)')).toBeVisible();

    // Send the email (we cannot check it without an inbox)
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Email was sent successfully.')).toBeVisible();

    /*
    await page.getByRole('button', { name: 'Okay' }).click();
    await browser.close();

     */
});
























/*
// NewUserSetupWithMailSlurp.test.js
import { test, expect } from '@playwright/test';
import { MailSlurp } from 'mailslurp-client';
import * as helpers from '../../../../helpers/Node20Helpers.js';

test('New User Setup workflow fully automated using MailSlurp inbox', async () => {
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
    });
    const inbox = await mailslurp.createInbox();
    const email = inbox.emailAddress;
    console.log('Temporary inbox created:', email);

    //--------------------------------
    // Sign in as admin
    //--------------------------------
    const { browser, page } = await helpers.logIn({
        url: process.env.DEFAULT_URL_2,
        loginID,
        password: process.env.DEFAULT_PASS_OCT_2025,
    });

    //--------------------------------
    // Act: Open Users & Roles and New User Setup
    //--------------------------------
    await page.getByText('Tools').click();
    await page.getByText('Users & Roles').click();

    await page.locator('#grid-toolbar-email-users').click();
    await page.getByRole('link', { name: 'New User Setup' }).click();

    const modal = page.locator('#modal-window-USER0_wnd_title');
    await expect(modal).toBeVisible();
    await expect(page.locator('#email-subject')).toHaveValue(subject);

    // Fill the email if the input exists, otherwise assume auto-filled
    const modalBodyInput = page.locator('#modal-window-USER0_wnd_body input[type="text"]');
    if (await modalBodyInput.count() > 0) {
        await modalBodyInput.fill(email);
    }

    //--------------------------------
    // Send the email
    //--------------------------------
    const sendButton = page.getByRole('button', { name: 'Send' });
    await sendButton.click();

    // Wait for spinner to disappear
    const spinner = page.locator('#modal-window-USER0_wnd_body .spinner, #modal-window-USER0_wnd_body .loading');
    await spinner.waitFor({ state: 'hidden', timeout: 30000 });

    // Click Okay if success message appears
    const okButton = page.getByRole('button', { name: 'Okay' });
    if (await okButton.count() > 0) {
        await okButton.click();
    }

    // Capture the setup link from the input
    const setupLinkInput = page.locator('#modal-window-USER0_wnd_body input[type="text"]');
    const setupLink = await setupLinkInput.inputValue();
    console.log('Setup link captured:', setupLink);

    //--------------------------------
    // Wait for the email in MailSlurp
    //--------------------------------
    const emailMessage = await mailslurp.waitForLatestEmail({
        inboxId: inbox.id,
        timeout: 30000,
        unreadOnly: true,
    });

    console.log('Email received:', emailMessage.subject);

    //--------------------------------
    // Follow the setup link to create password
    //--------------------------------
    const page1 = await browser.newPage();
    await page1.goto(setupLink);

    await expect(page1.getByText('Create Your Password')).toBeVisible();

    await page1.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page1.getByRole('textbox', { name: 'Enter your First Name' }).fill(firstName);
    await page1.getByRole('textbox', { name: 'Enter your Last Name' }).fill(lastName);
    await page1.getByRole('textbox', { name: 'Enter your Email Address' }).fill(email);
    await page1.getByRole('textbox', { name: 'Enter your New Password', exact: true }).fill(password);
    await page1.getByRole('textbox', { name: 'Re-Enter your New Password' }).fill(password);

    await page1.getByText('Create Password').click();
    await expect(page1.getByText('Your password was created,')).toBeVisible();

    //--------------------------------
    // Sign in as the new user
    //--------------------------------
    await page1.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID2);
    await page1.getByRole('textbox', { name: 'Enter your Password' }).fill(password);
    await page1.getByRole('button', { name: 'SIGN IN' }).click();

    await expect(page1.getByText(`${firstName} ${lastName}`)).toBeVisible();
    await expect(page1.locator('#menu-items').getByText('Logout')).toBeVisible();

    //--------------------------------
    // Optional: verify user now appears in admin table
    //--------------------------------
    await page.reload();
    await page.getByText('Users & Roles').click();
    const internalTab = page.getByRole('tabpanel', { name: 'Internal' });
    await internalTab.getByPlaceholder('Search...').fill(loginID2);
    await page.locator('#admin-search-button').click();

    await expect(
        page.locator(`[id="browse-grid"] table:has(tr:has-text("${loginID2}")) tr`)
    ).toHaveCount(1);

    //--------------------------------
    // Cleanup
    //--------------------------------
    await page1.close();
    await browser.close();
});


 */













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
    await expect(page.getByText('Email was sent successfully.')).toBeVisible({ timeout: 30000 });
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



















