/**
 * Toggles the visibility of the assign-to selection container.
 * If the container is currently visible, hides it; otherwise, shows it.
 */
function selectAssignTo() {
    let assignToContainer = document.getElementById('assignedto');
    let assignToInput = document.getElementById('assignedtoinput');
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
function closeAssignTo() {
    let assignToContainer = document.getElementById('assignedto');
    let assignToInput = document.getElementById('assignedtoinput');
    if (assignToContainer.style.display === 'block') {
        assignToContainer.style.display = 'none';
    }
    assignToInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
};

/**
 * Creates a button for a selected checkbox.
 * @param {Element} checkbox - The checkbox element.
 * @param {number} position - The left position of the button.
 */
function createButton(checkbox, position) {
    let initials = checkbox.getAttribute("data-initials");
    let color = checkbox.getAttribute("data-color");
    let checkboxId = checkbox.id;
    let button = document.createElement("button");
    button.className = "selectedAssignTo";
    button.id = `selected_${checkboxId}`;
    button.style.backgroundColor = color;
    button.style.left = `${position}px`;
    button.innerText = initials;
    return button;
};

/**
 * Adds a "more" button indicating the number of additional selected checkboxes.
 * @param {number} count - The total number of selected checkboxes.
 * @param {number} position - The left position of the "more" button.
 */
function addMoreButton(count, position) {
    let moreButton = document.createElement("button");
    moreButton.className = "moreButton";
    moreButton.style.left = `${position}px`;
    moreButton.innerText = `+${count}`;
    return moreButton;
};

/**
 * Updates the selectedAssignTo div with buttons representing the selected names.
 * This function goes through all checkboxes with the class "checkbox" and, if checked,
 * creates a button with the initials and color associated with the checkbox.
 */
function loadSelectedAssignTo() {
    let selectedAssignToDiv = document.getElementById("selectedAssignTo");
    let checkboxes = document.querySelectorAll("#assignedto .checkbox");
    let buttonContainer = document.getElementById("selectedAssignTo")

    selectedAssignToDiv.innerHTML = '';
    let position = 0;
    let count = 0;

    checkboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            count++;
            if (count <= 3) {
                let button = createButton(checkbox, position);
                selectedAssignToDiv.appendChild(button);
                position += 32; // Adjust this value to control the overlap
                buttonContainer.style.display = 'inline-block'
            }
        }
    });

    if (count > 3) {
        let moreButton = addMoreButton(count - 3, position);
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
function dropdownSelectAssignTo(element) {
    element.classList.toggle("selected_dropdown");
    if (element.closest("#assignedto")) {
        let checkbox = element.querySelector(".checkbox");

        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            loadSelectedAssignTo();
        }
    }
};

/**
 * Renders categories for adding a new task to the DOM.
 * @param {Object} categories - An object containing categories.
 */
function renderAddTaskCategories(categories) {
    let categoryContainer = document.getElementById("taskcategory");
    categoryContainer.innerHTML = '';

    for (let categoryKey in categories) {
        if (categories.hasOwnProperty(categoryKey)) {
            let category = categories[categoryKey];
            let categoryId = categoryKey;
            categoryContainer.innerHTML += /*html*/ `
            <div class="dropdown_selection" onclick="dropdownSelectCategory(this)">
                <label class="label">${category.task}</label>
                <input class="checkbox" type="checkbox" id="category_${categoryId}">
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
function dropdownSelectCategory(element) {
    if (element.closest("#taskcategory")) {
        let categoryContainer = document.getElementById("taskcategory");
        let checkboxes = categoryContainer.querySelectorAll(".checkbox");
        let clickedCheckbox = element.querySelector(".checkbox");
        let isChecked = clickedCheckbox.checked;

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest(".dropdown_selection").classList.remove("selected_dropdown");
            closeSelectCategory();
        });

        clickedCheckbox.checked = !isChecked;
        if (clickedCheckbox.checked) {
            element.classList.add("selected_dropdown");
        } else {
            element.classList.remove("selected_dropdown");
        }

        loadToCategoryInput();
    }
};

/**
 * Loads the selected category into the category input field.
 * This function finds the checked checkbox in the taskcategory container and updates
 * the taskcategory input field with the corresponding category label.
 */
function loadToCategoryInput() {
    let categoryContainer = document.getElementById("taskcategory");
    let categoryInput = document.getElementById("taskcategoryinput");
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
function selectCategory() {
    let categoryContainer = document.getElementById('taskcategory');
    let taskcategoryInput = document.getElementById('taskcategoryinput');
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
function closeSelectCategory() {
    let categoryContainer = document.getElementById('taskcategory');
    let taskcategoryInput = document.getElementById('taskcategoryinput');
    if (categoryContainer.style.display === 'block') {
        categoryContainer.style.display = 'none';
    }
    taskcategoryInput.style.backgroundImage = 'url(./assets/img/arrow_drop.png)';
};

/**
 * Filters categories based on the entered text and updates the display.
 * @param {string} searchText - The entered text for filtering the categories.
 */
function filterCategories(searchText) {
    let categoryContainer = document.getElementById("taskcategory");
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
function handleCategoryInput() {
    let searchInput = document.getElementById("taskcategoryinput");
    let searchText = searchInput.value.trim();
    filterCategories(searchText);
};

/**
 * Prevents event propagation.
 * @param {Event} event - The event object.
 */
function closeOnBackground(event) {
    event.stopPropagation();
};