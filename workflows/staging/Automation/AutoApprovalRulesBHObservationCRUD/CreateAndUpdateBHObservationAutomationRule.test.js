// Filename: CreateAndUpdateBHObservationAutomationRule.test.js

import { test, expect } from '@playwright/test';
import { logIn, waitUntilLoaded } from '../../../../helpers/Node20Helpers.js';
import { faker } from '@faker-js/faker';

// Helper for booleans (avoids faker.datatype.boolean changes across versions)
const randomBool = () => Math.random() < 0.5;

test.describe('BH Observation Automation Rules — Create & Update', () => {
    test('Create a BH Observation rule, verify all fields, update rule, and re-verify', async () => {
        //--------------------------------
        // Arrange:
        //--------------------------------
        const ruleName = faker.lorem.words(3); // FIX: faker.random.words -> faker.lorem.words
        const ruleNameEdited = `${ruleName} - edited`;
        const loginID = `BHObservationCRUDAutoApprovalRules`;
        const ruleType = 'BH Observation';

        // Sign in to the app
        const { page, context, browser } = await logIn({ loginID, slowMo: 500 });

        try {
            //--------------------------------
            // Act:
            //--------------------------------
            // Click `Tools` button
            await page.getByText(`Tools`).click();

            // Click `Automation` button
            await page.getByText(`Automation`, { exact: true }).click();

            // Click `+ New` button
            await page.locator(`#grid-toolbar-new-button-menu`).click();

            // Select rule type
            await page.getByText(ruleType, { exact: true }).click();

            // Fill in `Rule Name` input field
            await page.locator(`#aaru_rule_name`).fill(ruleName);

            // MEMBER:
            // Select Member Must Be Active
            const memberMustBeActive = randomBool(); // FIX
            if (memberMustBeActive) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Member Must Be Active:") input`
                    )
                    .check({ delay: 500, force: true });
            }

            // Select Birth Gender
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_birth_gender_id.inputClass }"] [type="button"]`
                )
                .click();
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allBirthGenderOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedBirthGender = faker.helpers.arrayElement(allBirthGenderOptions); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedBirthGender}"):visible`
                )
                .click();

            // Select Benefit Plan
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Benefit Plan")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allBenefitPlanOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedBenefitPlan = faker.helpers.arrayElement(allBenefitPlanOptions); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedBenefitPlan}"):visible`
                )
                .first()
                .click();

            // Select Age option
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age")`
                )
                .click({ delay: 500 });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allAgeOperatorOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedAgeOperator = faker.helpers.arrayElement(allAgeOperatorOptions); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedAgeOperator}"):visible`
                )
                .click();

            // Fill Age input
            const randomAge = faker.number.int({ min: 18, max: 80 }).toString(); // FIX
            const randomAgeSecond = faker.number.int({ min: 18, max: 80 }).toString(); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                )
                .first()
                .waitFor();
            if (selectedAgeOperator === 'Is between') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=0`
                    )
                    .click();
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=0`
                    )
                    .pressSequentially(randomAge, { delay: 250 });
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=1`
                    )
                    .click();
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=1`
                    )
                    .pressSequentially(randomAgeSecond, { delay: 250 });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                    .click();
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                    .pressSequentially(randomAge, { delay: 250 });
            }

            // Select Insurance Company
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Insurance Company")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allInsuranceCompanyOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedInsuranceCompany = faker.helpers.arrayElement(
                allInsuranceCompanyOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedInsuranceCompany}"):visible`
                )
                .first()
                .click();

            // Select "Deceased" option
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label`
                )
                .first()
                .waitFor();
            const allDeceasedOptions = await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label`
                )
                .allInnerTexts();
            const selectedDeceased = faker.helpers.arrayElement(allDeceasedOptions); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label:has-text("${selectedDeceased}"):visible`
                )
                .click();

            // FACILITY
            // Select Cards
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has(:text-is("Cards:")) input`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="option"]:visible`).first().waitFor();
            const allCardOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedCard = faker.helpers.arrayElement(allCardOptions); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedCard}"):visible`
                )
                .click();

            // Select "Member's PCP"
            const memberPCP = randomBool(); // FIX
            if (memberPCP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .check();
            }

            // Select "In Member's Network"
            const inMemberNetwork = randomBool(); // FIX
            if (inMemberNetwork) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .check({ delay: 500, force: true });
            }

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class*="formSection columns"]:has-text("Member") :has-text("Network Status") button:visible`
                )
                .first()
                .click();

            // Click `Preferred` from dropdown menu
            await page.getByRole(`option`, { name: `Preferred` }).locator(`span`).click();

            // Select Specialties
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Specialties")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allSpecialtiesOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedSpecialties = faker.helpers.arrayElement(allSpecialtiesOptions); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedSpecialties}"):visible`
                )
                .click();

            // ADMITTING PROVIDER:
            // Select a Card
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Cards:") input`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allAPCardOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedAPCard = faker.helpers.arrayElement(allAPCardOptions); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedAPCard}"):visible`
                )
                .click();

            // Select "Member's PCP"
            const memberAPPCP = randomBool(); // FIX
            if (memberAPPCP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .check({ delay: 500, force: true });
            }

            // Select "In Member's Network:"
            const inMembersNetworkAP = randomBool(); // FIX
            if (inMembersNetworkAP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .check();
            }

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class*="formSection columns"]:has-text("Admitting Provider")[class*="formSection columns"]:has-text("Member") :has-text("Network Status") button:visible`
                )
                .first()
                .click({ delay: 500 });

            // Click `Preferred` from dropdown menu
            await page.getByRole(`option`, { name: `Preferred` }).locator(`span`).click();

            // Select Specialties
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Specialties")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allAPSpecialtiesOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedAPSpecialties = faker.helpers.arrayElement(
                allAPSpecialtiesOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedAPSpecialties}"):visible`
                )
                .click();
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedAPSpecialties}")`
                )
                .waitFor({ timeout: 5000 });

            // OTHER PROVIDER:
            // Select Provider Role
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_provider_other_role_id.inputClass }"] [type="button"]`
                )
                .click();
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allOPProviderRoleOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedOPProviderRole = faker.helpers.arrayElement(
                allOPProviderRoleOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedOPProviderRole}"):visible`
                )
                .click();

            // Select "In Member's Network"
            const inMemberNetworkOP = randomBool(); // FIX
            if (inMemberNetworkOP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .check({ delay: 500, force: true });
            }

            // Select "Member's PCP"
            const memberPCPOP = randomBool(); // FIX
            if (memberPCPOP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .check({ delay: 500, force: true });
            }

            // Select Cards
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has(:text-is("Cards:")) input`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allCardOptionsOP = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            console.log(allCardOptionsOP);
            const selectedCardOP = faker.helpers.arrayElement(allCardOptionsOP); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedCardOP}"):visible`
                )
                .click({ timeout: 5000 });

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Network Status") button:visible`
                )
                .first()
                .click();

            // Click `Preferred` from dropdown menu
            await page
                .locator(`[role="region"] [role="option"] :text-is("Preferred"):visible`)
                .click();

            // Select Specialties
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Specialties")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allSpecialtiesOPOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedSpecialtiesOP = faker.helpers.arrayElement(
                allSpecialtiesOPOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedSpecialtiesOP}"):visible`
                )
                .click();

            // BED DAYS:
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Service Request Type")`
                    )
                    .click();
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allServiceReqTypeOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedServiceReqType = faker.helpers.arrayElement(
                allServiceReqTypeOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedServiceReqType}"):visible`
                )
                .click();

            // Select Request Type
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type") label`
                )
                .first()
                .waitFor();
            const allRequestTypeOptions = await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type") label`
                )
                .allInnerTexts();
            const selectedRequestType = faker.helpers.arrayElement(
                allRequestTypeOptions
            ); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type") label:has-text("${selectedRequestType}"):visible`
                )
                .click();

            // Select Requested Bed Level
            let selectedRequestedBedLevel = [];
            if (selectedRequestType === 'Bed Day') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Bed Level")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor();
                const allRequestedBedLevelOptions = await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .allInnerTexts();
                let selectedRequestedBedLevel1 = faker.helpers.arrayElement(
                    allRequestedBedLevelOptions
                ); // FIX
                await page
                    .locator(
                        `[role="region"] [role="option"] :text-is("${selectedRequestedBedLevel1}"):visible`
                    )
                    .click();
                selectedRequestedBedLevel.push(selectedRequestedBedLevel1);
            }
            selectedRequestedBedLevel = selectedRequestedBedLevel[0];

            // Select Requested Code
            let selectedRequestedCode = [];
            if (selectedRequestType === 'Code') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Code")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor();
                const allRequestedCodeOptions = await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .allInnerTexts();
                let selectedRequestedCode1 = faker.helpers.arrayElement(
                    allRequestedCodeOptions
                ); // FIX
                await page
                    .locator(
                        `[role="region"] [role="option"] :text-is("${selectedRequestedCode1}"):visible`
                    )
                    .click();
                selectedRequestedCode.push(selectedRequestedCode1);
            }
            selectedRequestedCode = selectedRequestedCode[0];

            // Select Diagnosis Code
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Diagnosis Code")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allDiagnosisCodeOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedDiagnosisCode = faker.helpers.arrayElement(
                allDiagnosisCodeOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedDiagnosisCode}"):visible`
                )
                .click();

            // Input Max Requested Units
            const maxReqUnits = faker.number.int({ min: 1, max: 100 }).toString(); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
                .waitFor();
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
                .click();
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
                .pressSequentially(maxReqUnits, { delay: 250 });

            // Select Max Requested Unit Type
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units") span[role="button"]`
                )
                .last()
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allMaxReqUnitTypeOptions = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedMaxReqUnitType = faker.helpers.arrayElement(
                allMaxReqUnitTypeOptions
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedMaxReqUnitType}"):visible`
                )
                .click();

            // Click `Save and close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();

            // Fill in `Search` input field
            await page
                .getByRole(`dialog`, { name: `Manage Automation` })
                .getByPlaceholder(`Search...`)
                .fill(ruleName);

            // Click `Search` button
            await page.locator(`#admin-search-button`).click();

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert newly created rule name
            await expect(
                page.getByRole(`gridcell`, { name: ruleName, exact: true })
            ).toBeVisible();

            // Assert newly created rule `Authorization Type`
            const authType = await page.locator(`tr td:nth-of-type(5)`).innerText();
            expect(authType).toBe('OBS-BH');

            // Click newly created rule name
            await page.getByRole(`gridcell`, { name: ruleName }).click();

            // Click `Edit` rule
            await page.getByRole(`button`, { name: `` }).click();

            // MEMBER:
            // Assert Member Must Be Active
            if (memberMustBeActive) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Member Must Be Active:") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert network status is correct
            await expect(
                page.locator(`[name="aaru_provider_1_network_status_id_input"]`)
            ).toHaveValue(`Preferred`);

            // Assert that Birth Gender is correct
            await expect(page.locator(`#aaru_birth_gender_id`)).toHaveText(
                selectedBirthGender
            );

            // Assert Benefit Plan
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Benefit Plan") span:text-is("${selectedBenefitPlan}")`
                )
            ).toBeVisible();

            // Assert Age operator
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") span[class*="input-value-text"]`
                )
            ).toHaveText(selectedAgeOperator);

            // Assert Age
            if (selectedAgeOperator === 'Is between') {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=0`
                    )
                ).toHaveValue(randomAge);
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=1`
                    )
                ).toHaveValue(randomAgeSecond);
            } else {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                ).toHaveValue(randomAge);
            }

            // Assert Insurance Company
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Insurance Company") span:text-is("${selectedInsuranceCompany}")`
                )
            ).toBeVisible();

            // Assert Deceased
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label:has-text("${selectedDeceased}"):visible`
                )
            ).toBeChecked();

            // Facility
            // Assert Cards
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Cards") span:text-is("${selectedCard}")`
                )
            ).toBeVisible();

            // Assert In Member's Network
            if (inMemberNetwork) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("In Member's Network") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Network Status
            await expect(page.locator(`#aaru_provider_1_network_status_id`)).toHaveText(
                `Preferred`
            );

            // Assert Specialties
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedSpecialties}")`
                )
            ).toBeVisible();

            // ADMITTING PROVIDER:
            // Assert Cards
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Cards") span:text-is("${selectedAPCard}")`
                )
            ).toBeVisible();

            // Assert Member's PCP
            if (memberAPPCP) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Member's PCP") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert In Member's Network
            if (inMembersNetworkAP) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("In Member's Network") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Network Status
            await expect(page.locator(`#aaru_provider_1_network_status_id`)).toHaveText(
                `Preferred`
            );

            // Assert Specialties
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedAPSpecialties}")`
                )
            ).toBeVisible();

            // OTHER PROVIDER:
            // Assert Provider role
            await expect(page.locator(`#aaru_provider_other_role_id`)).toHaveText(
                selectedOPProviderRole
            );

            // Assert In Member's Network
            if (inMemberNetworkOP) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("In Member's Network") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Member's PCP
            if (memberPCPOP) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Member's PCP") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Cards
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Cards") span:text-is("${selectedCardOP}")`
                )
            ).toBeVisible();

            // Assert Network Status
            await expect(page.locator(`#aaru_provider_other_network_status_id`)).toHaveText(
                `Preferred`
            );

            // Assert Specialties
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedSpecialtiesOP}")`
                )
            ).toBeVisible();

            // BED DAYS:
            // Assert Service Request Type
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Service Request Type") span:text-is("${selectedServiceReqType}")`
                )
            ).toBeVisible();

            // Assert Request Type
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type:") label:has-text("${selectedRequestType}"):visible`
                )
            ).toBeChecked();

            // Assert Max Requested Units:
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
            ).toHaveValue(maxReqUnits, { timeout: 5000 });

            // Assert Max Requested Unit Type:
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") span[class*="input-value"]`
                )
            ).toHaveText(selectedMaxReqUnitType);

            // Assert Diagnosis Code
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Diagnosis Code") span:text-is("${selectedDiagnosisCode}")`
                )
            ).toBeVisible();

            // Assert Requested Bed Level
            if (selectedRequestType === 'Bed Day') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Bed Level")`
                    )
                    .scrollIntoViewIfNeeded({ timeout: 5000 });
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Bed Level") span:text-is("${selectedRequestedBedLevel}")`
                    )
                ).toBeVisible({ timeout: 5000 });
            }

            // Assert Requested Requested Code
            if (selectedRequestType === 'Code') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Code") span:text-is("${selectedRequestedCode}")`
                    )
                    .scrollIntoViewIfNeeded({ timeout: 5000 });
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Code") span:text-is("${selectedRequestedCode}")`
                    )
                ).toBeVisible();
            }

            //--------------------------------
            // Arrange:
            //--------------------------------
            // Remove all options with an "X"
            await page.locator(`[title="delete"]`).first().waitFor();
            await expect(async () => {
                try {
                    await expect(page.locator(`[title="delete"]`).first()).not.toBeVisible({
                        timeout: 1000
                    });
                } catch {
                    await page.locator(`[title="delete"]`).first().waitFor({ timeout: 3000 });

                    // Click delete button
                    await page.locator(`[title="delete"]`).first().click();

                    // Verify no more delete buttons
                    await expect(page.locator(`[title="delete"]`).first()).not.toBeVisible({
                        timeout: 1000
                    });
                }
            }).toPass({ timeout: 2 * 60 * 1000 });

            //--------------------------------
            // Act:
            //--------------------------------
            // Fill in `Rule name` input field
            await page.locator(`#aaru_rule_name`).fill(ruleNameEdited);
            await waitUntilLoaded(page);

            // MEMBER:
            // Select Member Must Be Active
            const memberMustBeActive2 = randomBool(); // FIX
            if (memberMustBeActive2) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Member Must Be Active:") input`
                    )
                    .check({ delay: 500, force: true });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Member Must Be Active:") input`
                    )
                    .uncheck({ delay: 500, force: true });
            }

            // Select Birth Gender
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_birth_gender_id.inputClass }"] [type="button"]`
                )
                .click();
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allBirthGenderOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedBirthGender2 = faker.helpers.arrayElement(
                allBirthGenderOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedBirthGender2}"):visible`
                )
                .click();

            // Select Benefit Plan
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Benefit Plan")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allBenefitPlanOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedBenefitPlan2 = faker.helpers.arrayElement(
                allBenefitPlanOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedBenefitPlan2}"):visible`
                )
                .first()
                .click();

            // Select Age option
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age")`
                )
                .click({ delay: 500 });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allAgeOperatorOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedAgeOperator2 = faker.helpers.arrayElement(
                allAgeOperatorOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedAgeOperator2}"):visible`
                )
                .click();

            // Clear Age input
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                    .first()
                    .clear();
                await expect(
                    page
                        .locator(
                            `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                        )
                        .first()
                ).toBeEmpty({ timeout: 1500 });
            }).toPass({ timeout: 30 * 1000 });

            // Fill Age input
            const randomAge2 = faker.number.int({ min: 18, max: 80 }).toString(); // FIX
            const randomAge2Second = faker.number.int({ min: 18, max: 80 }).toString(); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                )
                .first()
                .waitFor();
            if (selectedAgeOperator2 === 'Is between') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=0`
                    )
                    .click();
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=0`
                    )
                    .pressSequentially(randomAge2, { delay: 250 });
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=1`
                    )
                    .click();
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=1`
                    )
                    .pressSequentially(randomAge2Second, { delay: 250 });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                    .click();
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                    .pressSequentially(randomAge2, { delay: 250 });
            }

            // Select Insurance Company
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Insurance Company")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allInsuranceCompanyOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedInsuranceCompany2 = faker.helpers.arrayElement(
                allInsuranceCompanyOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedInsuranceCompany2}"):visible`
                )
                .first()
                .click();

            // Select "Deceased" option
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label`
                )
                .first()
                .waitFor();
            const allDeceasedOptions2 = await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label`
                )
                .allInnerTexts();
            const selectedDeceased2 = faker.helpers.arrayElement(
                allDeceasedOptions2
            ); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label:has-text("${selectedDeceased2}"):visible`
                )
                .click();

            // FACILITY
            // Select Cards
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has(:text-is("Cards:")) input`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allCardOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedCard2 = faker.helpers.arrayElement(allCardOptions2); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedCard2}"):visible`
                )
                .click();

            // Select "Member's PCP"
            const memberPCP2 = randomBool(); // FIX
            if (memberPCP2) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .check();
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .uncheck();
            }

            // Select "In Member's Network"
            const inMemberNetwork2 = randomBool(); // FIX
            if (inMemberNetwork2) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .check({ delay: 500, force: true });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .uncheck({ delay: 500, force: true });
            }

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class*="formSection columns"]:has-text("Member") :has-text("Network Status") button:visible`
                )
                .first()
                .click();

            // Click `Preferred` from dropdown menu
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_provider_1_network_status_id.inputClass }"] [role="button"]`
                )
                .first()
                .click();
            await page
                .locator(`input[name="aaru_provider_1_network_status_id_input"]`)
                .fill(`Preferred`);
            await page.getByRole(`option`, { name: `Preferred` }).locator(`span`).click();

            // Select Specialties
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Specialties")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allSpecialtiesOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedSpecialties2 = faker.helpers.arrayElement(
                allSpecialtiesOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedSpecialties2}"):visible`
                )
                .click();

            // ADMITTING PROVIDER:
            // Select a Card
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Cards:") input`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allAPCardOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedAPCard2 = faker.helpers.arrayElement(allAPCardOptions2); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedAPCard2}"):visible`
                )
                .click();

            // Select "Member's PCP"
            const memberAPPCP2 = randomBool(); // FIX
            if (memberAPPCP2) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .check({ delay: 500, force: true });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .uncheck({ delay: 500, force: true });
            }

            // Select "In Member's Network:"
            const inMembersNetworkAP2 = randomBool(); // FIX
            if (inMembersNetworkAP2) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .check();
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .uncheck();
            }

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class*="formSection columns"]:has-text("Admitting Provider")[class*="formSection columns"]:has-text("Member") :has-text("Network Status") button:visible`
                )
                .first()
                .click({ delay: 500 });

            // Click `Preferred` from dropdown menu
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_provider_other_network_status_id.inputClass }"] [type="button"]`
                )
                .click();
            await page.getByRole(`option`, { name: `Preferred` }).locator(`span`).click();

            // Select Specialties
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Specialties")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allAPSpecialtiesOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedAPSpecialties2 = faker.helpers.arrayElement(
                allAPSpecialtiesOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedAPSpecialties2}"):visible`
                )
                .click();
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedAPSpecialties2}")`
                )
                .waitFor({ timeout: 5000 });

            // OTHER PROVIDER:
            // Select Provider Role
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_provider_other_role_id.inputClass }"] [type="button"]`
                )
                .click();
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allOPProviderRoleOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedOPProviderRole2 = faker.helpers.arrayElement(
                allOPProviderRoleOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedOPProviderRole2}"):visible`
                )
                .click();

            // Select "In Member's Network"
            const inMemberNetwork2OP = randomBool(); // FIX
            if (inMemberNetwork2OP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .check({ delay: 500, force: true });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("In Member's Network:") input`
                    )
                    .uncheck({ delay: 500, force: true });
            }

            // Select "Member's PCP"
            const memberPCP2OP = randomBool(); // FIX
            if (memberPCP2OP) {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .check({ delay: 500, force: true });
            } else {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Member's PCP:") input`
                    )
                    .uncheck({ delay: 500, force: true });
            }

            // Select Cards
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has(:text-is("Cards:")) input`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allCardOptions2OP = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            console.log(allCardOptions2OP);
            const selectedCard2OP = faker.helpers.arrayElement(allCardOptions2OP); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedCard2OP}"):visible`
                )
                .click({ timeout: 5000 });

            // Click `Network Status` chevron down
            await page
                .locator(
                    `[role="dialog"] [class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Network Status") button:visible`
                )
                .first()
                .click();

            // Click `Preferred` from dropdown menu
            await page
                .locator(
                    `[data-bind="attr: { class: fields.aaru_provider_other_network_status_id.inputClass }"] [role="button"]`
                )
                .first()
                .click();
            await page
                .locator(`input[name="aaru_provider_other_network_status_id_input"]`)
                .fill(`Preferred`);
            await page
                .locator(`[role="region"] [role="option"] :text-is("Preferred"):visible`)
                .click();

            // Select Specialties
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Specialties")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 2500 });
            }).toPass({ timeout: 30 * 1000 });
            const allSpecialtiesOPOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedSpecialties2OP = faker.helpers.arrayElement(
                allSpecialtiesOPOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedSpecialties2OP}"):visible`
                )
                .click();

            // BED DAYS:
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Service Request Type")`
                    )
                    .click();
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor({ timeout: 3500 });
            }).toPass({ timeout: 15 * 1000 });
            const allServiceReqTypeOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedServiceReqType2 = faker.helpers.arrayElement(
                allServiceReqTypeOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedServiceReqType2}"):visible`
                )
                .click();

            // Select Request Type
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type") label`
                )
                .first()
                .waitFor();
            const allRequestTypeOptions2 = await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type") label`
                )
                .allInnerTexts();
            const selectedRequestType2 = faker.helpers.arrayElement(
                allRequestTypeOptions2
            ); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type") label:has-text("${selectedRequestType2}"):visible`
                )
                .click();

            // Select Requested Bed Level
            let selectedRequestedBedLevel2;
            if (selectedRequestType2 === 'Bed Day') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Bed Level")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor();
                const allRequestedBedLevelOptions2 = await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .allInnerTexts();
                selectedRequestedBedLevel2 = faker.helpers.arrayElement(
                    allRequestedBedLevelOptions2
                ); // FIX
                await page
                    .locator(
                        `[role="region"] [role="option"] :text-is("${selectedRequestedBedLevel2}"):visible`
                    )
                    .click();
            }

            // Select Requested Code
            let selectedRequestedCode2;
            if (selectedRequestType2 === 'Code') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Code")`
                    )
                    .click({ delay: 500, force: true });
                await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .first()
                    .waitFor();
                const allRequestedCodeOptions2 = await page
                    .locator(`[role="region"] [role="option"]:visible`)
                    .allInnerTexts();
                selectedRequestedCode2 = faker.helpers.arrayElement(
                    allRequestedCodeOptions2
                ); // FIX
                await page
                    .locator(
                        `[role="region"] [role="option"] :text-is("${selectedRequestedCode2}"):visible`
                    )
                    .click();
            }

            // Select Diagnosis Code
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Diagnosis Code")`
                )
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allDiagnosisCodeOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedDiagnosisCode2 = faker.helpers.arrayElement(
                allDiagnosisCodeOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedDiagnosisCode2}"):visible`
                )
                .click();

            // Clear Max Requested Units
            await expect(async () => {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                    )
                    .clear();
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                    )
                ).toBeEmpty({ timeout: 1500 });
            }).toPass({ timeout: 30 * 1000 });

            // Input Max Requested Units
            const maxReqUnits2 = faker.number.int({ min: 1, max: 100 }).toString(); // FIX
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
                .waitFor();
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
                .click();
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
                .pressSequentially(maxReqUnits2, { delay: 250 });

            // Select Max Requested Unit Type
            await page
                .locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units") span[role="button"]`
                )
                .last()
                .click({ delay: 500, force: true });
            await page.locator(`[role="region"] [role="option"]:visible`).first().waitFor();
            const allMaxReqUnitTypeOptions2 = await page
                .locator(`[role="region"] [role="option"]:visible`)
                .allInnerTexts();
            const selectedMaxReqUnitType2 = faker.helpers.arrayElement(
                allMaxReqUnitTypeOptions2
            ); // FIX
            await page
                .locator(
                    `[role="region"] [role="option"] :text-is("${selectedMaxReqUnitType2}"):visible`
                )
                .click();

            // Click `Save and close` button
            await page.getByRole(`button`, { name: ` Save and Close` }).click();
            await waitUntilLoaded(page);

            //--------------------------------
            // Assert:
            //--------------------------------
            // Assert newly created rule name
            await expect(
                page.getByRole(`gridcell`, { name: ruleNameEdited })
            ).toBeVisible();

            // Assert newly created rule `Authorization Type` is the same
            const authType2 = await page.locator(`tr td:nth-of-type(5)`).innerText();
            expect(authType2).toBe('OBS-BH');

            // Click newly created rule name (FIX to click edited name)
            await page.getByRole(`gridcell`, { name: ruleNameEdited }).click();

            // Click `Edit` rule
            await page.getByRole(`button`, { name: `` }).click();

            // MEMBER:
            // Assert Member Must Be Active
            if (memberMustBeActive2) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Member Must Be Active:") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert network status is correct
            await expect(
                page.locator(`[name="aaru_provider_1_network_status_id_input"]`)
            ).toHaveValue(`Preferred`);

            // Assert that Birth Gender is correct
            await expect(page.locator(`#aaru_birth_gender_id`)).toHaveText(
                selectedBirthGender2
            );

            // Assert Benefit Plan
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Benefit Plan") span:text-is("${selectedBenefitPlan2}")`
                )
            ).toBeVisible();

            // Assert Age operator
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") span[class*="input-value-text"]`
                )
            ).toHaveText(selectedAgeOperator2);

            // Assert Age
            if (selectedAgeOperator2 === 'Is between') {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=0`
                    )
                ).toHaveValue(randomAge2);
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible >> nth=1`
                    )
                ).toHaveValue(randomAge2Second);
            } else {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Age") input:visible`
                    )
                ).toHaveValue(randomAge2);
            }

            // Assert Insurance Company
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Insurance Company") span:text-is("${selectedInsuranceCompany2}")`
                )
            ).toBeVisible();

            // Assert Deceased
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Member") [class*="outerfield"]:has-text("Deceased") label:has-text("${selectedDeceased2}"):visible`
                )
            ).toBeChecked();

            // FACILITY:
            // Assert Cards
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Cards") span:text-is("${selectedCard2}")`
                )
            ).toBeVisible();

            // Assert In Member's Network
            if (inMemberNetwork2) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("In Member's Network") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Network Status
            await expect(page.locator(`#aaru_provider_1_network_status_id`)).toHaveText(
                `Preferred`
            );

            // Assert Specialties
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Facility") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedSpecialties2}")`
                )
            ).toBeVisible();

            // ADMITTING PROVIDER:
            // Assert Cards
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Cards") span:text-is("${selectedAPCard2}")`
                )
            ).toBeVisible();

            // Assert Member's PCP
            if (memberAPPCP2) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Member's PCP") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert In Member's Network
            if (inMembersNetworkAP2) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("In Member's Network") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Network Status
            await expect(page.locator(`#aaru_provider_2_network_status_id`)).toHaveText(
                `Preferred`
            );

            // Assert Specialties
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Admitting Provider") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedAPSpecialties2}")`
                )
            ).toBeVisible();

            // OTHER PROVIDER:
            // Assert Provider role
            await expect(page.locator(`#aaru_provider_other_role_id`)).toHaveText(
                selectedOPProviderRole2
            );

            // Assert In Member's Network
            if (inMemberNetwork2OP) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("In Member's Network") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Member's PCP
            if (memberPCP2OP) {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Member's PCP") [type="checkbox"]`
                    )
                ).toBeChecked();
            }

            // Assert Cards
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Cards") span:text-is("${selectedCard2OP}")`
                )
            ).toBeVisible();

            // Assert Network Status
            await expect(page.locator(`#aaru_provider_other_network_status_id`)).toHaveText(
                `Preferred`
            );

            // Assert Specialties
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Other Provider") [class*="outerfield"]:has-text("Specialties") span:text-is("${selectedSpecialties2OP}")`
                )
            ).toBeVisible();

            // BED DAYS:
            // Assert Service Request Type
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Service Request Type") span:text-is("${selectedServiceReqType2}")`
                )
            ).toBeVisible();

            // Assert Request Type
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Request Type:") label:has-text("${selectedRequestType2}"):visible`
                )
            ).toBeChecked();

            // Assert Max Requested Units:
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") input:visible`
                )
            ).toHaveValue(maxReqUnits2, { timeout: 5000 });

            // Assert Max Requested Unit Type:
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Max Requested Units:") span[class*="input-value"]`
                )
            ).toHaveText(selectedMaxReqUnitType2);

            // Assert Diagnosis Code
            await expect(
                page.locator(
                    `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Diagnosis Code") span:text-is("${selectedDiagnosisCode2}")`
                )
            ).toBeVisible();

            // Assert Requested Bed Level
            if (selectedRequestType2 === 'Bed Day') {
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Bed Level") span:text-is("${selectedRequestedBedLevel2}")`
                    )
                ).toBeVisible({ timeout: 3000 });
            }

            // Assert Requested Requested Code
            if (selectedRequestType2 === 'Code') {
                await page
                    .locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Code") span:text-is("${selectedRequestedCode2}")`
                    )
                    .scrollIntoViewIfNeeded();
                await expect(
                    page.locator(
                        `[class*="formSection columns"]:has-text("Bed Days") [class*="outerfield"]:has-text("Requested Code") span:text-is("${selectedRequestedCode2}")`
                    )
                ).toBeVisible();
            }
        } finally {
            // Cleanup resources
            await context.close();
            await browser.close();
        }
    });
});