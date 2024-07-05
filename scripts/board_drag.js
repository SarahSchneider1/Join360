// // Call the displayTasks function to fetch and display tasks
// displayTasks();

/**
 * Handles drag start event.
 * 
 * @function startDragging
 * @param {string} id - The ID of the task being dragged.
 */
function startDragging(id) {
    currentDraggedElement = id;
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
        } else {

        }
    } catch (error) {

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
};

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
};

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
};

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
};

/**
 * Resets the display property of all arrows.
 */
function resetAllArrows() {
    const allArrows = document.querySelectorAll('.arrowContainer #ArrowDrop, .arrowContainer #ArrowDropDown');
    allArrows.forEach(arrow => arrow.style.display = '');
};

/**
 * Hides the upward arrow in the "To Do" column.
 */
function hideUpArrowInToDo() {
    const todoColumn = document.getElementById('todo');
    if (todoColumn) {
        const upArrows = todoColumn.querySelectorAll('.arrowContainer #ArrowDrop');
        upArrows.forEach(arrow => arrow.style.display = 'none');
    }
};

/**
 * Hides the downward arrow in the "Done" column.
 */
function hideDownArrowInDone() {
    const doneColumn = document.getElementById('done');
    if (doneColumn) {
        const downArrows = doneColumn.querySelectorAll('.arrowContainer #ArrowDropDown');
        downArrows.forEach(arrow => arrow.style.display = 'none');
    }
};

/**
 * Calls the functions to hide arrows in the respective columns.
 */
function updateArrowVisibility() {
    resetAllArrows(); // Reset all arrows first
    hideUpArrowInToDo();
    hideDownArrowInDone();
};

/**
 * Creates and initializes a MutationObserver for a column.
 * 
 * @param {string} columnId - The ID of the column to observe
 * @param {Function} callback - The callback function to call on mutations
 */
function observeColumn(columnId, callback) {
    const column = document.getElementById(columnId);
    if (column) {
        const observer = new MutationObserver(callback);
        observer.observe(column, { childList: true, subtree: true });
    }
};

// Initialize observation for ToDo and Done columns
document.addEventListener('DOMContentLoaded', (event) => {
    observeColumn('todo', updateArrowVisibility);
    observeColumn('done', updateArrowVisibility);

    displayTasks().then(() => {
        updateArrowVisibility();
    });
});