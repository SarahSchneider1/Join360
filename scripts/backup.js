let priorityImages = {
    urgent: './assets/img/prio_alta.png',
    medium: './assets/img/prio_media.png',
    low: './assets/img/prio_baja.png'
};

let CategoryColors = {
    Finance: { background: '#FF7A00', color: '#FFFFFF' },
    IT: { background: '#FF5EB3', color: '#FFFFFF' },
    Sales: { background: '#6E52FF', color: '#FFFFFF' },
    HR: { background: '#9327FF', color: '#FFFFFF' },
    Marketing: { background: '#00BEE8', color: '#FFFFFF' },
    Operations: { background: '#1FD7C1', color: '#FFFFFF' },
    Product: { background: '#FF745E', color: '#FFFFFF' }
};

let tasks = [];
let subtaskStatus = {};
let activeSearch = false;
let i = 0;

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
    mediumButton();
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
function loadAddTaskContent() {
    let contentContainer = document.getElementById('add_task_dialog_content');
    if (!document.getElementById('addtask-content')) {
        fetch('./add_task.html')
            .then(response => response.text())
            .then(html => {
                let tempElement = document.createElement('div');
                tempElement.innerHTML = html;
                let addTaskContent = tempElement.querySelector('#addtask-content');
                if (addTaskContent) {
                    contentContainer.appendChild(addTaskContent);
                } else {
                    console.error('Could not find #addtask-content in the fetched HTML.');
                }
            })
            .catch(error => console.error('Error fetching add_task.html:', error));
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

    // Set the taskid as a data attribute on the TaskDetailsDialog element
    taskDetails.setAttribute('data-taskid', taskid);

    setTimeout(() => {
        popup.classList.remove('hidden');
        popup.classList.add('fade-in');
        taskDetails.classList.add('slide-in-right');
    }, 300);

    // Call the renderTaskDialog function to render the task details
    renderTaskDialog(taskid);
}


/**
 * Closes the dialog.
 */
function hidePopup(task, taskid, assignedNamesHTML, subtaskCountHTML, priorityImage, categoryColor) {
    const popup = document.getElementById('popup');
    const taskDetails = document.getElementById('TaskDetailsDialog');

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
 * Fetches data from Firebase.
 * 
 * @async
 * @function fetchData
 * @param {string} [path="tasks"] - The path in the Firebase database to fetch data from.
 * @returns {Promise<Object[]>} An array of task objects with their IDs.
 */
async function fetchData(path = "tasks") {
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    let responseToObject = Object.entries(responseToJson).map(([id, task]) => ({ id, ...task }));
    console.log(responseToJson);
    return responseToObject;
};

/**
 * Generates a random color excluding white.
 * 
 * @function generateRandomColor
 * @returns {string} A random color in hexadecimal format.
 */
function generateRandomColor() {
    let randomColor;
    do {
        randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } while (randomColor.toUpperCase() === '#FFFFFF');
    return randomColor;
};

/**
 * Generates HTML for assigned names with a 'Plus' button for overflow.
 * 
 * @function generateAssignedNamesHTML
 * @param {string[]} assignedNames - An array of names assigned to a task.
 * @returns {string} HTML string representing the assigned names.
 */
function generateAssignedNamesHTML(assignedNames) {
    let MAX_NAMES_DISPLAYED = 3;
    let position = 0;
    let html = '';
    let overflowCount = Math.max(0, assignedNames.length - MAX_NAMES_DISPLAYED);

    assignedNames.slice(0, MAX_NAMES_DISPLAYED).forEach(name => {
        let initials = name.split(' ').map(n => n[0]).join('');
        let randomColor = generateRandomColor();
        html += /*html*/`
            <div class="assignedName" style="background-color: ${randomColor};"><span>${initials}</span></div>`;
    });

    if (overflowCount > 0) {
        position += 110;
        html += /*html*/ `
            <div class="moreButtonBoard" style="left:${position}px">+${overflowCount}</div>`;
    }

    return html;
};

function generateSubtaskCountHTML(subtasks, isChecked) {
    let totalSubtasks = subtasks ? subtasks.length : 0;
    let completedSubtasks = subtasks ? subtasks.filter(subtask => subtask.completed).length : 0;

    // Calculate progress percentage based on total and completed subtasks
    let progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    let progressBarStyle = `width: ${progressPercentage}%;`;
    let count = `${completedSubtasks}/${totalSubtasks} Subtask${totalSubtasks !== 1 ? 's' : ''}`;

    // Display progress bar and count only if there are subtasks or if the checkbox is checked
    if (totalSubtasks > 0 || isChecked) {
        let progressBarHTML = `<progress value="${progressPercentage}" max="100"></progress>`;
        return `<div id="subtaskProgress" class="subtaskProgress">${progressBarHTML}<p class="subtaskCount">${count}</p></div>`;
    } else {
        // If there are no subtasks and checkbox is not checked, return an empty string
        return '';
    }
}

function updateSubtaskHTML() {
    let checkbox = document.getElementById('myCheckbox');
    let isChecked = checkbox.checked;

    let subtasks = [
        { completed: true },
        { completed: false },
        { completed: true }
        // Add more subtasks as needed
    ];

    let subtaskHTML = generateSubtaskCountHTML(subtasks, isChecked);
    document.getElementById('subtaskContainer').innerHTML = subtaskHTML;
}

/**
 * Creates a task element.
 * 
 * @function createTaskElement
 * @param {Object} task - The task object.
 * @returns {string} HTML string representing the task element.
 */
function createTaskElement(task, search) {
    let taskid = task.id; // Use the task ID from Firebase
    let assignedNamesHTML = generateAssignedNamesHTML(task.assignto || []);
    let subtaskCountHTML = generateSubtaskCountHTML(task.subtask || []);
    let priorityImage = priorityImages[task.prio] || './assets/img/prio_media.png';
    let categoryColor = CategoryColors[task.category] || { background: '#000000', color: '#FFFFFF' };
    let descriptionSection = task.description ? `<p class="descriptionBox">${task.description}</p>` : '';

    if (shouldCreateTaskElement(task, assignedNamesHTML, search)) {
        setTimeout(checkEmptyTaskContainers, 0); //Warum ein Timeout?
        return createTaskHTML(task, taskid, assignedNamesHTML, subtaskCountHTML, priorityImage, categoryColor, descriptionSection);
    }
    setTimeout(checkEmptyTaskContainers, 0);
    return '';
};

/**
 * Creates the HTML string for a task element.
 * 
 * @param {Object} task - The task object containing details like title and category.
 * @param {string} taskid - The unique ID of the task element.
 * @param {string} assignedNamesHTML - HTML string representing assigned names.
 * @param {string} subtaskCountHTML - HTML string representing subtask count and progress.
 * @param {string} priorityImage - URL of the priority image associated with the task.
 * @param {Object} categoryColor - Object containing background and text color for the category button.
 * @param {string} descriptionSection - Optional HTML string for the task description.
 * @returns {string} HTML string representing the task element.
 */
function createTaskHTML(task, taskid, assignedNamesHTML, subtaskCountHTML, priorityImage, categoryColor, descriptionSection) {
    return /*html*/`
        <div id="${taskid}" draggable="true" ondragstart="startDragging('${taskid}')" class="toDoBox" onclick="showPopup('${taskid}')">
            <div class="taskHeader">
                <button class="CategoryBox" style="background-color: ${categoryColor.background};">${task.category}</button>
                    <div class="arrowContainer">
                        <svg id="ArrowDrop" class="arrow" onclick="moveTaskUp(event)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z"/>
                        </svg>
                        <svg id="ArrowDropDown" class="arrow" onclick="moveTaskDown(event)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z"/>
                        </svg>
                    </div>
            </div>


            <p class="HeadlineBox">${task.title}</p>
            ${descriptionSection}
            ${subtaskCountHTML} <!-- Insert subtask count HTML here -->
            <div class="nameSection">
                ${assignedNamesHTML}
                <div class="prioImgContainer">
                    <img class="prioImg" src="${priorityImage}" alt="Priority">
                </div>
            </div>
        </div>
    `;
};

/**
 * Categorizes tasks into their respective status categories.
 * 
 * @function categorizeTasks
 * @param {Object[]} tasks - An array of task objects.
 * @returns {Object} An object containing categorized tasks as HTML strings.
 */
function categorizeTasks(tasks, search) {
    let categorizedTasks = {
        todo: '',
        inprogress: '',
        awaitfeedback: '',
        done: ''
    };

    tasks.forEach(task => {
        let taskHTML = createTaskElement(task, search);

        switch (task.status) {
            case 'todo':
                categorizedTasks.todo += taskHTML;
                break;
            case 'inprogress':
                categorizedTasks.inprogress += taskHTML;
                break;
            case 'awaitfeedback':
                categorizedTasks.awaitfeedback += taskHTML;
                break;
            case 'done':
                categorizedTasks.done += taskHTML;
                break;
            default:
                console.warn(`Unknown task status: ${task.status}`);
        }
    });

    return categorizedTasks;
};

/**
 * Inserts categorized tasks into the DOM.
 * 
 * @function insertTasksIntoDOM
 * @param {Object} categorizedTasks - An object containing categorized tasks as HTML strings.
 */
function insertTasksIntoDOM(categorizedTasks) {
    document.querySelector('#todo .tasks').innerHTML = categorizedTasks.todo;
    document.querySelector('#inprogress .tasks').innerHTML = categorizedTasks.inprogress;
    document.querySelector('#awaitfeedback .tasks').innerHTML = categorizedTasks.awaitfeedback;
    document.querySelector('#done .tasks').innerHTML = categorizedTasks.done;
    document.getElementById('todo').classList.remove('drag-area-highlight');
    document.getElementById('inprogress').classList.remove('drag-area-highlight');
    document.getElementById('awaitfeedback').classList.remove('drag-area-highlight');
    document.getElementById('done').classList.remove('drag-area-highlight');
}

/**
 * Fetches tasks, categorizes them, and inserts them into the DOM.
 * 
 * @async
 * @function displayTasks
 */
async function displayTasks(search) {
    try {
        let tasks = await fetchData();
        let categorizedTasks = categorizeTasks(tasks, search);
        insertTasksIntoDOM(categorizedTasks, search);
    } catch (error) {
        console.error('Error fetching and displaying tasks:', error);
    }
};

// Call the displayTasks function to fetch and display tasks
displayTasks();

/**
 * Handles drag start event.
 * 
 * @function startDragging
 * @param {string} id - The ID of the task being dragged.
 */
function startDragging(id) {
    currentDraggedElement = id;
    console.log(`Started dragging task with id: ${id}`);
};

/**
 * Allows drop event.
 * 
 * @function allowDrop
 * @param {DragEvent} event - The drag event.
 */
function allowDrop(event) {
    event.preventDefault();
};

/**
 * Handles drop event and updates the task status.
 * 
 * @async
 * @function moveTo
 * @param {string} newStatus - The new status of the task.
 */
async function moveTo(newStatus) {
    if (currentDraggedElement) {
        await updateTaskStatus(currentDraggedElement, newStatus);
        searchTask(); // Refresh the task display after status update via searchTask(), previously displayTasks() was used.
    }
};

/**
 * Updates the status of a task in Firebase.
 * 
 * @async
 * @function updateTaskStatus
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status to set for the task.
 */
async function updateTaskStatus(taskId, newStatus) {
    try {
        // Fetch current tasks from Firebase
        let response = await fetch(BASE_URL + "tasks.json");
        let tasksObject = await response.json();

        // Find the task by id and update its status
        if (tasksObject[taskId]) {
            tasksObject[taskId].status = newStatus;

            // Update tasks in Firebase
            await fetch(BASE_URL + "tasks.json", {
                method: 'PATCH',
                body: JSON.stringify({ [taskId]: tasksObject[taskId] }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Task status successfully updated');
        } else {
            console.error('Task not found');
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
};

/**
 * Adds a highlight class to an element with the given ID.
 * 
 * This function selects an HTML element by its ID and adds the 'drag-area-highlight' 
 * class to it, which can be used to apply specific styles defined in CSS.
 * 
 * @param {string} id - The ID of the element to highlight.
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
};

/**
 * Removes a highlight class from an element with the given ID.
 * 
 * This function selects an HTML element by its ID and removes the 'drag-area-highlight' 
 * class from it, which can be used to remove specific styles defined in CSS.
 * 
 * @param {string} id - The ID of the element to remove the highlight from.
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
};

/**
 * Fetches task data from an external data source.
 * @returns {Promise<Array>} An array of tasks.
 */
async function fetchTaskData() {
    try {
        return await fetchData();
    } catch (error) {
        console.error('Error fetching task data:', error);
        throw error;
    }
}

/**
 * Finds the selected task from the provided tasks based on its ID.
 * @param {Array} tasks - An array of tasks.
 * @param {string} taskid - The ID of the task to find.
 * @returns {Object|null} The selected task if found, otherwise null.
 */
function findSelectedTask(tasks, taskid) {
    return tasks.find(item => item.id === taskid);
}

/**
 * Extracts and returns the relevant task data from the selected task object.
 * @param {Object} selectedTask - The selected task object.
 * @returns {Object} Extracted task data.
 */
function extractTaskData(selectedTask) {
    const { assignto = [], subtask = [], prio, category, description, title, duedate } = selectedTask;
    return { assignto, subtask, prio, category, description, title, duedate };
}

/**
 * Generates HTML content for the task details.
 * @param {Array} assignto - The list of assigned users.
 * @param {Array} subtasks - The list of subtasks.
 * @returns {Object} HTML content for task details.
 */
function generateHTMLContent(assignto, subtasks) {
    const assignedNamesHTML = generateAssignedNamesHTML(assignto);
    const assigntoHTML = assignto.map(name => ``).join('');

    const generateInitialsAndNameHTML = (names) => {
        return names.map(name => {
            const initials = name.split(' ').map(word => word[0]).join('');
            const randomColor = generateRandomColor();
            return `
                <div class="assignedtoDialogInitials">
                    <p class="assignedName" style="background-color: ${randomColor};">${initials}</p>
                    <p>${name}</p>
                </div>
            `;
        }).join('');
    };

    const assignedNamesHTMLSeparated = generateInitialsAndNameHTML(assignto);

    const subtaskHTML = subtasks.map((task, index) => `
        <div class="subtaskItem">
            <input id="subtask-${index}" type="checkbox" ${subtaskStatus[task] ? 'checked' : ''} onchange="updateSubtaskStatus('${index}', this.checked)">
            <p>${task}</p>
        </div>
    `).join('');

    return { assignedNamesHTML, assigntoHTML, assignedNamesHTMLSeparated, subtaskHTML };
}

/**
 * Updates the subtask status and progress bar.
 * @param {string} task - The name of the subtask.
 * @param {boolean} isChecked - The checked status of the subtask.
 */
function updateSubtaskStatus(task, isChecked) {
    subtaskStatus[task] = isChecked;

    // Update the progress bar
    const progressBarContainer = document.getElementById('subtaskProgressContainer');
    if (progressBarContainer) {
        progressBarContainer.innerHTML = generateSubtaskCountHTML(Object.keys(subtaskStatus));
    }
}


/**
 * Processes the details of the selected task.
 * @param {Object} selectedTask - The selected task object.
 * @returns {Object} Processed task details.
 */
async function processTaskDetails(selectedTask) {
    const taskData = extractTaskData(selectedTask);
    const htmlContent = generateHTMLContent(taskData.assignto, taskData.subtask);
    return formatTaskDetails(taskData, htmlContent);
}

/**
 * Generates a random color excluding white.
 * 
 * @function generateRandomColor
 * @returns {string} A random color in hexadecimal format.
 */
function generateRandomColor() {
    let randomColor;
    do {
        randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    } while (randomColor.toUpperCase() === '#FFFFFF');
    return randomColor;
}


/**
 * Formats the task details including dates and category colors.
 * @param {Object} taskData - The extracted task data.
 * @param {Object} htmlContent - The generated HTML content.
 * @returns {Object} Formatted task details.
 */
function formatTaskDetails(taskData, htmlContent) {
    const { prio, category, description, title, duedate } = taskData;
    const priorityImage = priorityImages[prio] || './assets/img/prio_media.png';
    const categoryColor = CategoryColors[category] || { background: '#000000', color: '#FFFFFF' };

    const dueDateObj = new Date(duedate);
    const formattedDueDate = dueDateObj.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return {
        category,
        categoryColor,
        title,
        description,
        formattedDueDate,
        prio,
        priorityImage,
        ...htmlContent
    };
}



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
}

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
}

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
}


/**
 * Renders the task dialog based on the provided task ID.
 * @param {string} taskid - The ID of the task to render the dialog for.
 * @returns {void}
 */
async function renderTaskDialog(taskid, subtaskid) {
    try {
        const tasks = await fetchTaskData();
        const selectedTask = findSelectedTask(tasks, taskid);
        if (!selectedTask) {
            return;
        }

        const taskDetails = await processTaskDetails(selectedTask);
        renderTaskElements(taskDetails);
    } catch (error) {
        console.error('Error rendering task dialog:', error);
        handleError(error);
    }
}

/**
 * Handles errors that occur during rendering of the task dialog.
 * @param {Error} error - The error object.
 * @returns {void}
 */
function handleError(error) {
    console.error('Error rendering task dialog:', error);
}


function searchTask() {
    let search = document.getElementById('search').value;
    search = search.toLowerCase();

    if (search === '') {
        activeSearch = false;
        displayTasks(search);
    } if (search.length > 3) {
        activeSearch = true;
        displayTasks(search);
    } else {
        return;
    }
}


function shouldCreateTaskElement(task, assignedNamesHTML, search) {
    if (activeSearch) {
        return checkSearchInput(task, assignedNamesHTML, search);
    }
    return true;
}


function checkSearchInput(task, assignedNamesHTML, search) {
    return assignedNamesHTML.toLowerCase().includes(search) ||
        (task.description && task.description.toLowerCase().includes(search)) ||
        task.title.toLowerCase().includes(search);
}


function openEditTask() {
    let content = document.getElementById('editTaskOverlay');

    content.classList.remove('hidden');
}


function addEmptyMessage(container, text) {
    if (container.children.length === 0) {
        let p = document.createElement('p');
        p.textContent = text;
        p.className = 'empty-text';
        container.appendChild(p);
    }
}


function checkEmptyTaskContainers() {
    let container1 = document.getElementById('to-do-tasks-container');
    let container2 = document.getElementById('in-progress-tasks-container');
    let container3 = document.getElementById('await-feedback-tasks-container');
    let container4 = document.getElementById('done-tasks-container');

    addEmptyMessage(container1, 'No tasks To do');
    addEmptyMessage(container2, 'No tasks In progress');
    addEmptyMessage(container3, 'No tasks Await feedback');
    addEmptyMessage(container4, 'No tasks Done');
}

/**
 * Moves the task up in the task list.
 * 
 * @param {Event} event - The event object.
 */
function moveTaskUp(event) {
    event.stopPropagation();
    const taskElement = event.target.closest('.toDoBox');
    const taskId = taskElement.id;
    const currentStatus = taskElement.closest('.statusTasks').id;
    const newStatus = getPreviousStatus(currentStatus);

    if (newStatus) {
        updateTaskStatus(taskId, newStatus).then(() => {
            searchTask();
            updateArrowVisibility(); // Update arrow visibility after task is moved
        });
    }
}

/**
 * Moves the task down in the task list.
 * 
 * @param {Event} event - The event object.
 */
function moveTaskDown(event) {
    event.stopPropagation();
    const taskElement = event.target.closest('.toDoBox');
    const taskId = taskElement.id;
    const currentStatus = taskElement.closest('.statusTasks').id;
    const newStatus = getNextStatus(currentStatus);

    if (newStatus) {
        updateTaskStatus(taskId, newStatus).then(() => {
            searchTask();
            updateArrowVisibility(); // Update arrow visibility after task is moved
        });
    }
}

/**
 * Gets the previous status in the task workflow.
 * 
 * @param {string} currentStatus - The current status of the task.
 * @returns {string|null} The previous status or null if there is no previous status.
 */
function getPreviousStatus(currentStatus) {
    const statuses = ['todo', 'inprogress', 'awaitfeedback', 'done'];
    const currentIndex = statuses.indexOf(currentStatus);

    return currentIndex > 0 ? statuses[currentIndex - 1] : null;
}

/**
 * Gets the next status in the task workflow.
 * 
 * @param {string} currentStatus - The current status of the task.
 * @returns {string|null} The next status or null if there is no next status.
 */
function getNextStatus(currentStatus) {
    const statuses = ['todo', 'inprogress', 'awaitfeedback', 'done'];
    const currentIndex = statuses.indexOf(currentStatus);

    return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
}

/**
 * Resets the display property of all arrows.
 */
function resetAllArrows() {
    const allArrows = document.querySelectorAll('.arrowContainer #ArrowDrop, .arrowContainer #ArrowDropDown');
    allArrows.forEach(arrow => arrow.style.display = '');
}

/**
 * Hides the upward arrow in the "To Do" column.
 */
function hideUpArrowInToDo() {
    const todoColumn = document.getElementById('todo');
    if (todoColumn) {
        const upArrows = todoColumn.querySelectorAll('.arrowContainer #ArrowDrop');
        upArrows.forEach(arrow => arrow.style.display = 'none');
    }
}

/**
 * Hides the downward arrow in the "Done" column.
 */
function hideDownArrowInDone() {
    const doneColumn = document.getElementById('done');
    if (doneColumn) {
        const downArrows = doneColumn.querySelectorAll('.arrowContainer #ArrowDropDown');
        downArrows.forEach(arrow => arrow.style.display = 'none');
    }
}

/**
 * Calls the functions to hide arrows in the respective columns.
 */
function updateArrowVisibility() {
    resetAllArrows(); // Reset all arrows first
    hideUpArrowInToDo();
    hideDownArrowInDone();
}

// Call this function after rendering the tasks
displayTasks().then(() => {
    updateArrowVisibility();
});


// EDIT TASK

function openEditTask() {
    const taskId = getCurrentTaskId();
    if (!taskId) {
        console.error('Task-ID fehlt');
        return;
    }

    fetch(`${BASE_URL}tasks/${taskId}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(task => {
            if (!task) {
                throw new Error('Task nicht gefunden');
            }

            console.log('Geladene Task-Details:', task);

            // Setze die Werte in die Editierfelder
            document.getElementById('HeadlineBox').value = task.title || '';
            document.getElementById('description').value = task.description || '';
            document.getElementById('assignedtoinput').value = (task.assignto || []).join(', ') || '';
            document.getElementById('duedate').value = task.duedate || '';
            document.getElementById('priobuttons').value = task.prio || '';

            // Zeige das Editierfenster
            document.getElementById('editTaskOverlay').classList.remove('hidden');
        })
        .catch(error => {
            console.error('Fehler beim Laden der Task-Details:', error);
            alert('Fehler beim Laden der Task-Details: ' + error.message);
        });
}

// Funktion zum Schließen des Editierfensters
function closeEditTask() {
    document.getElementById('editTaskOverlay').classList.add('hidden');
}


function editTask() {
    // Get the task ID from the task details dialog
    const taskId = document.getElementById('TaskDetailsDialog').getAttribute('data-taskid');

    // Get the updated values from the form
    const updatedTask = {
        title: document.getElementById('tasktitle').value,
        description: document.getElementById('description').value,
        assignto: document.getElementById('assignedtoinput').value.split(',').map(name => name.trim()),
        duedate: document.getElementById('duedate').value,
        prio: document.getElementById('priobuttons').value
    };



    // Save the updated task to the database or state
    fetch(`${BASE_URL}tasks/${taskId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTask)
    })
        .then(response => response.json())
        .then(() => {
            // Hide the edit task overlay
            document.getElementById('editTaskOverlay').classList.add('hidden');

            // Refresh the task list to show the updated task details
            displayTasks();
        })
        .catch(error => console.error('Error updating task:', error));
}

function getCurrentTaskId() {
    return document.getElementById('TaskDetailsDialog').getAttribute('data-taskid');
}


function editTaskSlideOutToRight() {
    document.getElementById('editTaskOverlay').classList.add('hidden');
}

// Funktion zum Anzeigen der Task-Details und Setzen der Task-ID
function showTaskDetails(task) {
    const taskDetailsDialog = document.getElementById('TaskDetailsDialog');
    taskDetailsDialog.setAttribute('data-taskid', task.id);

    // Zeige das Popup
    document.getElementById('popup').classList.remove('hidden');
    renderEditTask(task);
}


// Funktion, um die aktuelle Task-ID zu holen
function getCurrentTaskId() {
    return document.getElementById('TaskDetailsDialog').getAttribute('data-taskid');
}
