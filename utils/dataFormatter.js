export function titleCase(str) {
    if (!str) return '';
    return String(str).toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function formatPhone(raw) {
    if (!raw) return 'N/A';
    const str = String(raw).replace(/\D/g, '');
    if (str.startsWith('254') && str.length === 12) {
        return '0' + str.slice(3);
    }
    return str;
}

export function formatDate(raw) {
    if (!raw) return 'N/A';
    
    // Check if it's an Excel serial number (5 digits, typical range for dates)
    // Excel date epoch starts Jan 1, 1900. Day 1 is Jan 1, 1900.
    // However, it has a bug where 1900 is treated as a leap year, so Jan 1, 1900 is day 1, Jan 1, 1901 is day 367.
    // The epoch for JS Date objects is Jan 1, 1970.
    // XLSX library already handles this correctly, so we'll rely on its output.
    if (typeof raw === 'number' && raw > 0 && raw < 200000) { // arbitrary upper limit to avoid parsing large numbers as dates
        const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 for Excel's 1-based day count
        const date = new Date(excelEpoch.getTime() + (raw * 24 * 60 * 60 * 1000));
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-GB'); // Day/Month/Year
        }
    }
    
    // Try to parse as existing date string
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
    }
    
    return raw; // Return original if parsing fails
}

export function formatAmount(raw) {
    if (!raw) return '0';
    const str = String(raw).replace(/[^0-9KkMm.]/g, ''); // Remove non-numeric except K, M, .
    let num;

    if (str.endsWith('M') || str.endsWith('m')) {
        num = parseFloat(str.slice(0, -1)) * 1_000_000;
    } else if (str.endsWith('K') || str.endsWith('k')) {
        num = parseFloat(str.slice(0, -1)) * 1_000;
    } else {
        num = parseFloat(str);
    }

    if (isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US'); // Format with commas
}

export function determineGender(genderCode, name) {
    if (genderCode) {
        return genderCode.toUpperCase() === 'F' ? 'Female' : genderCode.toUpperCase() === 'M' ? 'Male' : 'Not Specified';
    }

    // Fallback to name-based heuristic if gender field is empty
    const maleNames = ['John', 'Robert', 'Michael', 'William', 'David', 'James', 'Charles', 'Thomas', 'Daniel', 'Matthew', 'Mark', 'Paul', 'George', 'Frank', 'Gary', 'Henry', 'Jack', 'Larry', 'Peter', 'Ronald', 'Stephen', 'Timothy', 'Walter', 'Andrew', 'Brian', 'Christopher', 'Edward', 'Jeffrey', 'Kevin', 'Patrick', 'Richard', 'Steven', 'Anthony', 'Donald', 'Joseph', 'Kenneth', 'Paul', 'Raymond', 'Scott', 'Eric', 'Gregory', 'Jeremy', 'Justin', 'Nicholas', 'Roger', 'Samuel', 'Terry', 'Adam', 'Aaron', 'Alexander', 'Benjamin', 'Brandon', 'Jonathan', 'Joshua', 'Kevin', 'Ryan', 'Sean', 'Zachary'];
    const femaleNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Margaret', 'Lisa', 'Betty', 'Dorothy', 'Sandra', 'Ashley', 'Kimberly', 'Donna', 'Emily', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia', 'Kathleen', 'Shirley', 'Amy', 'Anna', 'Brenda', 'Christine', 'Debra', 'Denise', 'Diana', 'Frances', 'Gloria', 'Jacqueline', 'Janice', 'Jean', 'Julia', 'Judith', 'Katherine', 'Kelly', 'Marie', 'Martha', 'Pamela', 'Theresa', 'Victoria', 'Virginia', 'Andrea', 'Catherine', 'Christina', 'Danielle', 'Evelyn', 'Janet', 'Joyce', 'Lauren', 'Nicole', 'Olivia', 'Rachel', 'Samantha', 'Shirley', 'Teresa', 'Tracy'];

    const firstName = name?.split(' ')[0];
    if (firstName) {
        if (maleNames.includes(firstName)) return 'Male';
        if (femaleNames.includes(firstName)) return 'Female';
    }
    
    // Fallback to simpler heuristic if full name isn't matched
    const femaleSuffixes = ['Devi', 'Kumari', 'Lata', 'Priya', 'Sri', 'Mata', 'Lee', 'Ann', 'Lynn'];
    const maleSuffixes = ['Kumar', 'Raj', 'Dev', 'Man', 'Prasad', 'Singh', 'Sharma', 'Son', 'Jr.'];
    
    const nameParts = (name || '').toLowerCase().split(' ');
    for (let part of nameParts) {
        if (femaleSuffixes.some(suffix => part.endsWith(suffix.toLowerCase()))) return 'Female';
        if (maleSuffixes.some(suffix => part.endsWith(suffix.toLowerCase()))) return 'Male';
    }

    return 'Not Specified';
}

export function getMostFrequentValue(arr, key) {
    if (!arr || arr.length === 0) return null;

    const counts = {};
    let maxCount = 0;
    let mostFrequent = null;

    for (const item of arr) {
        const value = item[key];
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) continue;

        const normalizedValue = String(value).trim();

        counts[normalizedValue] = (counts[normalizedValue] || 0) + 1;

        if (counts[normalizedValue] > maxCount) {
            maxCount = counts[normalizedValue];
            mostFrequent = normalizedValue;
        }
    }
    return mostFrequent;
}