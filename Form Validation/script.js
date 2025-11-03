
const form = document.getElementById('registrationForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('terms');



/**
 * Shows an error message and applies 'invalid' class to the form group.
 * @param {HTMLElement} inputElement - The input field.
 * @param {string} message - The error message to display.
 */
function setError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    const errorDisplay = document.getElementById(inputElement.id + 'Error');

    formGroup.classList.add('invalid');
    formGroup.classList.remove('valid');
    errorDisplay.textContent = message;
}

/**
 * Clears the error message and applies 'valid' class to the form group.
 * @param {HTMLElement} inputElement - The input field.
 */
function setSuccess(inputElement) {
    const formGroup = inputElement.closest('.form-group');
    const errorDisplay = document.getElementById(inputElement.id + 'Error');

    formGroup.classList.remove('invalid');
    formGroup.classList.add('valid');
    errorDisplay.textContent = '';
}



function validateUsername() {
    const username = usernameInput.value.trim();
    let isValid = true;
    
    if (username.length < 3) {
        setError(usernameInput, 'Username must be at least 3 characters.');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError(usernameInput, 'Username can only contain letters, numbers, and underscores.');
        isValid = false;
    } else {
        setSuccess(usernameInput);
    }
    return isValid;
}

function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    if (!emailRegex.test(email)) {
        setError(emailInput, 'Please enter a valid email address.');
        isValid = false;
    } else {
        setSuccess(emailInput);
    }
    return isValid;
}

function validatePassword() {
    const password = passwordInput.value;
    let isValid = true;

    if (password.length < 8) {
        setError(passwordInput, 'Password must be at least 8 characters long.');
        isValid = false;
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setError(passwordInput, 'Must contain at least one uppercase letter and one number.');
        isValid = false;
    } else {
        setSuccess(passwordInput);
    }
    return isValid;
}

function validateConfirmPassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;


    if (password.length >= 8 && confirmPassword !== password) {
        setError(confirmPasswordInput, 'Passwords do not match.');
        isValid = false;
    } else if (password.length >= 8) { 
        setSuccess(confirmPasswordInput);
    }
    return isValid;
}

function validateTerms() {
    let isValid = true;
    
    if (!termsCheckbox.checked) {
        setError(termsCheckbox, 'You must agree to the terms.');
        isValid = false;
    } else {
        setSuccess(termsCheckbox);
    }
    return isValid;
}




usernameInput.addEventListener('input', validateUsername);
emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePassword);


passwordInput.addEventListener('input', validateConfirmPassword);
confirmPasswordInput.addEventListener('input', validateConfirmPassword);

termsCheckbox.addEventListener('change', validateTerms);


/**
 * Main function to validate all fields on form submission.
 * @param {Event} event - The form submission event.
 * @returns {boolean} - True if the form is valid, false otherwise.
 */
function validateForm(event) {
    event.preventDefault();

  
    const isUsernameValid = validateUsername();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isTermsChecked = validateTerms();

    
    const isFormValid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isTermsChecked;

    if (isFormValid) {

        const successMessage = document.getElementById('successMessage');
        const formContent = form.querySelectorAll('.form-group, .submit-button');

 
        formContent.forEach(el => el.style.display = 'none');
        successMessage.style.display = 'block';
        
        return true;
    } else {
        
        const firstInvalid = document.querySelector('.form-group.invalid');
        if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
    }
}
