function checkEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email);
}

function checkPassword(password) {
    return password.length >= 8;
}

export { checkEmail, checkPassword };
