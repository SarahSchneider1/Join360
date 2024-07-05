/**
 * Sets the minimum date of the date input field to today's date.
 */
function setDateRestriction() {
    let today = new Date();
    let formattedDate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    let dateField = document.getElementById("duedate");
    dateField.min = formattedDate;
};

/**
 * Validates that the date input field does not have a past date.
 * @returns {boolean} True if the date is valid, false otherwise.
 */
function validateDueDate() {
    let dateField = document.getElementById("duedate");
    let selectedDate = new Date(dateField.value);
    let today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    let errorContainerDate = document.getElementById('error-message-date');

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
 * Removes validation styling from task input fields.
 */
function removeValidateTaskInputField() {
    let taskTitleField = document.getElementById('tasktitle');
    let dueDateField = document.getElementById('duedate');
    let taskCategoryField = document.getElementById('taskcategoryinput');
    taskTitleField.style.border = '1px solid #D1D1D1';
    dueDateField.style.border = '1px solid #D1D1D1';
    taskCategoryField.style.border = '1px solid #D1D1D1';
};

/**
 * Hides error messages for task details.
 */
function removeValidateTaskDetails() {
    let errorTitleMessage = document.getElementById('error-message-title');
    let errorDateMessage = document.getElementById('error-message-date');
    let errorCategoryMessage = document.getElementById('error-message-category');
    errorTitleMessage.style.display = 'none';
    errorDateMessage.style.display = 'none';
    errorCategoryMessage.style.display = 'none';
};