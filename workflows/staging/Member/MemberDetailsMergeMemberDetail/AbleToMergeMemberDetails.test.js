import { test, expect } from '@playwright/test';

import { faker } from '@faker-js/faker';
import * as dateFns from 'date-fns';

// 🔧 Backward-compatibility shim
faker.address = {
    streetAddress: () => faker.location.streetAddress(),
    city: () => faker.location.city(),
    zipCode: () => faker.location.zipCode(),
    state: () => faker.location.state(),
};

globalThis.npmImports = {
    faker,
    dateFns,
};


import {
    logIn,
    waitUntilLoaded,
    addMember,
} from '../../../../helpers/Node20Helpers.js';

//import { addMember } from '../../../../helpers/MemberHelpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 10;

const pause = (page, ms = FILL_CLICK_PAUSE_MS) =>
    page.waitForTimeout(ms);

const clickAndWait = async (page, locator, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.click();
    await pause(page, ms);
};

const fillAndWait = async (page, locator, value, ms = FILL_CLICK_PAUSE_MS) => {
    await locator.fill(value);
    await pause(page, ms);
};

test(
    'Able to merge member details and retain original member data',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MergeMemDeets`;

        const member = {
            firstName: "QAWMerge",
            lastName: "Deets",
            address1: "742 Duncan Lake",
            city: "Summershire",
            state: "Louisiana",
            zip: "67636",
            country: "United States",
            birthdate: "11/17/2005",
            memberId: `QAW1766099069612`,
        };


        const member2 = {
            firstName: "Bob",
            lastName: "Deets",
            birthdate: "11 17 2005",
            otherAddress1: "43035 Linda Glen",
            otherCity: "Bashirianbury",
            otherState: "Iowa",
            otherZip: "46343-2837",
        };

        //--------------------------------
        // Sign in & setup members
        //--------------------------------
        const { page } = await logIn({ loginID, slowMo: 400 });
        await waitUntilLoaded(page);

        // NOTE:
        // If the original member does not exist, uncomment:
        // await addMember(page, member);

        // Add the second member used for merging
        const member2Deets = await addMember(page, member2);

        //--------------------------------
        // Act: Find Original Member
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Find Member' }),
        );

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Member or Alt. Identifier' }),
            member.memberId,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Search' }),
        );

        await clickAndWait(
            page,
            page.locator('#member-search .member-card-info'),
        );

        //await waitUntilLoaded(page);

        //--------------------------------
        // Merge Member Detail
        //--------------------------------
        await clickAndWait(
            page,
            page.getByRole('button', { name: 'Merge Member Detail' }),
        );

        // Open Old Member selector
        await clickAndWait(
            page,
            page
                .getByLabel('Member Detail Merge')
                .getByRole('button', { name: '...' }),
        );

        await fillAndWait(
            page,
            page.getByRole('textbox', { name: 'Member or Alt. Identifier' }),
            member2Deets.memberId,
        );

        await clickAndWait(
            page,
            page.getByRole('button', { name: '  Search' }),
        );

        await clickAndWait(
            page,
            page.locator('#member-search .member-card-info'),
        );

        //await waitUntilLoaded(page);

        //--------------------------------
        // Confirm Merge
        //--------------------------------
        await clickAndWait(page, page.locator('#save-and-close'));
        await clickAndWait(page, page.getByRole('button', { name: 'Yes' }));

        await waitUntilLoaded(page);

        //--------------------------------
        // Assert: Member name preserved
        //--------------------------------

        /*
        await expect(page.locator('#pers_first_name')).toHaveText(
            member.firstName,
        );
        await expect(page.locator('#pers_last_name')).toHaveText(
            member.lastName,
        );

         */



        await expect(
            page
                .getByLabel(`${member.lastName}, ${member.firstName}`)
                .locator('#pers_first_name')
        ).toHaveText(member.firstName);



        await expect(
            page
                .getByLabel(`${member.lastName}, ${member.firstName}`)
                .locator('#pers_last_name')
        ).toHaveText(member.lastName);






        //--------------------------------
        // Assert: Primary Address retained
        //--------------------------------

        /*
        await expect(page.locator('#pad1_address_1')).toHaveText(
            member.address1,
        );
        await expect(page.locator('#pad1_address_1')).not.toHaveText(
            member2Deets.address1,
        );

         */



        const finalMember = page.getByLabel(
            `${member.lastName}, ${member.firstName}`,
        );

// Primary Address retained
        await expect(
            finalMember.locator('#pad1_address_1')
        ).toHaveText(member.address1);

        await expect(
            finalMember.locator('#pad1_address_1')
        ).not.toHaveText(member2Deets.address1);






/*
        await expect(page.locator('#pad1_city')).toHaveText(member.city);
        await expect(page.locator('#pad1_city')).not.toHaveText(
            member2Deets.city,
        );

 */



        await expect(
            finalMember.locator('#pad1_city')
        ).toHaveText(member.city);

        await expect(
            finalMember.locator('#pad1_city')
        ).not.toHaveText(member2Deets.city);


/*
        await expect(page.locator('#pad1_zip')).toHaveText(member.zip);
        await expect(page.locator('#pad1_zip')).not.toHaveText(
            member2Deets.zip,
        );

 */




        await expect(
            finalMember.locator('#pad1_zip')
        ).toHaveText(member.zip);

        await expect(
            finalMember.locator('#pad1_zip')
        ).not.toHaveText(member2Deets.zip);




        //--------------------------------
        // Assert: Other Address is blank
        //--------------------------------
        /*
        await expect(page.locator('#pad2_address_1')).toHaveText('');
        await expect(page.locator('#pad2_address_1')).not.toHaveText(
            member2Deets.address1,
        );

         */




        await expect(
            finalMember.locator('#pad2_address_1')
        ).toHaveText('');

        await expect(
            finalMember.locator('#pad2_address_1')
        ).not.toHaveText(member2Deets.address1);




/*
        await expect(page.locator('#pad2_city')).toHaveText('');
        await expect(page.locator('#pad2_city')).not.toHaveText(
            member2Deets.city,
        );

 */



        await expect(
            finalMember.locator('#pad2_city')
        ).toHaveText('');

        await expect(
            finalMember.locator('#pad2_city')
        ).not.toHaveText(member2Deets.city);




/*
        await expect(page.locator('#pad2_zip')).toHaveText('');
        await expect(page.locator('#pad2_zip')).not.toHaveText(
            member2Deets.zip,
        );

 */



        await expect(
            finalMember.locator('#pad2_zip')
        ).toHaveText('');

        await expect(
            finalMember.locator('#pad2_zip')
        ).not.toHaveText(member2Deets.zip);


        //--------------------------------
        // No cleanup required
        //--------------------------------
    },
);