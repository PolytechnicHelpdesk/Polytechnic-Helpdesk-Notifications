let notifications = [];

// Load Notifications
fetch("notifications.json")
.then(response => response.json())
.then(data => {

    notifications = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    loadTable(notifications);

})
.catch(error => console.error(error));


// ============================
// Load Notification Table
// ============================

function loadTable(data){

    const tbody = document.getElementById("notificationBody");

    tbody.innerHTML = "";

    data.forEach(notification=>{

        let status = notification.status === "NEW"
            ? `<span class="badge-new">NEW</span>`
            : `<span class="badge-active">ACTIVE</span>`;

        // Multiple Links

        let linksHTML = "";

        if(notification.links){

            notification.links.forEach(link=>{

                linksHTML += `

                <a class="view-link"
                   href="${link.url}"
                   target="_blank">

                    ${link.name}

                </a>

                `;

            });

        }

        tbody.innerHTML += `

        <tr>

            <td>${formatDate(notification.date)}</td>

            <td>${notification.category}</td>

            <td class="notification-title">

                ${notification.title}

            </td>

            <td>

                ${status}

            </td>

            <td class="action-links">

                ${linksHTML}

            </td>

        </tr>

        `;

    });

    updateCounter(data.length);

}



// ============================
// Date Format
// ============================

function formatDate(date){

    const d = new Date(date);

    return d.toLocaleDateString("en-GB",{

        day:"2-digit",
        month:"short",
        year:"numeric"

    });

}



// ============================
// Counter
// ============================

function updateCounter(total){

    document.getElementById("count").innerHTML =

        total

        ? `Showing 1 to ${total} of ${total} notifications`

        : "Showing 0 to 0 of 0 notifications";

}



// ============================
// Search
// ============================

document
.getElementById("searchButton")
.addEventListener("click",searchNotification);

document
.getElementById("searchInput")
.addEventListener("keyup",e=>{

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

    const result = notifications.filter(notification=>{

        return (

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