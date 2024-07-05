/**
 * Creates a new task based on user input and sends it to the server.
 */
async function createTask() {
    let taskDetails = getTaskDetails();

    if (!validateTaskDetails(taskDetails),
        !validateTaskInputField(taskDetails)
    ) return;

    let assignedTo = getAssignedTo();
    let subtasks = getSubtasks();
    let taskData = {
        ...taskDetails,
        assignto: assignedTo,
        subtask: subtasks,
        status: 'todo'
    };

    await postData("tasks", taskData);
    clearContent();
    showSuccessfullTaskCreation();
    setTimeout(() => {
        window.location.href = "board.html";
    }, 1500);

};

/**
 * Retrieves task details from user input fields.
 * @returns {Object} An object containing task details.
 */
function getTaskDetails() {
    return {
        title: document.getElementById('tasktitle').value,
        duedate: document.getElementById('duedate').value,
        category: document.getElementById('taskcategoryinput').value,
        prio: activeButton ? activeButton.id : null,
        description: document.getElementById('description').value
    };
};

/**
 * Validates task details.
 * @param {Object} taskDetails - An object containing task details.
 * @returns {boolean} Returns true if task details are valid, otherwise false.
 */
function validateTaskDetails(taskDetails) {
    let errorContainerTitle = document.getElementById('error-message-title');
    let errorContainerDate = document.getElementById('error-message-date');
    let errorContainerCategory = document.getElementById('error-message-category');
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
function validateTaskInputField(taskDetails) {
    let errorContainerTitle = document.getElementById('tasktitle');
    let errorContainerDate = document.getElementById('duedate');
    let errorContainerCategory = document.getElementById('taskcategoryinput');
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

    if (taskDetails.duedate && !validateDueDate()) {
        errorContainerDate.style.border = '1px solid #ff8190';
        isValid = false;
    } else {
        errorContainerDate.style.border = '';
    }

    return isValid;
};

/**
 * Retrieves assigned users based on checkbox selection.
 * @returns {string[]} An array of assigned users.
 */
function getAssignedTo() {
    let assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="assignedto_"]:checked');
    let assignedTo = [];

    assignedToCheckboxes.forEach((checkbox) => {
        let idParts = checkbox.id.split('_');

        if (idParts.length >= 3) {
            let nameSpan = document.getElementById(`assignname_${idParts[1]}_${idParts.slice(2).join('_')}`);
            if (nameSpan) {
                assignedTo.push(nameSpan.innerText.trim());
            }
        } else if (idParts.length === 2) {
            let nameSpan = document.getElementById(`assignname_${idParts[1]}`);
            if (nameSpan) {
                assignedTo.push(nameSpan.innerText.trim());
            }
        }
    });

    return assignedTo;
};

/**
 * Retrieves subtasks from the user interface.
 * @returns {string[]} An array of subtasks.
 */
function getSubtasks() {
    let subtasksElements = document.querySelectorAll('.addedtask span');
    let subtasks = [];
    subtasksElements.forEach((subtask) => {
        subtasks.push({
            Boolean: false,
            Titel: subtask.innerText
        });
    });
    return subtasks;
};

/**
 * Sends task data to the server.
 * @param {string} path - The path to send the task data to.
 * @param {Object} data - The task data to be sent.
 * @returns {Promise<void>} A promise that resolves once the data is sent.
 */
async function postData(path = "tasks", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return await response.json();
};

function showSuccessfullTaskCreation() {
    let taskCreated = document.getElementById('task-created');

    taskCreated.classList.add('slide-in-from-right');

    setTimeout(() => {
        taskCreated.classList.remove('slide-in-from-right');
    }, 1500);
};