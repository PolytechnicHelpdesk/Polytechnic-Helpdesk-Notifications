// ============================================
// Polytechnic Helpdesk Notification Portal
// Version 3.1
// ============================================

let notifications = [];
let filteredNotifications = [];

const ITEMS_PER_PAGE = 10;
let currentPage = 1;


// ============================================
// LOAD JSON
// ============================================

fetch("notifications.json")

.then(response=>{

    if(!response.ok){

        throw new Error("Unable to load notifications.json");

    }

    return response.json();

})

.then(data=>{

    notifications = data;

    sortNotifications();

    filteredNotifications = [...notifications];

    loadCategories();

    loadYears();

    updateStatistics();

    renderPage();

})

.catch(error=>console.error(error));



// ============================================
// SORT NOTIFICATIONS
// ============================================

function sortNotifications(){

    notifications.sort((a,b)=>{

        // Pinned first

        if(a.pinned && !b.pinned) return -1;

        if(!a.pinned && b.pinned) return 1;

        // Latest first

        return new Date(b.date)-new Date(a.date);

    });

}



// ============================================
// CATEGORY DROPDOWN
// ============================================

function loadCategories(){

    const select=document.getElementById("categoryFilter");

    select.innerHTML='<option value="All">All Categories</option>';

    [...new Set(notifications.map(n=>n.category))]
    .sort()
    .forEach(category=>{

        select.innerHTML+=`

        <option value="${category}">

            ${category}

        </option>

        `;

    });

}



// ============================================
// YEAR DROPDOWN
// ============================================

function loadYears(){

    const select=document.getElementById("yearFilter");

    select.innerHTML='<option value="All">All Years</option>';

    [...new Set(notifications.map(n=>n.year))]
    .sort((a,b)=>b-a)
    .forEach(year=>{

        select.innerHTML+=`

        <option value="${year}">

            ${year}

        </option>

        `;

    });

}



// ============================================
// STATISTICS
// ============================================

function updateStatistics(){

    const total = notifications.length;

    const newest = notifications.filter(
        n => n.status.toUpperCase() === "NEW"
    ).length;

    const active = notifications.filter(
        n => n.status.toUpperCase() === "ACTIVE"
    ).length;

    const deactivated = notifications.filter(
        n => n.status.toUpperCase() === "DEACTIVATED"
    ).length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("newCount").textContent = newest;
    document.getElementById("activeCount").textContent = active;
    document.getElementById("deactivatedCount").textContent = deactivated;

}
// ============================================
// RENDER CURRENT PAGE
// ============================================

function renderPage(){

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    const pageData = filteredNotifications.slice(start, end);

    loadTable(pageData);

    renderPagination();

}



// ============================================
// LOAD TABLE
// ============================================

function loadTable(data){

    const tbody =
        document.getElementById("notificationBody");

    tbody.innerHTML = "";

    data.forEach(notification=>{

        // -------------------------
        // STATUS
        // -------------------------

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



        // -------------------------
        // LINKS
        // -------------------------

        let linksHTML = "";

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



        // -------------------------
        // ROW
        // -------------------------

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

                ${notification.pinned
                    ? '<span class="pin-badge">📌 Pinned</span>'
                    : ''}

            </td>

            <td>

                ${status}

            </td>

            <td class="action-links">

                ${linksHTML}

            </td>

        </tr>`;

    });

    updateCounter();

}



// ============================================
// UPDATE COUNTER
// ============================================

function updateCounter(){

    const total =
        filteredNotifications.length;

    const start =
        total === 0
        ? 0
        : ((currentPage-1)*ITEMS_PER_PAGE)+1;

    const end =
        Math.min(
            currentPage*ITEMS_PER_PAGE,
            total
        );

    document
    .getElementById("count")
    .innerHTML =

    `Showing ${start} to ${end} of ${total} notifications`;

}



// ============================================
// FORMAT DATE
// ============================================

function formatDate(date){

    const d =
        new Date(date);

    return d.toLocaleDateString(

        "en-GB",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );

}
// ============================================
// LIVE SEARCH
// ============================================

const searchInput =
document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("input",filterNotifications);

}

document
.getElementById("categoryFilter")
.addEventListener("change",filterNotifications);

document
.getElementById("yearFilter")
.addEventListener("change",filterNotifications);



// ============================================
// FILTER
// ============================================

function filterNotifications(){

    currentPage = 1;

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

    filteredNotifications =

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

    renderPage();

}



// ============================================
// PAGINATION
// ============================================

function renderPagination(){

    const pagination =
    document.getElementById("pagination");

    pagination.innerHTML="";

    const totalPages =
    Math.ceil(
        filteredNotifications.length
        / ITEMS_PER_PAGE
    );

    if(totalPages<=1) return;



    // Previous

    const previous =
    document.createElement("button");

    previous.textContent="Previous";

    previous.disabled=currentPage===1;

    previous.onclick=()=>{

        if(currentPage>1){

            currentPage--;

            renderPage();

        }

    };

    pagination.appendChild(previous);



    // Page Numbers

    for(

        let i=1;

        i<=totalPages;

        i++

    ){

        const button =
        document.createElement("button");

        button.textContent=i;

        if(i===currentPage){

            button.classList.add("active");

        }

        button.onclick=()=>{

            currentPage=i;

            renderPage();

        };

        pagination.appendChild(button);

    }



    // Next

    const next =
    document.createElement("button");

    next.textContent="Next";

    next.disabled=currentPage===totalPages;

    next.onclick=()=>{

        if(currentPage<totalPages){

            currentPage++;

            renderPage();

        }

    };

    pagination.appendChild(next);

}



// ============================================
// RESET FILTERS
// ============================================

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

    filteredNotifications=[...notifications];

    currentPage=1;

    renderPage();

}



// ============================================
// END
// ============================================