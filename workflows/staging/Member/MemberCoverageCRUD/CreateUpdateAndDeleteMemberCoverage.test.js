import { test, expect } from '@playwright/test';
//import dateFns from 'date-fns';
import { format } from 'date-fns';

// 🔧 Match helpers pattern used in your other tests
import {
    logIn,
    waitUntilLoaded,
    cleanupTabOnMembersPage2,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Small helpers to pause after fills/clicks
------------------------------------------- */
const FILL_CLICK_PAUSE_MS = 400;

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

test('Create, Update, and Delete Member Coverage', async () => {
    //--------------------------------
    // Arrange
    //--------------------------------
    const loginID = `CoverageCRUD`;

    const member = {
        name: `Jones, Mark`,
        identifier: `A9876541`,
    };


    /*
    const today = Date.now();

    const coverage = {
        type: `Permanent`,
        memberIdentifier: `QAWINS${Date.now()}`,
        insuranceCompany: `Excellent Health Plan`,
        status: `Primary`,
        subscriberIs: `Self`,
        effectiveDate: dateFns.format(today, 'MM/dd/yyyy'),
    };

     */




    const today = new Date();

    const coverage = {
        type: "Permanent",
        memberIdentifier: `QAWINS${Date.now()}`,
        insuranceCompany: "Excellent Health Plan",
        status: "Primary",
        subscriberIs: "Self",
        effectiveDate: format(today, "MM/dd/yyyy"),
    };











    const tab = `Member Coverage`;
    const gridId = `[id="member-coverage-grid"]`;

    // Login
    const { page } = await logIn({ loginID });


    /*

    // Cleanup (idempotency)
    await cleanupTabOnMembersPage2(page, {
        tab,
        memberName: member.name,
        memberId: member.identifier,
        gridId,
        loginID,
    });

     */

    // Navigate to Members
    await clickAndWait(page, page.getByText(`Home`, { exact: true }));
    await clickAndWait(page, page.locator(`#home-tabs-tab-4`).getByText(`Members`));

    // Search for member
    await fillAndWait(
        page,
        page.getByRole(`textbox`, { name: `Search...` }),
        member.name,
    );

    /*
    await page.keyboard.press(`Enter`);

    await waitUntilLoaded(page);

    // Open member
    await page.getByRole(`gridcell`, { name: member.identifier }).dblclick();
    await waitUntilLoaded(page);

     */











    await page.keyboard.press(`Enter`);
    await waitUntilLoaded(page);

    // Open member
    try {
        await page.getByRole(`gridcell`, { name: member.name }).dblclick();
    } catch {
        await page.getByRole(`gridcell`, { name: member.identifier }).dblclick();
    }

    await waitUntilLoaded(page);










    // Open Member Coverage tab
    await clickAndWait(
        page,
        page.locator(`[role="menuitem"]#member-coverage-menu`),
    );

    //--------------------------------
    // Act: CREATE coverage
    //--------------------------------
    await clickAndWait(page, page.getByRole(`button`, { name: ` Coverage` }));
    await waitUntilLoaded(page);

    await fillAndWait(
        page,
        page.locator(`#pati_member_identifier`),
        coverage.memberIdentifier,
    );

    // Open Insurance Company lookup
    await clickAndWait(
        page,
        page.locator(
            `[data-bind="attr: { class: fields.pati_insurance_company_id.inputClass }"] .lookup-search-button`,
        ),
    );
    await waitUntilLoaded(page);

    // Select insurance company
    await page
        .getByRole(`gridcell`, { name: coverage.insuranceCompany })
        .dblclick();

    await waitUntilLoaded(page);

    await page.getByRole('button', { name: 'select' }).first().click();
    await page.locator('#elco_effective_date').press('Enter');

    // Save
    await clickAndWait(page, page.getByRole(`button`, { name: ` Save` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: CREATE
    //--------------------------------
    await expect(page.locator(`#pati_eligibility_type`)).toContainText(
        coverage.type,
    );

    await expect(page.locator(`#pati_member_identifier`)).toContainText(
        coverage.memberIdentifier,
    );

    await expect(page.locator(`#pati_insurance_company_id`)).toContainText(
        coverage.insuranceCompany,
    );

    await expect(
        page.locator(`#eligibility-child-grid td:nth-of-type(4)`),
    ).toContainText(coverage.effectiveDate);

    //--------------------------------
    // Arrange: EDIT data
    //--------------------------------
    const coverageEdit = {
        type: `Permanent`,
        memberIdentifier: `QAWINS${Date.now()}`,
        insuranceCompany: `Wonderful Health Plan`,
        status: `Primary`,
        subscriberIs: `Self`,
        effectiveDate: coverage.effectiveDate,
    };

    //--------------------------------
    // Act: EDIT coverage
    //--------------------------------
    await clickAndWait(page, page.getByRole(`button`, { name: `Edit` }));
    await waitUntilLoaded(page);

    await fillAndWait(
        page,
        page.locator(`#pati_member_identifier`),
        coverageEdit.memberIdentifier,
    );

    await clickAndWait(
        page,
        page.locator(
            `[data-bind="attr: { class: fields.pati_insurance_company_id.inputClass }"] .lookup-search-button`,
        ),
    );

    await waitUntilLoaded(page);

    await page
        .getByRole(`gridcell`, { name: coverageEdit.insuranceCompany })
        .dblclick();

    await waitUntilLoaded(page);

    await clickAndWait(page, page.getByRole(`button`, { name: ` Save` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: EDIT
    //--------------------------------
    await expect(page.locator(`#pati_eligibility_type`)).toContainText(
        coverageEdit.type,
    );

    await expect(page.locator(`#pati_member_identifier`)).toContainText(
        coverageEdit.memberIdentifier,
    );

    await expect(page.locator(`#pati_insurance_company_id`)).toContainText(
        coverageEdit.insuranceCompany,
    );

    await expect(
        page.locator(`#eligibility-child-grid td:nth-of-type(4)`),
    ).toContainText(coverageEdit.effectiveDate);

    //--------------------------------
    // Act: DELETE coverage
    //--------------------------------
    await clickAndWait(
        page,
        page.getByRole(`button`, { name: ` All Coverages` }),
    );



    await page
        .getByRole(`gridcell`, { name: coverageEdit.memberIdentifier })
        .hover();

    await clickAndWait(
        page,
        page.locator(`[type="button"][title="Delete"]:visible`),
    );

    await clickAndWait(page, page.getByRole(`button`, { name: `Yes` }));
    await waitUntilLoaded(page);

    //--------------------------------
    // Assert: DELETE
    //--------------------------------
    await expect(
        page.locator(
            `${gridId} table tbody tr:has-text("${coverageEdit.memberIdentifier}")`,
        ),
    ).not.toBeVisible();

    await expect(
        page.locator(
            `${gridId} table tbody tr:has-text("${coverage.memberIdentifier}")`,
        ),
    ).not.toBeVisible();

});
