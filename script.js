let notifications = [];

// ==============================
// Load Notifications
// ==============================

fetch("notifications.json")
.then(response => response.json())
.then(data => {

    notifications = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    loadCategories();
    loadYears();
    loadTable(notifications);

})
.catch(error => console.error(error));


// ==============================
// Load Categories Automatically
// ==============================

function loadCategories(){

    const select =
        document.getElementById("categoryFilter");

    select.innerHTML =
        `<option value="All">All Categories</option>`;

    const categories =
        [...new Set(
            notifications.map(n => n.category)
        )];

    categories.sort();

    categories.forEach(category=>{

        select.innerHTML +=

        `<option value="${category}">

            ${category}

        </option>`;

    });

}



// ==============================
// Load Years Automatically
// ==============================

function loadYears(){

    const select =
        document.getElementById("yearFilter");

    select.innerHTML =
        `<option value="All">All Years</option>`;

    const years =
        [...new Set(
            notifications.map(n => n.year)
        )];

    years.sort((a,b)=>b-a);

    years.forEach(year=>{

        select.innerHTML +=

        `<option value="${year}">

            ${year}

        </option>`;

    });

}



// ==============================
// Load Notification Table
// ==============================

function loadTable(data){

    const tbody =
        document.getElementById("notificationBody");

    tbody.innerHTML = "";

    data.forEach(notification=>{

        const status =

            notification.status === "NEW"

            ?

            `<span class="badge-new">

                NEW

            </span>`

            :

            `<span class="badge-active">

                ACTIVE

            </span>`;



        let linksHTML = "";

        notification.links.forEach(link=>{

            linksHTML +=

            `<a

                class="view-link"

                href="${link.url}"

                target="_blank">

                ${link.name}

            </a>`;

        });



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



// ==============================
// Counter
// ==============================

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



// ==============================
// Date Format
// ==============================

function formatDate(date){

    return new Date(date).toLocaleDateString(

        "en-GB",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}



// ==============================
// Search
// ==============================

document
.getElementById("searchButton")
.addEventListener("click",searchNotification);


document
.getElementById("searchInput")
.addEventListener("keyup",function(e){

    if(e.key==="Enter"){

        searchNotification();

    }

});



function searchNotification(){

    const keyword =

        document
        .getElementById("searchInput")
        .value
        .toLowerCase();

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

            return(

                notification.title
                .toLowerCase()
                .includes(keyword)

                &&

                (

                    category==="All"

                    ||

                    notification.category===category

                )

                &&

                (

                    year==="All"

                    ||

                    notification.year===year

                )

            );

        });

    loadTable(result);

}