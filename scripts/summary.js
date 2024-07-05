let amountTasksToDos = 0;
let amountTasksDone = 0;
let amountTasksUrgent = 0;
let amountTasksInBoard = 0;
let amountTasksInProgress = 0;
let amountTasksAwaitingFeedback = 0;
let earliestDeadline = null;

async function initializeSummary() {
    await determineTasksInBoard();
    await determineUrgentTasks();
    await determineDeadline();
    await determineTasksToDos();
    await determineTasksDone();
    await determineTasksInProgress();
    await determineTasksAwaitingFeedback();
    checkGreeting();
    renderSummary();
    loadName();
}


/** 
 * Fetches the data from firebase database which represents the const "BASE_URL". 
 * This function can be given a certian path="" as parameter. 
 * For instance loadData('/tasks') explicity returns the sub-category "tasks" from the database.
 * */
async function loadData(path = "") {
    let response = await fetch(BASE_URL + path + ".json");
    responseToJson = await response.json();
    responseToObject = Object.values(responseToJson);
    return responseToObject; 
}


/** 
 * Updates the global variable "amountTasksInBoard", which will later be required to render the summary html page. 
 * */
async function determineTasksInBoard() {
    let responseToObject = await loadData('tasks');
    amountTasksInBoard = responseToObject.length;
}


/** 
 * Counts all urgent tasks and updates the global variable "amountTaskUrgent", 
 * which will later be required to render the summary html page. 
 * */
async function determineUrgentTasks() {
    let responseToObject = await loadData('tasks');
    for (let i = 0; i < responseToObject.length; i++) {
        if (responseToObject[i].prio === "urgent") {
            amountTasksUrgent++;
        }
    }
}


async function determineTasksToDos() {
    let responseToObject = await loadData('tasks');
    for (let i = 0; i < responseToObject.length; i++) {
        if (responseToObject[i].status === "todo") {
            amountTasksToDos++;
        }
    }
}


async function determineTasksDone() {
    let responseToObject = await loadData('tasks');
    for (let i = 0; i < responseToObject.length; i++) {
        if (responseToObject[i].status === "done") {
            amountTasksDone++;
        }
    }
}


async function determineTasksInProgress() {
    let responseToObject = await loadData('tasks');
    for (let i = 0; i < responseToObject.length; i++) {
        if (responseToObject[i].status === "inprogress") {
            amountTasksInProgress++;
        }
    }
}


async function determineTasksAwaitingFeedback() {
    let responseToObject = await loadData('tasks');
    for (let i = 0; i < responseToObject.length; i++) {
        if (responseToObject[i].status === "awaitfeedback") {
            amountTasksAwaitingFeedback++;
        }
    }
}


/** 
 * Determines the earliest deadline of all urgent tasks. 
 * 
 * Per default this function sets the global variable "earliestDeadline" to "null" in order to avoid an error when sorting 
 * the date values from earliest to latest. 
 * 
 * If the global variale "earliestDeadline" remains "null" after fully iterating the for-loop to it's end, 
 * the "earliestDeadline" will indicate, that no urgent tasks exist and thus no urgent deadline exists. Otherwise, the "earliestDeadline"
 * will be formatted to an US-Date string.  
 * */
async function determineDeadline() {
    earliestDeadline = null;
    let responseToObject = await loadData('tasks');

    for (let i = 0; i < responseToObject.length; i++) {
        if (responseToObject[i].prio === "urgent") {
            let taskDueDate = new Date(responseToObject[i].duedate);

            if (earliestDeadline === null || taskDueDate < earliestDeadline) {
                earliestDeadline = taskDueDate;
            }
        }
    }

    if (earliestDeadline === null) {
        earliestDeadline = "No urgent deadlines";
    } else {
        earliestDeadline = earliestDeadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        await dateInPast(earliestDeadline);
    }
}


/**
 * Checks if the earliest deadline of all urgent tasks lies in the past. If so, the font is marked red. 
 * This is achieved by checking if the current date is smaller than the earliest deadline date.
 * @param {*} earliestDeadline Is the earliest deadline, which was determined in the function "determineDeadline()".
 */
async function dateInPast(earliestDeadline) {
    let actualDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (new Date(earliestDeadline) < new Date(actualDate)) {
        document.getElementById("summaryDeadline").classList.add("font-color-red");
    }
}


/** Checks if the user has been visited the summary page during log-in. 
 *  If so, the local storage key "greet" will be set to "no" and the good morning message will not be 
 *  displayed again when the user re-visits the summary page. 
 * */
function checkGreeting() {
    let greeter = document.getElementById("fade-out");
    if (localStorage.getItem('greet') === null) {
        summaryFadeOut();
        localStorage.setItem('greet', 'no');
    } else {
        greeter.style.transition = "none"; // Disable CSS transitions temporarily
        greeter.classList.add("d-none"); // Hide the element immediately
        setTimeout(function () { // Enables CSS transitions again after a short delay
            greeter.style.transition = "";
        }, 100);
    }
}

/**
 * Loads the user's name from the "fullname" element and updates the "summaryUserName" 
 * and "summaryUserNameResponsive" elements with the user's name.
 * If no name is available or the name is null, it defaults to "Guest".
 */
function loadName() {
    let userNameElement = document.getElementById("fullname");
    let userName = userNameElement ? userNameElement.textContent.trim() : null;
    if (!userName || userName === "null") {
        userName = "Guest";
    }

    let summaryUserName = document.getElementById("summaryUserName");
    let summarySignedInUserResponsive = document.getElementById('summaryUserNameResponsive');
    if (summaryUserName) {
        summaryUserName.innerHTML = userName;
    }

    if (summarySignedInUserResponsive) {
        summarySignedInUserResponsive.innerHTML = userName;
    }
}


/** Removes the key "greet" out of local storage. This function gets called when the user logs out.
 *  This function exists to assure that the welcome message gets triggered once the user logs in again.
 */
function removeGreetingKey() {
    localStorage.removeItem('greet');
}


/** Adds the class "fade-out" to the Good Morning div-container, which makes the container fade-out after two seconds. 
 * This function gets called during the "checkGreeting" function. 
 * */
function summaryFadeOut() {
    let greeter = document.getElementById("fade-out");
    setTimeout(function () {
        greeter.classList.add("fade-out");
        setTimeout(function () {
            greeter.classList.add("d-none");
        }, 800);
    }, 2000);
}

function renderSummary() {
    document.getElementById('summaryToDos').innerHTML = amountTasksToDos;
    document.getElementById('summaryDone').innerHTML = amountTasksDone;
    document.getElementById('summaryUrgent').innerHTML = amountTasksUrgent;
    document.getElementById('summaryDeadline').innerHTML = earliestDeadline;
    document.getElementById('summaryTasksInBoard').innerHTML = amountTasksInBoard;
    document.getElementById('summaryTasksInProgress').innerHTML = amountTasksInProgress;
    document.getElementById('summaryAwaitingFeedback').innerHTML = amountTasksAwaitingFeedback;

}


