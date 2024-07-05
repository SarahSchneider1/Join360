function getCurrentTaskId() {
    return document.getElementById('TaskDetailsDialog').getAttribute('data-taskid');
};

/**
 * Opens the dialog by removing the 'd_none' class and ensures CSS and content are loaded.
 */
async function openDialogEdit() {
    let taskid = getCurrentTaskId();
    currentTaskId = taskid;
    await loadDialogContent();
    ensureCssLoaded();
    await adjustContent();
    // Clear the active button id and reset activeButton
    if (activeButton) {
        activeButton.id = '';
        activeButton = null; // Reset activeButton
    }
    hidePopup();
};

/**
 * Loads the content of the dialog from 'edit_task.html' and updates the DOM.
 */
async function loadDialogContent() {
    let response = await fetch('./edit_task.html');
    let htmlContent = await response.text();

    let dialog = document.getElementById('edit-dialog');
    let dialogslide = document.getElementById('edit_task_dialog_content');
    dialogslide.innerHTML = htmlContent;

    setTimeout(() => {
        dialogslide.classList.add('slide-in-right');
        dialog.classList.remove('edit-d_none');
    }, 300);
};

/**
 * Adjusts the content of the edit task dialog.
 */
async function adjustContent() {
    let content = document.getElementById('edittask-content');
    if (content) {
        content.classList.remove('edit-task-content');
        content.classList.add('edit-task-content-dialog');
        await editAddTaskLoadNames();
    }
};

/**
 * Fetches the edit task details and processes the response.
 * @param {string} taskid - The ID of the task to fetch.
 */
function fetchEditTask(taskid) {
    fetchTaskData(taskid)
        .then(task => {
            processTaskData(task, taskid);
        })
        .catch(error => {

        });
};

/**
 * Fetches task data from the server.
 * @param {string} taskid - The ID of the task to fetch.
 * @returns {Promise<Object>} The task data.
 */
async function fetchTaskData(taskid) {
    return fetch(`${BASE_URL}tasks/${taskid}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
};

/**
 * Processes the fetched task data.
 * @param {Object} task - The fetched task data.
 * @param {string} taskid - The ID of the task.
 */
function processTaskData(task, taskid) {
    if (!task) {
        throw new Error('Task not found');
    }

    renderEditTask(task);

    let taskDetails = document.getElementById('TaskDetailsDialog');
    taskDetails.setAttribute('data-taskid', taskid);

    let assignedToList = task.assignedto || task.assignto;
    if (!Array.isArray(assignedToList)) {
        return;
    }

    assignedToList.forEach(person => {
        let checkbox = document.querySelector(`input[name="assignto"][value="${person}"]`);
        if (checkbox) {
            checkbox.checked = true;
            handleCheckboxChange(checkbox);
        }
    });
};

function renderEditTask(task) {
    let titleInput = document.getElementById('edit-tasktitle');
    let descriptionInput = document.getElementById('edit-description');
    let duedateInput = document.getElementById('edit-duedate');
    let categoryInput = document.getElementById('edit-taskcategoryinput');

    if (titleInput && descriptionInput && duedateInput && categoryInput) {
        titleInput.value = task.title || '';
        descriptionInput.value = task.description || '';
        duedateInput.value = task.duedate || '';
        categoryInput.value = task.category || '';

        renderEditAssignTo(task);
        renderEditPrio(task);
        renderEditSubtasks(task.subtask);
    } else {
        console.error('One or more input fields not found.');
    }
};

function renderEditPrio(task) {

    switch (task.prio) {
        case 'urgent':
            editUrgentButton();
            break;
        case 'medium':
            editMediumButton();
            break;
        case 'low':
            editLowButton();
            break;
        default:

            editResetButtonStyles();
            break;
    }
};

function renderEditSubtasks(subtaskData) {
    let subtasksContainer = document.getElementById('edit-addsubtasks');

    if (subtasksContainer && subtaskData) {
        subtasksContainer.innerHTML = '';

        Object.keys(subtaskData).forEach(key => {
            let subtask = subtaskData[key];

            subtasksContainer.innerHTML += /*html*/`
                
                <div class="addedtask" id="edit-addedtask${key}">
                    <span id="edit-subtask-title" class="edit-subtask-title">${subtask.Titel}</span>
                    <div id="edit-subtask-buttons" class="subtask-buttons">
                        <button onclick="editEditSubtask('edit-addedtask${key}')"><img src="./assets/img/edit.png" alt=""></button>
                        <img src="./assets/img/separator.png" alt="">
                        <button onclick="editDeleteSubtask('${key}')"><img src="./assets/img/delete.png" alt=""></button>
                    </div>
                </div>`;
        });
    }
};

/**
 * Ensures the 'style_addtask.css' stylesheet is loaded.
 */
function ensureCssLoaded() {
    if (!document.querySelector('link[href="./styles/style_addtask.css"]')) {
        let cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = './styles/style_addtask.css';
        document.head.appendChild(cssLink);
    }
};

/**
 * Closes the dialog by adding the 'd_none' class.
 */
function closeDialogEdit() {
    let dialog = document.getElementById('edit-dialog');
    let dialogslide = document.getElementById('edit_task_dialog_content');
    dialogslide.classList.add('slide-out-right');
    setTimeout(() => {
        dialogslide.classList.remove('slide-in-right')
        dialogslide.classList.remove('slide-out-right');
        dialog.classList.add('edit-d_none');
        // Clear the active button id and reset activeButton
        if (activeButton) {
            activeButton.id = '';
            activeButton = null; // Reset activeButton
        }
    }, 300);
    showPopup(currentTaskId);
};

/**
 * Prevents event propagation.
 * @param {Event} event - The event object.
 */
function editCloseOnBackground(event) {
    event.stopPropagation();
};

/**
 * Resets the background color, text color, and image of the given button to default values.
 * @param {HTMLElement} button - The HTML element of the button whose styles are to be reset.
 */
function editResetButtonStyles(button) {
    button.style.background = '';
    button.style.color = '';
    button.querySelector('img').src = prioImages[button.id];
};

/**
 * Sets the active state for the given button.
 * If the button is already active, resets its styles and clears the active state.
 * If the button is not active, sets its styles to the active state.
 * @param {HTMLElement} button - The HTML element of the button to set as active.
 */
function editSetActiveButton(button) {
    if (activeButton !== button) {
        if (activeButton) {
            editResetButtonStyles(activeButton);
        }
        activeButton = button;
    }
};

/**
 * Sets the styles and active state for the urgent button.
 */
function editUrgentButton() {
    let urgentButton = document.getElementById('edit-urgent');
    urgentButton.innerHTML = '';
    urgentButton.innerHTML += `Urgent <img src="./assets/img/prio_alta_white.png" alt="">`;
    urgentButton.style.background = buttonColors.urgent.background;
    urgentButton.style.color = buttonColors.urgent.color;
    editSetActiveButton(urgentButton);
};

/**
 * Sets the styles and active state for the medium button.
 */
function editMediumButton() {
    let mediumButton = document.getElementById('edit-medium');
    mediumButton.innerHTML = '';
    mediumButton.innerHTML += `Medium <img src="./assets/img/prio_media_white.png" alt="">`;
    mediumButton.style.background = buttonColors.medium.background;
    mediumButton.style.color = buttonColors.medium.color;
    editSetActiveButton(mediumButton);
};

/**
 * Sets the styles and active state for the low button.
 */
function editLowButton() {
    let lowButton = document.getElementById('edit-low');
    lowButton.innerHTML = '';
    lowButton.innerHTML += `Low <img src="./assets/img/prio_baja_white.png" alt="">`;
    lowButton.style.background = buttonColors.low.background;
    lowButton.style.color = buttonColors.low.color;
    editSetActiveButton(lowButton);
};

/**
 * Opens the subtask field for adding a new subtask.
 */
function editOpenAddSubtaskField() {
    let addSubtaskField = document.getElementById('edit-addsubtask');
    let subtaskField = document.getElementById('edit-subtask');
    addSubtaskField.style.display = 'none';
    subtaskField.style.display = 'block';

    let inputField = document.getElementById('edit-subtask');
    if (inputField) {
        inputField.focus();
    }
};

/**
 * Closes the subtask field.
 */
function editCloseAddSubtaskField() {
    let addSubtaskField = document.getElementById('edit-addsubtask');
    let subtaskField = document.getElementById('edit-subtask');
    addSubtaskField.style.display = 'block';
    subtaskField.style.display = 'none';
    subtaskField.value = "";
};

/**
 * Handles click events on the subtask field.
 * Determines whether to close the field or add a subtask based on the clicked area.
 * @param {MouseEvent} event - The click event object.
 */
function editHandleSubtaskClick(event) {
    let input = document.getElementById("edit-subtask");
    let clickX = event.clientX;
    let inputRight = input.getBoundingClientRect().right;

    if (clickX >= inputRight - 28) {
        editAddSubtask();
    }

    else if (clickX >= inputRight - 56 && clickX < inputRight - 28) {
        editCloseAddSubtaskField();
    }
};

/**
 * Handles the Enter key press to add a subtask.
 * @param {KeyboardEvent} event - The keydown event object.
 */
function editCheckEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        editAddSubtask();
    }
};

/**
 * Handles adding a subtask when the user clicks on the appropriate area.
 * Retrieves the input content from the subtask field, creates a new list item element,
 * sets its content and attributes, appends it to the list of subtasks, and closes the subtask field.
 */
function editAddSubtask() {
    let input = document.getElementById("edit-subtask");
    let inputContent = input.value.trim();

    if (inputContent !== "") {
        let subtasksContainer = document.getElementById("edit-addsubtasks");
        subtasksContainer.classList.add("edit-subtaskblock");

        let subtaskCounter = document.querySelectorAll(`[id^='edit-addedtask']`).length;
        let subtaskId = `edit-addedtask${subtaskCounter}`;

        subtasksContainer.innerHTML += /*html*/ `
            <div class="addedtask" id="${subtaskId}">
                <span class="edit-subtask-title" id="${subtaskId}-title">${inputContent}</span>
                <div id="edit-subtask-buttons" class="subtask-buttons">
                    <button onclick="editEditSubtask('${subtaskId}')"><img src="./assets/img/edit.png" alt=""></button>
                    <img src="./assets/img/separator.png" alt="">
                    <button onclick="editDeleteSubtask('${subtaskId}')"><img src="./assets/img/delete.png" alt=""></button>
                </div>
            </div>`;
        editCloseAddSubtaskField();
    }
    input.value = "";
    return false;
};

/**
 * Initiates editing of a subtask by replacing its title with an input field.
 * @param {string} subtaskId - The ID of the subtask to edit.
 */
function editEditSubtask(subtaskId) {
    let subtaskElement = document.getElementById(subtaskId);
    if (subtaskElement) {
        let subtaskTitle = subtaskElement.querySelector('.edit-subtask-title');
        let currentText = subtaskTitle.innerText;
        subtaskElement.querySelector('#edit-subtask-buttons').style.display = 'none';
        subtaskTitle.style.paddingLeft = '0';
        subtaskTitle.innerHTML = /*html*/`
            <input onclick="editSaveEditedSubtask('${subtaskId}', event)" class="edit-subtask" type="text" id="${subtaskId}-edit" value="${currentText}">
        `;
    }
};

/**
 * Saves the edited subtask title or deletes the subtask based on the clicked position.
 * @param {string} subtaskId - The ID of the subtask to save.
 * @param {MouseEvent} event - The mouse event triggered by clicking within the input field.
 */
function editSaveEditedSubtask(subtaskId, event) {
    let input = document.getElementById(subtaskId + '-edit');
    let inputRect = input.getBoundingClientRect();
    let clickX = event.clientX - inputRect.left; // Mouse click position relative to the input field
    let deleteIconLeft = inputRect.width - 16; // Left position of the delete icon (assuming width is 16px)
    let checkIconLeft = deleteIconLeft - 34; // Assuming check icon is 34px to the left of the delete icon

    if (clickX >= deleteIconLeft - 2) {
        editDeleteSubtask(subtaskId);
    } else if (clickX >= checkIconLeft - 2 && clickX < deleteIconLeft - 18) {
        let newContent = input.value.trim();
        if (newContent !== "") {
            let subtaskElement = document.getElementById(subtaskId);
            let subtaskTitle = subtaskElement.querySelector('.edit-subtask-title');
            subtaskTitle.innerText = newContent;
            subtaskElement.querySelector('#edit-subtask-buttons').style.display = 'flex';
            subtaskTitle.style.paddingLeft = '10px';
        } else {
            editDeleteSubtask(subtaskId);
        }
    }
};

/**
 * Deletes a subtask and its associated elements from the DOM.
 *
 * @param {string} subtaskId - The ID of the subtask to delete.
 */
function editDeleteSubtask(subtaskId) {
    let subtaskElement = document.getElementById(subtaskId);
    let addedTaskSubtask = document.getElementById(`edit-addedtask${subtaskId}`);

    if (subtaskElement) {
        subtaskElement.remove();
    }

    if (addedTaskSubtask) {
        addedTaskSubtask.remove();
    }

    let subtasks = document.getElementById("edit-addsubtasks");
    if (subtasks && subtasks.children.length === 0) {
        subtasks.classList.remove("subtaskblock");
        let addedTaskElement = document.getElementById('edit-addedtask');
        if (addedTaskElement) {
            addedTaskElement.style.display = 'none';
        }
    }
};