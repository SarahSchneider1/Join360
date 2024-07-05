/**
 * Opens the dialog by removing the 'd_none' class and ensures CSS and content are loaded.
 */
function openDialog() {
    if (window.innerWidth <= 750) {
        closeDialog();
        window.location.href = './add_task.html';
        return;
    }

    let dialog = document.getElementById('dialog');
    let dialogslide = document.getElementById('add_task_dialog_content');
    let content = document.getElementById('addtask-content');
    setTimeout(() => {
        dialogslide.classList.add('slide-in-right');
        dialog.classList.remove('d_none');
    }, 300);
    ensureCssLoaded();
    addTaskLoadNames();
    content.classList.remove('addtask-content');
    content.classList.add('addtask-content-dialog');
    clearContent();
};

/**
 * Closes the dialog by adding the 'd_none' class.
 */
function closeDialog() {
    let dialog = document.getElementById('dialog');
    let dialogslide = document.getElementById('add_task_dialog_content');
    dialogslide.classList.add('slide-out-right');
    setTimeout(() => {
        dialogslide.classList.remove('slide-in-right')
        dialogslide.classList.remove('slide-out-right');
        dialog.classList.add('d_none');
    }, 300);
};

/**
 * Prevents event propagation when clicking on the background.
 * 
 * @param {Event} event - The event object.
 */
function closeOnBackground(event) {
    event.stopPropagation();
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
 * Loads the content of 'add_task.html' into the dialog if it hasn't been loaded yet.
 */
async function loadAddTaskContent() {
    let contentContainer = document.getElementById('add_task_dialog_content');
    if (!document.getElementById('addtask-content')) {
        await fetch('./add_task.html')
            .then(response => response.text())
            .then(html => {
                let tempElement = document.createElement('div');
                tempElement.innerHTML = html;
                let addTaskContent = tempElement.querySelector('#addtask-content');
                if (addTaskContent) {
                    contentContainer.appendChild(addTaskContent);
                }
            })
    }
};

/**
 * Loads the content of 'add_task.html' into the dialog if it hasn't been loaded yet.
 */
async function loadEditTaskContent() {
    let contentContainer = document.getElementById('edit_task_dialog_content');
    if (!document.getElementById('edittask-content')) {
        await fetch('./edit_task.html')
            .then(response => response.text())
            .then(html => {
                let tempElement = document.createElement('div');
                tempElement.innerHTML = html;
                let addTaskContent = tempElement.querySelector('#edittask-content');
                if (addTaskContent) {
                    contentContainer.appendChild(addTaskContent);
                }
            })
    }
};

/**
 * Open the dialog for TaskDetails.
 * 
 * @param {string} taskid - The unique ID of the task element.
 */
function showPopup(taskid) {
    const popup = document.getElementById('popup');
    const taskDetails = document.getElementById('TaskDetailsDialog');

    taskDetails.setAttribute('data-taskid', taskid);

    setTimeout(() => {
        popup.classList.remove('hidden');
        popup.classList.add('fade-in');
        taskDetails.classList.add('slide-in-right');
    }, 300);

    renderTaskDialog(taskid);
};

/**
 * Closes the dialog.
 */
function hidePopup(task, taskid, assignedNamesHTML, subtaskCountHTML, priorityImage, categoryColor) {
    const popup = document.getElementById('popup');
    const taskDetails = document.getElementById('TaskDetailsDialog');

    taskDetails.setAttribute('data-taskid', taskid);
    taskDetails.classList.remove('slide-in-right');
    taskDetails.classList.add('slide-out-right');
    popup.classList.remove('fade-in');
    popup.classList.add('fade-out');

    setTimeout(() => {
        popup.classList.add('hidden');
        popup.classList.remove('fade-out');
        taskDetails.classList.remove('slide-out-right');
    }, 800);

    let taskDetailsDialog = document.getElementById('TaskDetailsDialog');
    taskDetailsDialog = "";
};

/**
 * Renders the task dialog based on the provided task ID.
 * @param {string} taskid - The ID of the task to render the dialog for.
 * @returns {void}
 */
async function renderTaskDialog(taskid, subtaskid) {
    try {
        const tasks = await fetchData();
        const selectedTask = findSelectedTask(tasks, taskid);
        if (!selectedTask) {
            return;
        }

        const taskDetails = await processTaskDetails(selectedTask);
        renderTaskElements(taskDetails);
    } catch (error) {
    }
};

/**
 * Renders HTML elements with processed task details.
 * @param {Object} taskDetails - Processed task details.
 * @returns {void}
 */
function renderTaskElements(taskDetails) {
    const {
        category,
        categoryColor,
        title,
        description,
        formattedDueDate,
        prio,
        priorityImage,
        assignedNamesHTMLSeparated,
        assigntoHTML,
        subtaskHTML
    } = taskDetails;

    updateCategoryBox(category, categoryColor);
    updateTaskDetails(title, description, formattedDueDate, prio, priorityImage, assignedNamesHTMLSeparated, assigntoHTML, subtaskHTML);
};

/**
 * Updates the category box in the task dialog.
 * @param {string} category - The category of the task.
 * @param {Object} categoryColor - The color object for the category.
 * @returns {void}
 */
function updateCategoryBox(category, categoryColor) {
    const categoryBox = document.getElementById('CategoryBox');
    categoryBox.innerText = category;
    categoryBox.style.backgroundColor = categoryColor.background;
};

/**
 * Updates the task details in the task dialog.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} formattedDueDate - The formatted due date of the task.
 * @param {string} prio - The priority of the task.
 * @param {string} priorityImage - The image URL for the task priority.
 * @param {string} assignedNamesHTMLSeparated - HTML string for assigned names.
 * @param {string} assigntoHTML - HTML string for assigned task.
 * @param {string} subtaskHTML - HTML string for subtasks.
 * @returns {void}
 */
function updateTaskDetails(title, description, formattedDueDate, prio, priorityImage, assignedNamesHTMLSeparated, assigntoHTML, subtaskHTML) {
    const headline = document.getElementById('HeadlineBox');
    const descriptionDetails = document.getElementById('descriptionDetails');
    const dueDate = document.getElementById('dueDate');
    const priority = document.getElementById('Priority');
    const priorityImg = document.getElementById('PriorityImg');
    const assignedInitials = document.getElementById('assignedInitials');
    const assignedName = document.getElementById('assignedName');
    const subtaskContainer = document.getElementById('subtaskDialogText');

    headline.innerText = title;
    dueDate.innerText = formattedDueDate;
    priority.innerText = prio;
    priorityImg.src = priorityImage;
    assignedInitials.innerHTML = assignedNamesHTMLSeparated;
    assignedName.innerHTML = assigntoHTML;
    subtaskContainer.innerHTML = subtaskHTML;

    // Check if description is provided before setting its value
    if (description) {
        descriptionDetails.innerText = description;
    } else {
        // If description is empty or null, hide or clear the element
        descriptionDetails.innerText = ''; // or descriptionDetails.style.display = 'none'; to hide
    }
};