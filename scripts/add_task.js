/**
 * Prevents event propagation when clicking on the background.
 * 
 * @param {Event} event - The event object.
 */
function closeOnBackground(event) {
    event.stopPropagation();
};

/**
 * Loads names and categories for adding a new task asynchronously when the page loads.
 */
async function addTaskLoadNames() {
    try {
        let response = await fetch(BASE_URL + ".json");
        let data = await response.json();
        let sortedKeys = Object.keys(data.names).sort((a, b) => {
            let firstNameA = data.names[a].name.split(' ')[0].toUpperCase();
            let firstNameB = data.names[b].name.split(' ')[0].toUpperCase();
            return firstNameA.localeCompare(firstNameB);
        });

        renderAddTaskNames(sortedKeys, data.names);
        renderAddTaskCategories(data.category);
        mediumButton();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

/**
 * Generates HTML for displaying a name with a color-coded short name and a checkbox.
 * @param {string} nameKey - The key of the name.
 * @param {string} name - The name.
 * @param {string} firstInitial - The first initial of the first name.
 * @param {string} lastInitial - The first initial of the last name.
 * @param {number} id - The ID for the HTML element.
 * @returns {string} The generated HTML.
 */
function generateNameHTML(nameKey, name, firstInitial, lastInitial, id) {
    let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    return /*html*/ `
        <div class="dropdown_selection" onclick="dropdownSelectAssignTo(this)">
            <button class="shortname" style="background-color: ${randomColor};"><span>${firstInitial}${lastInitial}</span></button><span id="assignname_${nameKey}_${id}">${name}</span>
            <input class="checkbox" type="checkbox" id="assignedto_${nameKey}_${id}" data-initials="${firstInitial}${lastInitial}" data-color="${randomColor}" onchange="loadSelectedAssignTo()">
        </div>
    `;
};

/**
 * Generates the HTML for names, including initials.
 * @param {Array} sortedKeys - The sorted array of name keys.
 * @param {Object} names - The object containing the names.
 * @returns {string} The generated HTML for the names.
 */
function renderNamesHTML(sortedKeys, names) {
    let namesHTML = '';
    let id = 0;

    for (let key of sortedKeys) {
        if (names.hasOwnProperty(key)) {
            let nameObj = names[key];
            let name = nameObj.name;
            let nameParts = name.split(' ');
            let firstInitial = nameParts[0].charAt(0).toUpperCase();
            let lastInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
            namesHTML += generateNameHTML(key, name, firstInitial, lastInitial, id++);
        }
    }
    return namesHTML;
};

/**
 * Renders names HTML to the DOM.
 * @param {string} namesHTML - The HTML representing names to be rendered.
 */
function renderNamesToDOM(namesHTML) {
    let namesContainer = document.getElementById("assignedto");
    namesContainer.innerHTML = namesHTML;
};

/**
 * Renders names for adding a new task to the DOM.
 * @param {Array} sortedKeys - The sorted array of name keys.
 * @param {Object} names - An object containing names.
 */
function renderAddTaskNames(sortedKeys, names) {
    let namesHTML = renderNamesHTML(sortedKeys, names);
    renderNamesToDOM(namesHTML);
};

/**
 * Resets the background color, text color, and image of the given button to default values.
 * @param {HTMLElement} button - The HTML element of the button whose styles are to be reset.
 */
function resetButtonStyles(button) {
    button.style.background = '';
    button.style.color = '';
    button.querySelector('img').src = buttonImages[button.id];
};

/**
 * Sets the active state for the given button.
 * If the button is already active, resets its styles and clears the active state.
 * If the button is not active, sets its styles to the active state.
 * @param {HTMLElement} button - The HTML element of the button to set as active.
 */
function setActiveButton(button) {
    if (activeButton === button) {

    } else {
        // When clicking on a different button
        if (activeButton) {
            resetButtonStyles(activeButton); // Reset the previously active button
        }
        activeButton = button;
    }
};

/**
 * Sets the styles and active state for the urgent button.
 */
function urgentButton() {
    let urgentButton = document.getElementById('urgent');
    urgentButton.innerHTML = '';
    urgentButton.innerHTML += `Urgent <img src="./assets/img/prio_alta_white.png" alt="">`;
    urgentButton.style.background = buttonColors.urgent.background;
    urgentButton.style.color = buttonColors.urgent.color;
    setActiveButton(urgentButton);
};

/**
 * Sets the styles and active state for the medium button.
 */
function mediumButton() {
    let mediumButton = document.getElementById('medium');
    mediumButton.innerHTML = '';
    mediumButton.innerHTML += `Medium <img src="./assets/img/prio_media_white.png" alt="">`;
    mediumButton.style.background = buttonColors.medium.background;
    mediumButton.style.color = buttonColors.medium.color;
    setActiveButton(mediumButton);
};

/**
 * Sets the styles and active state for the low button.
 */
function lowButton() {
    let lowButton = document.getElementById('low');
    lowButton.innerHTML = '';
    lowButton.innerHTML += `Low <img src="./assets/img/prio_baja_white.png" alt="">`;
    lowButton.style.background = buttonColors.low.background;
    lowButton.style.color = buttonColors.low.color;
    setActiveButton(lowButton);
};

/**
 * Opens the subtask field for adding a new subtask.
 */
function openAddSubtaskField() {
    let addSubtaskField = document.getElementById('addsubtask');
    let subtaskField = document.getElementById('subtask');
    addSubtaskField.style.display = 'none';
    subtaskField.style.display = 'block';

    // Set the focus on the specific input field by ID
    let inputField = document.getElementById('subtask');
    if (inputField) {
        inputField.focus();
    }
};

/**
 * Closes the subtask field.
 */
function closeAddSubtaskField() {
    let addSubtaskField = document.getElementById('addsubtask');
    let subtaskField = document.getElementById('subtask');
    addSubtaskField.style.display = 'block';
    subtaskField.style.display = 'none';
    subtaskField.value = "";
};

/**
 * Handles click events on the subtask field.
 * Determines whether to close the field or add a subtask based on the clicked area.
 * @param {MouseEvent} event - The click event object.
 */
function handleSubtaskClick(event) {
    let input = document.getElementById("subtask");
    let clickX = event.clientX;
    let inputRight = input.getBoundingClientRect().right;

    if (clickX >= inputRight - 28) {
        addSubtask();
    }
    else if (clickX >= inputRight - 56 && clickX < inputRight - 28) {
        closeAddSubtaskField();
    }
};

/**
 * Handles the Enter key press to add a subtask.
 * @param {KeyboardEvent} event - The keydown event object.
 */
function checkEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission behavior
        addSubtask();
    }
};

/**
 * Handles adding a subtask when the user clicks on the appropriate area.
 * Retrieves the input content from the subtask field, creates a new list item element,
 * sets its content and attributes, appends it to the list of subtasks, and closes the subtask field.
 */
function addSubtask() {
    let input = document.getElementById("subtask");
    let inputContent = input.value.trim();

    if (inputContent !== "") {
        let subtasks = document.getElementById("addsubtasks");
        subtasks.classList.add("subtaskblock");
        subtaskCounter++;
        let subtaskId = "subtask" + subtaskCounter;
        subtasks.innerHTML += /*html*/ `
        <div class="addedtask" id="addedtask${subtaskId}">
            <span class="${subtaskId}" id="${subtaskId}">${inputContent}</span>
            <div id="subtask-buttons" class="subtask-buttons">
                <button onclick="editSubtask('${subtaskId}')" ><img src="./assets/img/edit.png" alt=""></button>
                <img src="./assets/img/separator.png" alt="">
                <button onclick="deleteSubtask('${subtaskId}')"><img src="./assets/img/delete.png" alt=""></button>
            </div>
        </div>`;
        closeAddSubtaskField();
    }
    input.value = "";
    return false;
};

/**
 * Enables editing of the specific subtask.
 * @param {string} subtaskId - The ID of the subtask to be edited.
 */
function editSubtask(subtaskId) {
    let subtaskElement = document.getElementById(subtaskId);
    if (subtaskElement) {
        let currentText = subtaskElement.innerText;
        document.getElementById('subtask-buttons').style.display = 'none';
        document.getElementById(`${subtaskId}`).style.paddingLeft = '0';
        subtaskElement.innerHTML = /*html*/`
        <input onclick = "saveEditedSubtask('${subtaskId}', event)" class="edit-subtask" type="text" id="${subtaskId}-edit" value="${currentText}">
        `;
    }
};

/**
 * Saves the edited subtask content.
 * @param {string} subtaskId - The ID of the subtask to be saved.
 * @param {Event} event - The blur event.
 */
function saveEditedSubtask(subtaskId, event) {
    let input = document.getElementById(subtaskId + '-edit');
    let inputRect = input.getBoundingClientRect();
    let clickX = event.clientX - inputRect.left; // Mouse click position relative to the input field
    let deleteIconLeft = inputRect.width - 16; // Left position of the delete icon (assuming width is 16px)
    let checkIconLeft = deleteIconLeft - 34; // Assuming check icon is 34px to the left of the delete icon

    if (clickX >= deleteIconLeft - 2) {
        deleteSubtask(subtaskId);
    } else if (clickX >= checkIconLeft - 2 && clickX < deleteIconLeft - 18) {
        let newContent = input.value.trim();
        if (newContent !== "") {
            document.getElementById(subtaskId).innerHTML = newContent;
            document.getElementById('subtask-buttons').style.display = 'flex';
            document.getElementById(`${subtaskId}`).style.padding = '10px 14px 10px 10px';
        } else {
            deleteSubtask(subtaskId);
        }
    }
};

/**
 * Deletes a subtask and its associated elements from the DOM.
 *
 * @param {string} subtaskId - The ID of the subtask to delete.
 */
function deleteSubtask(subtaskId) {
    let subtaskElement = document.getElementById(subtaskId);
    let addedTaskSubtask = document.getElementById(`addedtask${subtaskId}`);

    if (subtaskElement) {
        subtaskElement.remove();
    }

    if (addedTaskSubtask) {
        addedTaskSubtask.remove();
    }

    let subtasks = document.getElementById("addsubtasks");
    if (subtasks && subtasks.children.length === 0) {
        subtasks.classList.remove("subtaskblock");
        let addedTaskElement = document.getElementById('addedtask');
        if (addedTaskElement) {
            addedTaskElement.style.display = 'none';
        }
    }
};

/**
 * Reset inputs such as text fields and checkboxes.
 */
function resetInputs() {
    let inputs = document.getElementsByTagName("input");
    let textareas = document.getElementsByTagName("textarea");

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type === "text" || inputs[i].type === "date") {
            inputs[i].value = "";
        } else if (inputs[i].type === "checkbox") {
            inputs[i].checked = false;
        }
    }

    for (let j = 0; j < textareas.length; j++) {
        textareas[j].value = "";
    }
};

/**
 * Clear the content of assignedto and subtasks elements.
 */
function clearAssignedToAndSubtasks() {
    let assignedto = document.getElementById("selectedAssignTo");
    let subtasks = document.getElementById("addsubtasks");
    assignedto.innerHTML = "";
    subtasks.innerHTML = "";
};

/**
 * Remove the "selected_dropdown" class from dropdown selection elements.
 */
function removeSelectedDropdownClass() {
    let dropdownSelections = document.getElementsByClassName("dropdown_selection");
    for (let i = 0; i < dropdownSelections.length; i++) {
        dropdownSelections[i].classList.remove("selected_dropdown");
    }
};

/**
 * Clears the content by invoking the above functions and calls mediumButton if necessary.
 */
function clearContent() {
    resetInputs();
    clearAssignedToAndSubtasks();
    removeSelectedDropdownClass();

    let mediumBtn = document.getElementById('medium');
    if (activeButton !== mediumBtn) {
        mediumButton();
    }

    removeValidateTaskInputField();
    removeValidateTaskDetails();
};