import { test, expect } from '@playwright/test';

import {
    logIn,
    waitUntilLoaded,
} from '../../../../helpers/Node20Helpers.js';

/* -------------------------------------------
   Utilities
------------------------------------------- */
function parseMemberLine(raw) {
    // Normalize input for consistent parsing
    const text = String(raw || '')
        .replace(/\u00A0/g, ' ') // NBSP -> space
        .replace(/\r/g, '') // drop CR
        .replace(/\s*\|\s*/g, ' | ') // normalize pipes
        .replace(/[ \t]+/g, ' ') // collapse whitespace
        .replace(/\n+/g, '\n') // collapse blank lines
        .trim();

    // Labels that can follow a value; used to stop greedy matches
    const NEXT = [
        'Insurance\\s*Company:',
        'Member\\s*Identifier:',
        'Language:',
        'Birthdate:',
        'Gender',
        'Address:',
        'H:',
        'C:',
        'Email:',
        'PCP\\s*Information:',
        'Pharmacy:',
        'Programs\\s*Enrolled:',
    ].join('|');

    const stopAtNext = new RegExp(`(?=\\s*(?:${NEXT})|\\s*\\||$)`, 'i');

    const pick = (re, group = 1) => {
        const m = text.match(re);
        return m ? m[group].trim() : null;
    };

    const pickPhone = (label) =>
        pick(new RegExp(`\\b${label}\\s*:\\s*([+()\\d\\-\\s]+)`, 'i'));

    // Address may span lines; capture until next known label/pipe/eos
    const rawAddress = pick(
        new RegExp(`Address:\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
    );
    const address = rawAddress
        ? rawAddress
            .replace(/\n/g, ' ')
            .replace(/\s*,\s*/g, ', ')
            .replace(/\s+/g, ' ')
            .replace(/\s,(\s|$)/g, '$1')
            .trim()
        : null;

    // PCP Information: "Name; phone; email" (any may be missing)
    const pcpBlock = pick(
        new RegExp(`PCP\\s*Information:\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
    );
    let pcp = { name: null, phone: null, email: null };
    if (pcpBlock) {
        const parts = pcpBlock
            .split(/\s*;\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
        const phoneRe = /^[+()\- \d]+$/;
        const emailRe = /@/;
        for (const part of parts) {
            if (!pcp.email && emailRe.test(part)) {
                pcp.email = part;
                continue;
            }
            if (!pcp.phone && phoneRe.test(part)) {
                pcp.phone = part;
                continue;
            }
            if (!pcp.name) {
                pcp.name = part;
            }
        }
    }

    // Pharmacy: "Name; phone"
    const pharmacyBlock = pick(
        new RegExp(`Pharmacy:\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
    );
    let pharmacy = null;
    if (pharmacyBlock) {
        const parts = pharmacyBlock
            .split(/\s*;\s*/)
            .map((s) => s.trim())
            .filter(Boolean);
        const phoneRe = /^[+()\- \d]+$/;
        const name = parts[0] || null;
        const phone = parts.find((p) => phoneRe.test(p)) || null;
        pharmacy = { name, phone };
    }

    // Programs Enrolled -> array (not used here but included for completeness)
    const programsStr = pick(
        new RegExp(`Programs\\s*Enrolled:\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
    );
    const programs_enrolled = programsStr
        ? programsStr.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean)
        : [];

    // Genders (B) and (I) can be missing
    const genderB = pick(
        new RegExp(`Gender.*?\\(B\\):\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
    );
    const genderI = pick(
        new RegExp(`\\(I\\):\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
    );

    return {
        insurance_company: pick(
            new RegExp(`Insurance\\s*Company:\\s*(.+?)\\s*${stopAtNext.source}`, 'i'),
        ),
        member_identifier: pick(/Member\s*Identifier:\s*([A-Za-z0-9-]+)/i),
        language: pick(new RegExp(`Language:\\s*(.+?)\\s*${stopAtNext.source}`, 'i')),
        birthdate: pick(/Birthdate:\s*([0-9/]+)/i),
        age: pick(/Birthdate:[^()]*\(([^)]+)\)/i),
        gender: { B: genderB, I: genderI },
        address,
        phone: {
            home: pickPhone('H'),
            cell: pickPhone('C'),
        },
        email: pick(/\bEmail:\s*([^\s|]+)\b/i),
        pcp,
        pharmacy,
        programs_enrolled,
    };
}

/* -------------------------------------------
   Test
------------------------------------------- */
test(
    'Info presented on Member View matches Member Details tab',
    async () => {
        //--------------------------------
        // Arrange
        //--------------------------------
        const loginID = `MemberDeetInfo`;
        const memberView = {};

        const memberViewCol = [
            'Insurance Company',
            'Benefit Plan',
            'Member Identifier',
            'Member Name',
            'Status',
            'Effective Date',
            'Term Date',
            'Subscriber',
            'Member Is',
            'Address',
            'Home Phone',
            'Cell Phone',
            'Primary Email Address',
            'Birthdate',
            'Age',
            'PCP Name',
            'PCP Site Phone Number',
        ];

        const stateMap = {
            Alabama: 'AL',
            Alaska: 'AK',
            Arizona: 'AZ',
            Arkansas: 'AR',
            California: 'CA',
            Colorado: 'CO',
            Connecticut: 'CT',
            Delaware: 'DE',
            Florida: 'FL',
            Georgia: 'GA',
            Hawaii: 'HI',
            Idaho: 'ID',
            Illinois: 'IL',
            Indiana: 'IN',
            Iowa: 'IA',
            Kansas: 'KS',
            Kentucky: 'KY',
            Louisiana: 'LA',
            Maine: 'ME',
            Maryland: 'MD',
            Massachusetts: 'MA',
            Michigan: 'MI',
            Minnesota: 'MN',
            Mississippi: 'MS',
            Missouri: 'MO',
            Montana: 'MT',
            Nebraska: 'NE',
            Nevada: 'NV',
            'New Hampshire': 'NH',
            'New Jersey': 'NJ',
            'New Mexico': 'NM',
            'New York': 'NY',
            'North Carolina': 'NC',
            'North Dakota': 'ND',
            Ohio: 'OH',
            Oklahoma: 'OK',
            Oregon: 'OR',
            Pennsylvania: 'PA',
            'Rhode Island': 'RI',
            'South Carolina': 'SC',
            'South Dakota': 'SD',
            Tennessee: 'TN',
            Texas: 'TX',
            Utah: 'UT',
            Vermont: 'VT',
            Virginia: 'VA',
            Washington: 'WA',
            'West Virginia': 'WV',
            Wisconsin: 'WI',
            Wyoming: 'WY',
            'District of Columbia': 'DC',
        };

        const { page } = await logIn({ loginID });

        await waitUntilLoaded(page);

        //--------------------------------
        // Navigate to Members
        //--------------------------------
        await page.locator('#home-tabs-tab-4').getByText('Members').click();

        //--------------------------------
        // Grab a valid member row (robust wait)
        //--------------------------------
        const membersGridRows = page.locator('#members-grid table tbody tr');

        // Wait for at least one row to appear (prevents flaky zero-row states)
        await expect(membersGridRows.first()).toBeVisible({ timeout: 15_000 });

        const rowCount = await membersGridRows.count();
        const rowIndex = Math.min(2, rowCount - 1); // prefer index 2, clamp to last index
        const randomRow = membersGridRows.nth(rowIndex);

        // Collect visible grid values into memberView
        for (let i = 0; i < memberViewCol.length; i++) {
            memberView[memberViewCol[i]] = await randomRow
                .locator('td')
                .nth(i + 1)
                .innerText();
        }

        //--------------------------------
        // Open Member
        //--------------------------------
        await randomRow.dblclick();
        await waitUntilLoaded(page);

        //--------------------------------
        // Parse Description (summary block)
        //--------------------------------
        const descriptionText = (
            await page.locator('#member-description-contents').allInnerTexts()
        )[0].replace(/\r?\n|\r/g, ' ');

        const descObj = parseMemberLine(descriptionText);

        //--------------------------------
        // Assert: Name
        //--------------------------------
        await expect(page.locator('#pers_first_name')).toHaveText(
            memberView['Member Name'].split(', ')[1],
        );
        await expect(page.locator('#pers_last_name')).toHaveText(
            memberView['Member Name'].split(', ')[0],
        );

        //--------------------------------
        // Assert: Address (Member View vs Details vs Description)
        //--------------------------------
        const addr1 = await page.locator('#pad1_address_1').innerText();
        const city = await page.locator('#pad1_city').innerText();
        const zip = await page.locator('#pad1_zip').innerText();
        const stateUi = await page.locator('#pad1_state_id').innerText();
        const state = stateMap[stateUi];

        expect(memberView['Address']).toContain(addr1);
        expect((descObj.address ?? '')).toContain(addr1);

        expect(memberView['Address']).toContain(city);
        expect((descObj.address ?? '')).toContain(city);

        expect(memberView['Address']).toContain(zip);
        expect((descObj.address ?? '')).toContain(zip);

        expect(memberView['Address']).toContain(state);
        expect((descObj.address ?? '')).toContain(state);

        //--------------------------------
        // Assert: Contact (Member View vs Details vs Description)
        //--------------------------------
        const homeUI = page.locator('#pers_home_phone_formatted');
        const cellUI = page.locator('#pers_cell_phone_formatted');
        const emailUI = page.locator('#pers_primary_email_address');

        await expect(homeUI).toHaveText(memberView['Home Phone']);
        await expect(homeUI).toHaveText(descObj.phone.home ?? '');

        await expect(cellUI).toHaveText(memberView['Cell Phone']);
        await expect(cellUI).toHaveText(descObj.phone.cell ?? '');

        await expect(emailUI).toHaveText(memberView['Primary Email Address']);
        await expect(emailUI).toHaveText(descObj.email ?? '');

        //--------------------------------
        // Assert: Birthdate (Member View vs Details vs Description)
        //--------------------------------
        await expect(page.locator('#pers_birthdate')).toHaveText(
            memberView['Birthdate'],
        );
        await expect(page.locator('#pers_birthdate')).toHaveText(
            descObj.birthdate ?? '',
        );

        //--------------------------------
        // Assert: Gender (nullable-safe)
        //--------------------------------
        const birthGenderUI = (await page.locator('#pers_birth_gender_id').innerText()).trim();
        if (descObj.gender.B === null) {
            expect(birthGenderUI).toBe('');
        } else {
            expect(descObj.gender.B).toContain(birthGenderUI);
        }

        const identifiedGenderUI = (await page.locator('#pers_identified_gender_id').innerText()).trim();
        if (descObj.gender.I === null) {
            expect(identifiedGenderUI).toBe('');
        } else {
            expect(descObj.gender.I).toContain(identifiedGenderUI);
        }

        //--------------------------------
        // Assert: Pharmacy (nullable-safe, supports object or string)
        //--------------------------------
        try {
            await expect(page.locator('#pers_preferred_pharmacy_id')).toHaveText(
                descObj.pharmacy?.name ?? '',
            );
        } catch {
            await expect(page.locator('#pers_preferred_pharmacy_id')).toHaveText(
                descObj.pharmacy ?? '',
            );
        }

        //--------------------------------
        // Assert: Coverage (Member View, and Insurance vs Description)
        //--------------------------------
        await page.getByText('Member Coverage').first().click();

        const coverageCell = (n) =>
            page.locator(
                `#member-coverage-grid table tbody tr >> nth=0 >> td >> nth=${n}`,
            );

        // Insurance Company
        await expect(coverageCell(6)).toHaveText(memberView['Insurance Company']);
        await expect(coverageCell(6)).toHaveText(descObj.insurance_company ?? '');

        // Benefit Plan
        await expect(coverageCell(7)).toHaveText(memberView['Benefit Plan']);

        // Subscriber
        await expect(coverageCell(8)).toHaveText(memberView['Subscriber']);

        // Member Is (relationship to subscriber)
        await expect(coverageCell(9)).toHaveText(memberView['Member Is']);

        // Dates
        await expect(coverageCell(10)).toHaveText(memberView['Effective Date']);
        await expect(coverageCell(11)).toHaveText(memberView['Term Date']);

        //--------------------------------
        // Assert: PCP (Member View vs Description)
        //--------------------------------
        expect(memberView['PCP Name']).toBe(
            descObj.pcp?.name === 'No PCP' ? '' : (descObj.pcp?.name ?? ''),
        );
        expect(memberView['PCP Site Phone Number']).toBe(
            descObj.pcp?.phone ?? '',
        );
    },
);
