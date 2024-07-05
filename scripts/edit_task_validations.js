/**
 * Sets the minimum date of the date input field to today's date.
 */
function editSetDateRestriction() {
    let today = new Date();
    let formattedDate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    let dateField = document.getElementById("edit-duedate");
    dateField.min = formattedDate;
};

/**
 * Validates that the date input field does not have a past date.
 * @returns {boolean} True if the date is valid, false otherwise.
 */
function editValidateDueDate() {
    let dateField = document.getElementById("edit-duedate");
    let selectedDate = new Date(dateField.value);
    let today = new Date();

    // Set time to 00:00:00 to only compare dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    let errorContainerDate = document.getElementById('edit-error-message-date');

    if (selectedDate < today) {
        errorContainerDate.textContent = "The due date cannot be in the past.";
        errorContainerDate.style.display = "block";
        return false;
    } else {
        errorContainerDate.style.display = "none";
    }

    return true;
};

/**
 * Validates task details.
 * @param {Object} taskDetails - An object containing task details.
 * @returns {boolean} Returns true if task details are valid, otherwise false.
 */
function editValidateTaskDetails(taskDetails) {
    let errorContainerTitle = document.getElementById('edit-error-message-title');
    let errorContainerDate = document.getElementById('edit-error-message-date');
    let errorContainerCategory = document.getElementById('edit-error-message-category');
    if (!taskDetails.title || !taskDetails.duedate || !taskDetails.category) {
        errorContainerTitle.style.display = 'block';
        errorContainerDate.style.display = 'block';
        errorContainerCategory.style.display = 'block';
        return false;
    }
    return true;
};

/**
 * Validates task details.
 * @param {Object} taskDetails - An object containing task details.
 * @returns {boolean} Returns true if task details are valid, otherwise false.
 */
function editValidateTaskInputField(taskDetails) {
    let errorContainerTitle = document.getElementById('edit-tasktitle');
    let errorContainerDate = document.getElementById('edit-duedate');
    let errorContainerCategory = document.getElementById('edit-taskcategoryinput');

    let isValid = true;

    if (!taskDetails.title) {
        errorContainerTitle.style.border = '1px solid #ff8190';
        isValid = false;
    } else {
        errorContainerTitle.style.border = '';
    }

    if (!taskDetails.duedate) {
        errorContainerDate.style.border = '1px solid #ff8190';
        isValid = false;
    } else {
        errorContainerDate.style.border = '';
    }

    if (!taskDetails.category) {
        errorContainerCategory.style.border = '1px solid #ff8190';
        isValid = false;
    } else {
        errorContainerCategory.style.border = '';
    }

    if (taskDetails.duedate && !editValidateDueDate()) {
        errorContainerDate.style.border = '1px solid #ff8190';
        isValid = false;
    } else {
        errorContainerDate.style.border = '';
    }

    return isValid;
};