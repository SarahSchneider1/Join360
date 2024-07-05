window.onload = getNames;
let initialsBackgroundColors = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8',
    '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701',
    '#0038FF', '#00FFFF', '#FF00000', '#FF4646', '#FFBB2B'
];

let editingContactId = null;


function slideInFromRight() {
    let contactOverlay = document.getElementById('contact-overlay');
    let contactCont = document.getElementById('contact-cont');

    contactOverlay.classList.add('slide-in-from-right');
    contactCont.classList.add('slide-in-from-right');

    setTimeout(() => {
        contactOverlay.classList.add('fade-to-grey-overlay');
    }, 300);
}


function slideOutToRight() {
    let contactOverlay = document.getElementById('contact-overlay');
    let contactCont = document.getElementById('contact-cont');

    contactOverlay.classList.remove('fade-to-grey-overlay');

    setTimeout(() => {
        contactOverlay.classList.remove('slide-in-from-right');
        contactCont.classList.remove('slide-in-from-right');
    }, 100);
}


function closeOverlayWhenGreyAreaWasClicked() {
    document.onclick = function (e) {
        if (e.target.id === 'contact-overlay') {
            slideOutToRight();
        }
    };
}


async function addContactData(path = "", data = {}) {
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        header: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}

async function createContact() {
    let email = document.getElementById('contact-email').value;
    let name = document.getElementById('contact-name').value;
    let phonenumber = document.getElementById('contact-phone').value;

    if (validateContactInputs(email, name, phonenumber)) {
        slideOutToRight();
        showSuccessfullContactCreation();

        await addContactData('names', { 'email': email, 'name': name, 'phonenumber': phonenumber });
        await getNames();
        searchAndRenderLastAddedContact(name);
    } else {
        return;
    }
}


function validateContactInputs(email, name, phonenumber) {
    let emailInput = document.getElementById('contact-email');
    let phonenumberInput = document.getElementById('contact-phone');
    let nameInput = document.getElementById('contact-name');

    nameInput.classList.remove('invalid-input');
    phonenumberInput.classList.remove('invalid-input');
    emailInput.classList.remove('invalid-input');

    if (/^\+?\d{4,12}$/.test(phonenumber)) {
        if (/^[^\s@]+@[^\s@]+\.(com|de|net|org|info|edu|gov|mil|co\.\w{2})$/.test(email)) {
            if (/^[A-Za-z\u00C0-\u017F]+(?: [A-Za-z\u00C0-\u017F]+)*$/.test(name)) {
                return true;
            } else {
                nameInput.classList.add('invalid-input');
                return false;
            }
        } else {
            emailInput.classList.add('invalid-input');
            return false;
        }
    } else {
        phonenumberInput.classList.add('invalid-input');
        return false;
    }
}


function searchAndRenderLastAddedContact(name) {
    let lastAddedName = name;

    let contactElements = document.querySelectorAll(".contact-row");

    contactElements.forEach(element => {
        if (element.textContent.includes(lastAddedName)) {
            let onclickAttr = element.getAttribute("onclick");
            let paramsRegex = /renderContactInformation\(([^)]+)\)/;
            let match = paramsRegex.exec(onclickAttr);

            if (match) {
                let paramsString = match[1];
                let paramsArray = paramsString.split(',').map(param => param.trim().replace(/['"]/g, ''));

                renderContactInformation(...paramsArray);
                element.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        }
    });
};


function showSuccessfullContactCreation() {
    let contactCreated = document.getElementById('contact-created');

    contactCreated.classList.add('slide-in-from-right');

    setTimeout(() => {
        contactCreated.classList.remove('slide-in-from-right');
    }, 1500);
}


async function getNames() {
    try {
        let response = await fetch(BASE_URL + ".json");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let data = await response.json();

        if (data && data.names && typeof data.names === 'object') {
            let namesArray = Object.entries(data.names);
            renderContacts(namesArray);
        } else {
            throw new Error("Invalid data format");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}


function getRandomColor() {
    return initialsBackgroundColors[Math.floor(Math.random() * initialsBackgroundColors.length)];
}


function groupByInitial(data) {
    let grouped = data.reduce((acc, [id, contact]) => {
        const initial = contact.name.charAt(0).toUpperCase();
        if (!acc[initial]) {
            acc[initial] = [];
        }
        acc[initial].push([id, contact]);
        return acc;
    }, {});

    let sortedGrouped = {};
    Object.keys(grouped).sort().forEach(key => {
        sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
}

function getInitials(name) {
    if (!name) return '';
    let initials = name.split(' ').map(part => part.charAt(0)).join('');
    return initials.toUpperCase();
}

function renderContactInformation(name, email, color, phone, id) {
    checkResponsive();
    const contactSummary = document.getElementById('mainContacts');
    contactSummary.classList.add('bgcolorgrey');
    const contactRows = document.getElementsByClassName('contact-row');
    for (let row of contactRows) {
        row.classList.remove('selected-contact');
    }
    let contactName = document.getElementById(id);
    contactName.classList.add('selected-contact');
    contactSummary.innerHTML = renderContactSummary(color, name, email, phone, id);
}


function closeContactInformation() {
    if (window.innerWidth < 1201) {
        document.getElementById('contactsLeft').style.display = 'flex';
        document.getElementById('mainContacts').style.display = 'none';
    }
    let summary = document.getElementById('contactSummary');
    summary.innerHTML = '';
    getNames();
}


function checkResponsive() {
    if (window.innerWidth < 1201) {
        document.getElementById('contactsLeft').style.display = 'none';
        document.getElementById('mainContacts').style.display = 'flex';
    }
}


function burgerSlideInFromRight() {
    let burgerMenu = document.getElementById('burgerMenu');
    let burgerIcon = document.getElementById('contactBurgerMenuIcon');
    burgerMenu.classList.toggle('active');
    burgerIcon.classList.add('d-none');
    document.addEventListener('click', closeBurgerMenuWhenGreyAreaWasClicked);
}


function burgerMenuSlideOutToRight() {
    let burgerMenu = document.getElementById('burgerMenu');
    let burgerIcon = document.getElementById('contactBurgerMenuIcon');
    burgerMenu.classList.remove('active');
    burgerIcon.classList.remove('d-none');
    document.removeEventListener('click', closeBurgerMenuWhenGreyAreaWasClicked);
}


function closeBurgerMenuWhenGreyAreaWasClicked(event) {
    let burgerMenu = document.getElementById('burgerMenu');
    if (!burgerMenu.contains(event.target) && !event.target.closest('.contact-burger-menu')) {
        burgerMenuSlideOutToRight();
    }
}


function openEditContactOverlay(name, email, phone, color, uniqueId) {
    document.getElementById('edit-contact-name').value = name;
    document.getElementById('edit-contact-email').value = email;
    document.getElementById('edit-contact-phone').value = phone;
    document.getElementById('contactEditProfileInitials').style.background = color;
    document.getElementById('contactEditProfileInitials').innerHTML = getInitials(name);
    editingContactId = uniqueId;
    editSlideInFromRight();
}


function editSlideInFromRight() {
    let editContactOverlay = document.getElementById('edit-contact-overlay');
    let editContactCont = document.getElementById('edit-contact-cont');

    editContactOverlay.classList.add('slide-in-from-right');
    editContactCont.classList.add('slide-in-from-right');

    setTimeout(() => {
        editContactOverlay.classList.add('fade-to-grey-overlay');
    }, 300);
}


function editSlideOutToRight() {
    let contactOverlay = document.getElementById('edit-contact-overlay');
    let contactCont = document.getElementById('edit-contact-cont');

    contactOverlay.classList.remove('fade-to-grey-overlay');

    setTimeout(() => {
        contactOverlay.classList.remove('slide-in-from-right');
        contactCont.classList.remove('slide-in-from-right');
    }, 100);
}


async function editContact(event) {
    event.preventDefault();
    let name = document.getElementById('edit-contact-name').value;
    let email = document.getElementById('edit-contact-email').value;
    let phone = document.getElementById('edit-contact-phone').value;
    if (!editingContactId) {
        console.error('Keine Kontakt-ID vorhanden für das Update');
        return;
    }
    await updateContactData(editingContactId, { email: email, name: name, phonenumber: phone });
    editSlideOutToRight();
    await getNames();
    searchAndRenderLastAddedContact(name);
    showSuccessfulEdit();
}

async function updateContactData(id, data) {
    try {
        let response = await fetch(`${BASE_URL}/names/${id}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("Error updating data:", error);
    }
}


function showSuccessfulEdit() {
    let contactCreated = document.getElementById('contact-edited');
    contactCreated.innerHTML = "Contact successfully edited";
    contactCreated.classList.add('slide-in-from-right');

    setTimeout(() => {
        contactCreated.classList.remove('slide-in-from-right');
    }, 1500);
}


function openDeleteContactOverlay(uniqueId) {
    const deleteContactOverlay = document.getElementById('delete-contact-overlay');
    if (deleteContactOverlay) {
        deleteContactOverlay.classList.add('slide-in-from-right');
        deleteContactOverlay.dataset.contactId = uniqueId;
    } else {
        console.error('delete-contact-overlay Element nicht gefunden');
    }
}


function deleteSlideOutToRight() {
    const deleteContactOverlay = document.getElementById('delete-contact-overlay');
    if (deleteContactOverlay) {
        deleteContactOverlay.classList.remove('slide-in-from-right');
        setTimeout(() => {
            deleteContactOverlay.classList.remove('fade-to-grey-overlay');
        }, 100);
    } else {
        console.error('delete-contact-overlay Element nicht gefunden');
    }
}


async function deleteContact() {
    const deleteContactOverlay = document.getElementById('delete-contact-overlay');
    const contactId = deleteContactOverlay ? deleteContactOverlay.dataset.contactId : null;

    if (!contactId) {
        console.error('Keine Kontakt-ID vorhanden für das Löschen');
        return;
    }

    try {
        let response = await fetch(`${BASE_URL}/names/${contactId}.json`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        deleteSlideOutToRight();
        await getNames();
        closeContactInformation();
        showSuccessfulDelete();
    } catch (error) {
        console.error("Error deleting data:", error);
    }
}

function showSuccessfulDelete() {
    let contactDeleted = document.getElementById('contact-deleted');
    if (contactDeleted) {
        contactDeleted.innerHTML = "Contact successfully deleted";
        contactDeleted.classList.add('slide-in-from-right');


        setTimeout(() => {
            contactDeleted.classList.remove('slide-in-from-right');
        }, 1500);
    } else {
        console.error('contact-deleted Element nicht gefunden');
    }
}
