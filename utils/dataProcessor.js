export function processExcelData(raw) {
    return raw.map(row => ({
        entryTime: row['ENTRY TIME'] || row['Entry Time'] || row['Entry_Time'] || '',
        membershipNo: row['MEMBERSHIP NO'] || row['Membership No'] || row['Membership_No'] || '',
        employeeId: row['EMPLOYEE ID'] || row['Employee ID'] || row['Employee_ID'] || '',
        memberName: row['MEMBER NAME'] || row['Member Name'] || row['Member_Name'] ||
                     [row['FIRST NAME'], row['LAST NAME']].filter(Boolean).join(' '),
        relation: row['RELATION'] || row['Relation'] || '',
        category: row['CATEGORY'] || row['Category'] || '',
        dob: row['DATE OF BIRTH'] || row['DOB'] || '',
        gender: (row['GENDER'] || row['Gender'] || '').toUpperCase(),
        agentName: row['AGENT NAME'] || row['Agent Name'] || row['Agent_Name'] || '',
        validFrom: row['VALID FROM'] || row['Valid From'] || row['Valid_From'] ||
                   row['FIRST ENROLLMENT DATE'] || '',
        validTo: row['VALID UPTO'] || row['VALID TO'] || row['Valid_To'] ||
                 row['VALID UPTO'] || '',
        phone: row['MOBIL'] || row['MOBILE'] || row['Phone'] || '',
        email: row['EMAIL'] || row['Email'] || '',
        idType: row['ID TYPE'] || row['ID_Type'] || '',
        idNumber: row['ID'] || row['ID Number'] || row['ID_Number'] || '',
        memberCategory: row['MEMBER CATEGORY'] || row['Member_Category'] || '',
        riskCategory: row['RISK CATEGORY'] || row['Risk_Category'] || ''
    }));
}