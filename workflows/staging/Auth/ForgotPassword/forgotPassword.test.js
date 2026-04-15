/*
// workflows/staging/ForgotPassword/forgotPassword.test.js
import { test, expect } from '@playwright/test';

// Import helpers
import * as helpers from '../../../helpers/Node20Helpers.js';
import { env } from '../../../environments/staging.env.js';




import { test } from '@playwright/test';
import { Node20Helpers } from '../../../../helpers/Node20Helpers.js';

import { env } from '../../../../environments/staging.env.js';


 */

import { test, expect } from '@playwright/test';
import * as helpers from '../../../../helpers/Node20Helpers.js'; // correct relative path
import { env } from '../../../../environments/staging.env.js';



test('Able to initiate forgot password flow', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = 'ForgotPassUser';
    const email = `chordline+ForgotPassUser@qawolf.email`;

    //--------------------------------
    // Act
    //--------------------------------
    // Launch page without login
    const { page: loginPage } = await helpers.launchWithoutLogin({
        url: env.DEFAULT_URL,
    });

    // Click "Forgot password?" link
    await loginPage.getByRole('link', { name: 'Forgot password?' }).click();

    // Verify Forgot Password page opened
    await expect(loginPage.getByText('Forgot Your Password?')).toBeVisible();
    await expect(loginPage).toHaveURL(/forgot-password/);

    // Enter Login ID and submit
    await loginPage.getByRole('textbox', { name: 'Enter your Login ID' }).fill(loginID);
    await loginPage.getByRole('button', { name: 'Send Instructions' }).click();

    // Verify confirmation message
    await expect(loginPage.getByText(`We've sent you an email to reset your password`)).toBeVisible();

    //--------------------------------
    // Cleanup
    //--------------------------------
    await loginPage.close();
});
