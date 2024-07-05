/**
 * Gets the updated task data from the form inputs.
 * @returns {Object} The updated task data.
 */
function getUpdatedTaskData() {
    let title = getTitleInput();
    let description = getDescriptionInput();
    let duedate = getDueDateInput();
    let category = getCategoryInput();
    let subtasks = getSubtasks();
    let prio = getPriority();
    let assignto = editGetAssignedTo();

    return {
        title: title,
        description: description,
        duedate: duedate,
        category: category,
        prio: prio,
        subtask: subtasks,
        assignto: assignto
    };
};

/**
 * Gets the value of the title input field.
 * @returns {string} The value of the title input field.
 */
function getTitleInput() {
    return document.getElementById('edit-tasktitle').value;
};

/**
 * Gets the value of the description input field.
 * @returns {string} The value of the description input field.
 */
function getDescriptionInput() {
    return document.getElementById('edit-description').value;
};

/**
 * Gets the value of the due date input field.
 * @returns {string} The value of the due date input field.
 */
function getDueDateInput() {
    return document.getElementById('edit-duedate').value;
};

/**
 * Gets the value of the category input field.
 * @returns {string} The value of the category input field.
 */
function getCategoryInput() {
    return document.getElementById('edit-taskcategoryinput').value;
};

/**
 * Collects subtasks from the DOM.
 * @returns {Array<Object>} The list of subtasks.
 */
function getSubtasks() {
    return [...document.querySelectorAll('#edit-addsubtasks .edit-subtask-title')].map(span => ({ Titel: span.innerText }));
};

/**
 * Determines the priority based on the active button.
 * @returns {string|null} The priority value.
 */
function getPriority() {
    if (activeButton) {
        switch (activeButton.id) {
            case 'edit-urgent':
                return 'urgent';
            case 'edit-medium':
                return 'medium';
            case 'edit-low':
                return 'low';
            default:
                return null;
        }
    }
    return null;
};

/**
 * Saves the updated task data.
 * @param {string} taskid - The ID of the task to update.
 */
async function saveUpdatedTask(taskid) {
    let updatedData = getUpdatedTaskData();

    if (!editValidateTaskInputField(updatedData)) {
        return;
    }

    if (!editValidateTaskDetails(updatedData)) {
        return;
    }

    await updateTask(taskid, updatedData);
    displayTasks();
    closeDialogEdit();
};

async function updateTask(taskid, updatedData) {
    try {
        let response = await fetch(`${BASE_URL}tasks/${taskid}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error updating data:", error);
    }
};

async function handleSaveButtonClicked() {
    let taskid = getCurrentTaskId(); // Hier taskid holen, möglicherweise async
    if (!taskid) {
        console.error('Keine gültige Task-ID gefunden.');
        alert('Fehler: Keine gültige Task-ID gefunden.');
        return;
    }
    await saveUpdatedTask(taskid); // Hier saveUpdatedTask mit taskid aufrufen


};

async function deleteTask() {
    try {
        let taskid = getCurrentTaskId();
        let response = await fetch(`${BASE_URL}tasks/${taskid}.json`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        await response.json(); // Assuming the response body is needed

        hidePopup(); // Call closeDialog() within try block to ensure it executes
        displayTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
};