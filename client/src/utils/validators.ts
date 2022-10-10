const emailRegex = new RegExp(
    /^[A-Za-z0-9_]+@(?:[A-Za-z0-9_]+\.[A-Za-z0-9_]+)+$/
);
const numberRegex = new RegExp(/^[0-9]+$/);
const specialRegex = new RegExp(/^[_#\\.]$/);
const upperRegex = new RegExp(/^[A-Z]$/);

/**
 * Get the strength level of the password
 * @param password Password to be validated
 * @return strengthLevel
 */
export function validatePassword(password: string) {
    let strengthLevel = 0;
    let numberChars = 0;
    let specialChars = 0;
    let upperChars = 0;

    if (password.length < 8) return strengthLevel;

    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        const isNumber = numberRegex.test(char);
        const isUppercase = upperRegex.test(char);
        const isSpecial = specialRegex.test(char);

        if (isNumber) numberChars++;
        else if (isUppercase) upperChars++;
        else if (isSpecial) specialChars++;
    }

    if (numberChars >= 2) strengthLevel += 1;
    if (specialChars >= 2) strengthLevel += 1;
    if (upperChars >= 2) strengthLevel += 1;
    if (password.length >= 8) strengthLevel += 1;

    return strengthLevel;
}

export function validateEmail(email: string) {
    return emailRegex.test(email);
}
