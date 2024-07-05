/**
 * Loads names and categories for adding a new task asynchronously when the page loads.
 */
async function editAddTaskLoadNames() {
    try {
        let response = await fetch(BASE_URL + ".json");
        let data = await response.json();
        let sortedKeys = Object.keys(data.names).sort((a, b) => {
            let firstNameA = data.names[a].name.split(' ')[0].toUpperCase();
            let firstNameB = data.names[b].name.split(' ')[0].toUpperCase();
            return firstNameA.localeCompare(firstNameB);
        });

        editRenderAddTaskNames(sortedKeys, data.names);
        editRenderAddTaskCategories(data.category);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

/**
 * Renders the edit-selectedAssignTo container with buttons representing the assigned names.
 * @param {Object} task - The task object containing assigned names.
 */
function renderEditAssignTo(task) {
    let assignToContainer = document.getElementById('edit-selectedAssignTo');
    assignToContainer.innerHTML = ''; // Clear previous content

    let count = 0;
    let position = 0;

    let assignedToList = task.assignedto || task.assignto; // Überprüfen, welche Eigenschaft existiert
    if (!Array.isArray(assignedToList)) {
        return;
    }

    assignedToList.forEach((name) => {
        if (count < 3) {
            let nameParts = name.split(' ');
            let firstInitial = nameParts[0].charAt(0).toUpperCase();
            let lastInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
            let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

            let button = document.createElement('button');
            button.name = name; // Set button id to name
            button.classList.add('shortname');
            button.style.backgroundColor = randomColor;
            button.innerHTML = `<span>${firstInitial}${lastInitial}</span>`;
            assignToContainer.appendChild(button);

            position += 0; // Adjust this value to control the overlap
            count++;
        }
    });

    if (assignedToList.length > 3) {
        let moreButton = editAddMoreButton(assignedToList.length - 3, position);
        assignToContainer.appendChild(moreButton);
    }

    // Adjust container display based on count
    if (count > 0) {
        assignToContainer.style.display = 'inline-block';
    } else {
        assignToContainer.style.display = 'none';
    }
}

/**
 * Generates HTML for displaying a name with a color-coded short name and a checkbox.
 * @param {string} nameKey - The key of the name.
 * @param {string} name - The name.
 * @param {string} firstInitial - The first initial of the first name.
 * @param {string} lastInitial - The first initial of the last name.
 * @param {number} id - The ID for the HTML element.
 * @returns {string} The generated HTML.
 */
function editGenerateNameHTML(nameKey, name, firstInitial, lastInitial) {
    let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    return /*html*/ `
        <div class="dropdown_selection" onclick="editDropdownSelectAssignTo(this)">
            <button class="shortname" style="background-color: ${randomColor};"><span>${firstInitial}${lastInitial}</span></button><span id="editassignname_${nameKey}">${name}</span>
            <input class="checkbox" name="assignto" value="${name}" type="checkbox" id="editassignedto_${nameKey}" data-initials="${firstInitial}${lastInitial}" data-color="${randomColor}" onchange="editLoadSelectedAssignTo()">
        </div>
    `;
}

function handleCheckboxChange(checkbox) {
    const dropdownSelection = checkbox.closest('.dropdown_selection');

    if (checkbox.checked) {
        dropdownSelection.classList.remove('dropdown_selection');
        dropdownSelection.classList.add('selected_dropdown');
    } else {
        dropdownSelection.classList.remove('selected_dropdown');
        dropdownSelection.classList.add('dropdown_selection');
    }
}

/**
 * Generates the HTML for names, including initials.
 * @param {Array} sortedKeys - The sorted array of name keys.
 * @param {Object} names - The object containing the names.
 * @returns {string} The generated HTML for the names.
 */
function editRenderNamesHTML(sortedKeys, names) {
    let namesHTML = '';
    let id = 0;

    for (let key of sortedKeys) {
        if (names.hasOwnProperty(key)) {
            let nameObj = names[key];
            let name = nameObj.name;
            let nameParts = name.split(' ');
            let firstInitial = nameParts[0].charAt(0).toUpperCase();
            let lastInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
            namesHTML += editGenerateNameHTML(key, name, firstInitial, lastInitial, id++);
        }
    }
    return namesHTML;
};

/**
 * Renders names HTML to the DOM.
 * @param {string} namesHTML - The HTML representing names to be rendered.
 */
function editRenderNamesToDOM(namesHTML) {
    let namesContainer = document.getElementById("edit-assignedto");
    namesContainer.innerHTML = namesHTML;

    fetchEditTask(getCurrentTaskId());
}

/**
 * Renders names for adding a new task to the DOM.
 * @param {Array} sortedKeys - The sorted array of name keys.
 * @param {Object} names - An object containing names.
 */
function editRenderAddTaskNames(sortedKeys, names) {
    let namesHTML = editRenderNamesHTML(sortedKeys, names);
    editRenderNamesToDOM(namesHTML);
};

/**
 * Toggles the visibility of the assign-to selection container.
 * If the container is currently visible, hides it; otherwise, shows it.
 */
function editSelectAssignTo() {
    let assignToContainer = document.getElementById('edit-assignedto');
    let assignToInput = document.getElementById('edit-assignedtoinput');
    if (assignToContainer.style.display === 'block') {
        assignToContainer.style.display = 'none';
        assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
    } else {
        assignToContainer.style.display = 'block';
        assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop_down.png)';
    }
};

/**
 * Closes the assignto dropdown menu if it is currently open.
 */
function editCloseAssignTo() {
    let assignToContainer = document.getElementById('edit-assignedto');
    let assignToInput = document.getElementById('edit-assignedtoinput');
    if (assignToContainer.style.display === 'block') {
        assignToContainer.style.display = 'none';
    }
    assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
};

/**
 * Updates the selectedAssignTo div with buttons representing the selected names.
 * This function goes through all checkboxes with the class "checkbox" and, if checked,
 * creates a button with the initials and color associated with the checkbox.
 */
function editLoadSelectedAssignTo() {
    let selectedAssignToDiv = document.getElementById("edit-selectedAssignTo");
    let checkboxes = document.querySelectorAll("#edit-assignedto .checkbox");
    let buttonContainer = document.getElementById("edit-selectedAssignTo")

    selectedAssignToDiv.innerHTML = '';
    let position = 0;
    let count = 0;

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            count++;
            if (count <= 3) {
                let button = editCreateButton(checkbox, position);
                selectedAssignToDiv.appendChild(button);
                position += 12;
                buttonContainer.style.display = 'inline-block'
            }
        }
    });

    if (count > 3) {
        let moreButton = editAddMoreButton(count - 3, position);
        selectedAssignToDiv.appendChild(moreButton);
    }
    if (count === 0) {
        buttonContainer.style.display = 'none'
    }
};

/**
 * Toggles the "selected_dropdown" class on the given element and toggles the associated checkbox state.
 * If the element is within the "assignedto" container, it updates the checkbox state and reloads the selected names.
 * 
 * @param {HTMLElement} element - The dropdown element that was clicked.
 */
function editDropdownSelectAssignTo(element) {
    element.classList.toggle("selected_dropdown");
    if (element.closest("#edit-assignedto")) {
        let checkbox = element.querySelector(".checkbox");

        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            editLoadSelectedAssignTo();
        }
    }
};

/**
 * Creates a button for a selected checkbox.
 * @param {Element} checkbox - The checkbox element.
 * @param {number} position - The left position of the button.
 */
function editCreateButton(checkbox, position) {
    let initials = checkbox.getAttribute("data-initials");
    let color = checkbox.getAttribute("data-color");
    let checkboxId = checkbox.id;
    let button = document.createElement("button");
    button.className = "selectedAssignTo";
    button.id = `edit-selected_${checkboxId}`;
    button.style.backgroundColor = color;
    button.style.left = `${position}px`;
    button.innerText = initials;
    return button;
};

/**
 * Retrieves assigned users based on checkbox selection.
 * @returns {string[]} An array of assigned users.
 */
function editGetAssignedTo() {
    let assignedToCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="editassignedto_"]:checked');
    let assignedTo = [];

    assignedToCheckboxes.forEach((checkbox) => {
        let idParts = checkbox.id.split('_');

        if (idParts.length >= 3) {
            let nameSpan = document.getElementById(`editassignname_${idParts[1]}_${idParts.slice(2).join('_')}`);
            if (nameSpan) {
                assignedTo.push(nameSpan.innerText.trim());
            }
        } else if (idParts.length === 2) {
            let nameSpan = document.getElementById(`editassignname_${idParts[1]}`);
            if (nameSpan) {
                assignedTo.push(nameSpan.innerText.trim());
            }
        }
    });

    return assignedTo;
};

/**
 * Adds a "more" button indicating the number of additional selected checkboxes.
 * @param {number} count - The total number of selected checkboxes.
 * @param {number} position - The left position of the "more" button.
 */
function editAddMoreButton(count, position) {
    let moreButton = document.createElement("button");
    moreButton.className = "moreButton";
    moreButton.style.left = `${position}px`;
    moreButton.innerText = `+${count}`;
    return moreButton;
};

/**
 * Renders categories for adding a new task to the DOM.
 * @param {Object} categories - An object containing categories.
 */
function editRenderAddTaskCategories(categories) {
    let categoryContainer = document.getElementById("edit-taskcategory");
    categoryContainer.innerHTML = '';

    for (let categoryKey in categories) {
        if (categories.hasOwnProperty(categoryKey)) {
            let category = categories[categoryKey];
            let categoryId = categoryKey;
            categoryContainer.innerHTML += /*html*/ `
            <div class="dropdown_selection" onclick="editDropdownSelectCategory(this)">
                <label class="label" id="${categoryId}">${category.task}
                <input class="checkbox" type="checkbox" id="edit-category_${categoryId}"></label>
            </div>
            `;
        }
    }
};

/**
 * Toggles the "selected_dropdown" class on the given element and toggles the associated checkbox state.
 * Ensures that only one checkbox within the "taskcategory" container can be selected at a time.
 * If the element is within the "taskcategory" container, it updates the checkbox state and loads the selected category into the input field.
 * 
 * @param {HTMLElement} element - The dropdown element that was clicked.
 */
function editDropdownSelectCategory(element) {
    if (element.closest("#edit-taskcategory")) {
        let categoryContainer = document.getElementById("edit-taskcategory");
        let checkboxes = categoryContainer.querySelectorAll(".checkbox");
        let clickedCheckbox = element.querySelector(".checkbox");
        let isChecked = clickedCheckbox.checked;

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest(".dropdown_selection").classList.remove("selected_dropdown");
            editCloseSelectCategory();
        });

        clickedCheckbox.checked = !isChecked;
        if (clickedCheckbox.checked) {
            element.classList.add("selected_dropdown");
        } else {
            element.classList.remove("selected_dropdown");
        }

        editLoadToCategoryInput();
    }
};

/**
 * Loads the selected category into the category input field.
 * This function finds the checked checkbox in the taskcategory container and updates
 * the taskcategory input field with the corresponding category label.
 */
function editLoadToCategoryInput() {
    let categoryContainer = document.getElementById("edit-taskcategory");
    let categoryInput = document.getElementById("edit-taskcategoryinput");
    let checkboxes = categoryContainer.querySelectorAll(".checkbox");

    categoryInput.value = '';

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            let labelElement = checkbox.closest(".dropdown_selection").querySelector(".label");
            if (labelElement) {
                categoryInput.value = labelElement.innerText;
            }
            break;
        }
    }
};

/**
 * Toggles the visibility of the category selection container.
 * If the container is currently visible, hides it; otherwise, shows it.
 */
function editSelectCategory() {
    let categoryContainer = document.getElementById('edit-taskcategory');
    let taskcategoryInput = document.getElementById('edit-taskcategoryinput');
    if (categoryContainer.style.display === 'block') {
        categoryContainer.style.display = 'none';
        taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
    } else {
        categoryContainer.style.display = 'block';
        taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop_down.png)';
    }
};

/**
 * Closes the category dropdown menu if it is currently open.
 */
function editCloseSelectCategory() {
    let categoryContainer = document.getElementById('edit-taskcategory');
    let taskcategoryInput = document.getElementById('edit-taskcategoryinput');
    if (categoryContainer.style.display === 'block') {
        categoryContainer.style.display = 'none';
    }
    taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
};

/**
 * Filters categories based on the entered text and updates the display.
 * @param {string} searchText - The entered text for filtering the categories.
 */
function editFilterCategories(searchText) {
    let categoryContainer = document.getElementById("edit-taskcategory");
    let categories = categoryContainer.querySelectorAll(".dropdown_selection");

    categories.forEach(category => {
        let label = category.querySelector(".label");
        let categoryName = label.innerText.toLowerCase();
        if (categoryName.includes(searchText.toLowerCase())) {
            category.style.display = "flex";
        } else {
            category.style.display = "none";
        }
    });
};

/**
 * Event handler for input in the category input field.
 */
function editHandleCategoryInput() {
    let searchInput = document.getElementById("edit-taskcategoryinput");
    let searchText = searchInput.value.trim();
    editFilterCategories(searchText);
};