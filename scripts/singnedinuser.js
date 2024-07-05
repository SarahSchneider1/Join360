const BASE_URL = "https://join-874af-default-rtdb.europe-west1.firebasedatabase.app/"

const publicPages = ['index.html', 'privacy_policy.html', 'legal_notice.html', 'signup.html', 'help.html'];

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBfxQv2PaiAUdGLxezs5fuZPsiPrXhN3V8",
    authDomain: "join-874af.firebaseapp.com",
    databaseURL: "https://join-874af-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-874af",
    storageBucket: "join-874af.appspot.com",
    messagingSenderId: "620844452653",
    appId: "1:620844452653:web:e9b8c3382e6d8fdb5a61a4",
  };

// Initialize Firebase
let app = initializeApp(firebaseConfig);
let auth = getAuth();
let user = auth.currentUser;

/**
 * Fetches user data based on the provided email address and renders the user's name.
 * @param {string} email - The email address of the user.
 * @returns {Promise<void>}
 */
async function fetchUserData(email) {
    try {
        let response = await fetch(BASE_URL + ".json");
        let data = await response.json();
        let userNameData = findNameByEmail(data.names, email);
        if (userNameData) {
            renderUserName(userNameData.name);
        }
    } catch (error) {

    }
};

/**
 * Finds a user's name based on their email address.
 * @param {Object} names - The object containing user data.
 * @param {string} email - The email address to search for.
 * @returns {Object|null} The user's data if found, otherwise null.
 */
function findNameByEmail(names, email) {
    for (let key in names) {
        if (names[key].email === email) {
            return names[key];
        }
    }
    return null;
};

/**
 * Renders the user's name in the DOM.
 * @param {string|null} name - The user's name. If null, displays 'GS'.
 */
function renderUserName(name) {
    let userHTML = generateNameUserblock(name);
    renderNameToUserblock(userHTML);
};

/**
 * Renders the generated HTML for the user's name to the user block element.
 * @param {string} userHTML - The HTML string representing the user's name.
 */
function renderNameToUserblock(userHTML) {
    let userBlock = document.getElementById("userblock");
    userBlock.innerHTML = userHTML;
};

/**
 * Generates HTML for displaying the user's initials or 'Guest' if the name is null.
 * @param {string|null} name - The user's name. If null, displays 'Guest'.
 * @returns {string} The generated HTML string.
 */
function generateNameUserblock(name) {
    let firstInitial, lastInitial;
    if (name) {
        let nameParts = name.split(' ');
        firstInitial = nameParts[0].charAt(0).toUpperCase();
        lastInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : '';
    } else {
        firstInitial = 'G';
        lastInitial = '';
        name = 'Guest';
    }
    return /*html*/ `
        <button class="shortname"><h4 id="fullname" style="display: none;">${name}</h4><h2>${firstInitial}${lastInitial}</h2></button>
    `;
};

//  * Monitors Firebase authentication state changes and fetches user data if a user is signed in.
//  */
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    if (user) {
        let email = user.email;
        document.getElementById('sidebarMenu').style.visibility = "visible";
        fetchUserData(email);
        renderUserName();
    } else {
        document.getElementById('sidebarMenu').style.visibility = "hidden";
        if (!publicPages.includes(currentPage)) {
            window.location.href = "index.html";
        }

        renderUserName(null);
    }
});

/**
 * Logs out the current user and redirects to the index page.
 * @returns {Promise<void>}
 */
function handleLogout() {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error('Error during sign out:', error);
    });
};

window.handleLogout = handleLogout;