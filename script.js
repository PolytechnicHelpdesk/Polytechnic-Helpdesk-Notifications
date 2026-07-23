let notifications = [];

// ======================================
// Load Notifications
// ======================================

fetch("notifications.json")
.then(response => {

    if (!response.ok) {
        throw new Error("Unable to load notifications.json");
    }

    return response.json();

})
.then(data => {

    notifications = data.sort((a, b) => {

        return new Date(b.date) - new Date(a.date);

    });

    loadCategories();
    loadYears();
    loadTable(notifications);

})
.catch(error => {

    console.error(error);

});


// ======================================
// Load Categories Automatically
// ======================================

function loadCategories(){

    const select =
        document.getElementById("categoryFilter");

    select.innerHTML =
        `<option value="All">All Categories</option>`;

    const categories =
        [...new Set(
            notifications.map(item => item.category)
        )];

    categories.sort();

    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });

}



// ======================================
// Load Years Automatically
// ======================================

function loadYears(){

    const select =
        document.getElementById("yearFilter");

    select.innerHTML =
        `<option value="All">All Years</option>`;

    const years =
        [...new Set(
            notifications.map(item => item.year)
        )];

    years.sort((a,b)=>b-a);

    years.forEach(year=>{

        const option =
            document.createElement("option");

        option.value = year;

        option.textContent = year;

        select.appendChild(option);

    });

}



// ======================================
// Render Notification Table
// ======================================

function loadTable(data){

    const tbody =
        document.getElementById("notificationBody");

    tbody.innerHTML = "";

    data.forEach(notification=>{

        let status = "";

        switch(notification.status.toUpperCase()){

            case "NEW":

                status =

                `<span class="badge-new">

                    NEW

                </span>`;

                break;

            case "ACTIVE":

                status =

                `<span class="badge-active">

                    ACTIVE

                </span>`;

                break;

            case "DEACTIVATED":

                status =

                `<span class="badge-deactivated">

                    DEACTIVATED

                </span>`;

                break;

            default:

                status =

                `<span class="badge-active">

                    ACTIVE

                </span>`;

        }

        let linksHTML = "";

        if(notification.links){

            notification.links.forEach(link=>{

                linksHTML +=

                `<a

                    class="view-link"

                    href="${link.url}"

                    target="_blank"

                    rel="noopener">

                    ${link.name}

                </a>`;

            });

        }

        tbody.innerHTML +=

        `<tr>

            <td>

                ${formatDate(notification.date)}

            </td>

            <td>

                ${notification.category}

            </td>

            <td class="notification-title">

                ${notification.title}

            </td>

            <td>

                ${status}

            </td>

            <td class="action-links">

                ${linksHTML}

            </td>

        </tr>`;

    });

    updateCounter(data.length);

}

// ======================================
// Update Notification Counter
// ======================================

function updateCounter(total){

    const count =
        document.getElementById("count");

    if(total===0){

        count.innerHTML =
        "Showing 0 to 0 of 0 notifications";

    }

    else{

        count.innerHTML =

        `Showing 1 to ${total} of ${total} notifications`;

    }

}



// ======================================
// Date Format
// ======================================

function formatDate(date){

    const d = new Date(date);

    if(isNaN(d)) return date;

    return d.toLocaleDateString(

        "en-GB",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}



// ======================================
// Search Events
// ======================================

const searchButton =
document.getElementById("searchButton");

if(searchButton){

    searchButton.addEventListener(

        "click",

        searchNotification

    );

}


const searchInput =
document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener(

        "keyup",

        function(e){

            if(e.key==="Enter"){

                searchNotification();

            }

        }

    );

}



// ======================================
// Search Function
// ======================================

function searchNotification(){

    const keyword =

        document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const category =

        document
        .getElementById("categoryFilter")
        .value;

    const year =

        document
        .getElementById("yearFilter")
        .value;

    const result =

        notifications.filter(notification=>{

            const titleMatch =

                notification.title
                .toLowerCase()
                .includes(keyword);

            const categoryMatch =

                category==="All"

                ||

                notification.category===category;

            const yearMatch =

                year==="All"

                ||

                notification.year===year;

            return (

                titleMatch

                &&

                categoryMatch

                &&

                yearMatch

            );

        });

    loadTable(result);

}



// ======================================
// Reset Filters (Optional)
// ======================================

function resetFilters(){

    document
    .getElementById("searchInput")
    .value="";

    document
    .getElementById("categoryFilter")
    .value="All";

    document
    .getElementById("yearFilter")
    .value="All";

    loadTable(notifications);

}



// ======================================
// Sort by Latest (Optional Helper)
// ======================================

function sortLatest(){

    notifications.sort(

        (a,b)=>

        new Date(b.date)-new Date(a.date)

    );

    loadTable(notifications);

}



// ======================================
// End of File
// ======================================