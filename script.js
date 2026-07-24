// ============================================
// Polytechnic Helpdesk Notification Portal
// Version 4.0
// ============================================

let notifications = [];
let filteredNotifications = [];

const ITEMS_PER_PAGE = 10;

let currentPage = 1;

// ============================================
// DARK MODE
// ============================================

const themeToggle =
document.getElementById("themeToggle");

function loadTheme(){

    const savedTheme =
    localStorage.getItem("theme");

    if(savedTheme==="dark"){

        document.body.classList.add("dark");

        if(themeToggle){

            themeToggle.innerHTML=
            "☀️ Light Mode";

        }

    }

}

function toggleTheme(){

    document.body.classList.toggle("dark");

    const darkMode =
    document.body.classList.contains("dark");

    localStorage.setItem(

        "theme",

        darkMode
        ? "dark"
        : "light"

    );

    if(themeToggle){

        themeToggle.innerHTML=

        darkMode

        ? "☀️ Light Mode"

        : "🌙 Dark Mode";

    }

}

if(themeToggle){

    themeToggle.addEventListener(

        "click",

        toggleTheme

    );

}

// ============================================
// LOAD JSON
// ============================================

fetch("./notifications.json")

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

    loadTheme();

    renderPage();

    preloadLinks();

})

.catch(error=>{

    console.error(error);

});

// ============================================
// SORT
// ============================================

function sortNotifications(){

    notifications.sort((a,b)=>{

        if(a.pinned && !b.pinned)

            return -1;

        if(!a.pinned && b.pinned)

            return 1;

        return new Date(b.date)

            - new Date(a.date);

    });

}

// ============================================
// CATEGORY
// ============================================

function loadCategories(){

    const select =

    document.getElementById(

        "categoryFilter"

    );

    select.innerHTML=

    '<option value="All">All Categories</option>';

    [...new Set(

        notifications.map(

            n=>n.category

        )

    )]

    .sort()

    .forEach(category=>{

        select.innerHTML+=

        `<option value="${category}">

            ${category}

        </option>`;

    });

}

// ============================================
// YEAR
// ============================================

function loadYears(){

    const select=

    document.getElementById(

        "yearFilter"

    );

    select.innerHTML=

    '<option value="All">All Years</option>';

    [...new Set(

        notifications.map(

            n=>n.year

        )

    )]

    .sort((a,b)=>b-a)

    .forEach(year=>{

        select.innerHTML+=

        `<option value="${year}">

            ${year}

        </option>`;

    });

}
// ============================================
// RENDER CURRENT PAGE
// ============================================

function renderPage(){


    const start=(currentPage-1)*ITEMS_PER_PAGE;

    const end=start+ITEMS_PER_PAGE;

    const pageData=

    filteredNotifications.slice(

        start,

        end

    );

    loadTable(pageData);

    renderPagination();

}

// ============================================
// LOAD TABLE
// ============================================

function loadTable(data){

    const tbody=

    document.getElementById(

        "notificationBody"

    );

    tbody.innerHTML="";


    data.forEach(notification=>{

        let status="";

        switch(

            notification.status.toUpperCase()

        ){

            case "NEW":

                status=

                `<span class="badge-new">

                    NEW

                </span>`;

                break;

            case "ACTIVE":

                status=

                `<span class="badge-active">

                    ACTIVE

                </span>`;

                break;

            case "DEACTIVATED":

                status=

                `<span class="badge-deactivated">

                    DEACTIVATED

                </span>`;

                break;

            default:

                status=

                `<span class="badge-active">

                    ACTIVE

                </span>`;

        }

        let linksHTML="";

        notification.links.forEach(link=>{

            linksHTML+=

            `<a

                class="view-link"

                href="${link.url}"

                target="_blank"

                rel="noopener">

                ${link.name}

            </a>`;

        });

        tbody.innerHTML+=`

<tr>

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

</tr>

`;

    });

    updateCounter();

}

// ============================================
// COUNTER
// ============================================

function updateCounter(){

    const total=

    filteredNotifications.length;

    const start=

    total===0

    ?0

    :((currentPage-1)

    *ITEMS_PER_PAGE)+1;

    const end=

    Math.min(

        currentPage

        *ITEMS_PER_PAGE,

        total

    );

    document

    .getElementById("count")

    .innerHTML=

    `Showing ${start} to ${end}

    of ${total} notifications`;

}

// ============================================
// FORMAT DATE
// ============================================

function formatDate(date){

    const d=

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
// SEARCH SUGGESTIONS
// ============================================

const searchInput =
document.getElementById("searchInput");

const suggestions =
document.getElementById("suggestions");

let selectedSuggestion = -1;

function showSuggestions(keyword){

    if(!suggestions) return;

    suggestions.innerHTML="";

    selectedSuggestion=-1;

    if(keyword.length===0){

        suggestions.style.display="none";

        return;

    }

    const matches=

    notifications.filter(notification=>

        notification.title

        .toLowerCase()

        .includes(

            keyword.toLowerCase()

        )

    )

    .slice(0,8);

    if(matches.length===0){

        suggestions.style.display="none";

        return;

    }

    matches.forEach(notification=>{

        const item=

        document.createElement("div");

        item.className="suggestion";

        item.textContent=

        notification.title;

        item.onclick=()=>{

            searchInput.value=

            notification.title;

            suggestions.style.display="none";

            filterNotifications();

        };

        suggestions.appendChild(item);

    });

    suggestions.style.display = "block";



}

// ============================================
// LIVE SEARCH
// ============================================

if(searchInput){

    searchInput.addEventListener(

        "input",

        ()=>{

            showSuggestions(

                searchInput.value.trim()

            );

            filterNotifications();

        }

    );


    searchInput.addEventListener(

        "keydown",

        e=>{

            const items=

            document.querySelectorAll(

                ".suggestion"

            );

            if(items.length===0)

                return;

            if(e.key==="ArrowDown"){

                e.preventDefault();

                selectedSuggestion++;

                if(

                    selectedSuggestion

                    >=items.length

                ){

                    selectedSuggestion=0;

                }

            }

            if(e.key==="ArrowUp"){

                e.preventDefault();

                selectedSuggestion--;

                if(

                    selectedSuggestion<0

                ){

                    selectedSuggestion=

                    items.length-1;

                }

            }

            items.forEach(item=>

                item.classList.remove(

                    "active"

                )

            );

            if(

                selectedSuggestion>=0

            ){

                items[

                    selectedSuggestion

                ]

                .classList.add(

                    "active"

                );

            }

            if(

                e.key==="Enter"

                &&

                selectedSuggestion>=0

            ){

                e.preventDefault();

                items[

                    selectedSuggestion

                ].click();

            }

        }

    );

}

document.addEventListener(

    "click",

    e=>{

        if(

            suggestions

            &&

            !e.target.closest(

                ".search-box"

            )

        ){

            suggestions.style.display="none";

        }

    }

);

// ============================================
// FILTER
// ============================================

document

.getElementById(

    "categoryFilter"

)

.addEventListener(

    "change",

    filterNotifications

);

document

.getElementById(

    "yearFilter"

)

.addEventListener(

    "change",

    filterNotifications

);

function filterNotifications(){

    currentPage=1;

    const keyword=

    searchInput.value

    .toLowerCase()

    .trim();

    const category=

    document

    .getElementById(

        "categoryFilter"

    )

    .value;

    const year=

    document

    .getElementById(

        "yearFilter"

    )

    .value;

    filteredNotifications=

    notifications.filter(

        notification=>{

            const titleMatch=

            notification.title

            .toLowerCase()

            .includes(keyword);

            const categoryMatch=

            category==="All"

            ||

            notification.category

            ===category;

            const yearMatch=

            year==="All"

            ||

            notification.year

            ===year;

            return(

                titleMatch

                &&

                categoryMatch

                &&

                yearMatch

            );

        }

    );

    renderPage();

}
// ============================================
// PAGINATION
// ============================================

function renderPagination(){

    const pagination=

    document.getElementById(

        "pagination"

    );

    pagination.innerHTML="";

    const totalPages=

    Math.ceil(

        filteredNotifications.length

        /ITEMS_PER_PAGE

    );

    if(totalPages<=1){

        return;

    }

    // Previous Button

    const previous=

    document.createElement("button");

    previous.textContent="Previous";

    previous.disabled=currentPage===1;

    previous.onclick=()=>{

        if(currentPage>1){

            currentPage--;

            animateTable();

            renderPage();

        }

    };

    pagination.appendChild(previous);

    // Page Buttons

    for(

        let i=1;

        i<=totalPages;

        i++

    ){

        const button=

        document.createElement("button");

        button.textContent=i;

        if(i===currentPage){

            button.classList.add("active");

        }

        button.onclick=()=>{

            currentPage=i;

            animateTable();

            renderPage();

        };

        pagination.appendChild(button);

    }

    // Next Button

    const next=

    document.createElement("button");

    next.textContent="Next";

    next.disabled=currentPage===totalPages;

    next.onclick=()=>{

        if(currentPage<totalPages){

            currentPage++;

            animateTable();

            renderPage();

        }

    };

    pagination.appendChild(next);

}

// ============================================
// RESET
// ============================================

function resetFilters(){

    searchInput.value="";

    document

    .getElementById(

        "categoryFilter"

    )

    .value="All";

    document

    .getElementById(

        "yearFilter"

    )

    .value="All";

    if(suggestions){

        suggestions.innerHTML="";

        suggestions.style.display="none";

    }

    filteredNotifications=[

        ...notifications

    ];

    currentPage=1;

    animateTable();

    renderPage();

}

// ============================================
// TABLE ANIMATION
// ============================================

function animateTable(){

    const table=

    document.querySelector(

        "tbody"

    );

    if(!table) return;

    table.style.opacity="0";

    table.style.transform=

    "translateY(10px)";

    setTimeout(()=>{

        table.style.opacity="1";

        table.style.transform=

        "translateY(0)";

    },120);

}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadTheme();

    }

);
// ============================================
// VERSION 4.0
// FINAL IMPROVEMENTS
// ============================================

// Close suggestions with Escape key

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        if(suggestions){

            suggestions.style.display="none";

        }

    }

});


// ============================================
// IMPROVED SEARCH EXPERIENCE
// ============================================

if(searchInput){

    searchInput.setAttribute(

        "autocomplete",

        "off"

    );

    searchInput.setAttribute(

        "spellcheck",

        "false"

    );

}

// ============================================
// ACCESSIBILITY
// ============================================

document.querySelectorAll(

    "button"

).forEach(button=>{

    button.setAttribute(

        "tabindex",

        "0"

    );

});

// ============================================
// PRELOAD LINKS
// ============================================

function preloadLinks(){

    notifications.forEach(notification=>{

        if(!notification.links) return;

        notification.links.forEach(link=>{

            const preload =

            document.createElement("link");

            preload.rel="prefetch";

            preload.href=link.url;

            document.head.appendChild(preload);

        });

    });

}

// ============================================
// AFTER JSON LOAD
// ============================================



// ============================================
// VERSION
// ============================================

console.log(

    "%cPolytechnic Helpdesk Notification Portal",

    "color:#0F4C81;font-size:16px;font-weight:bold"

);

console.log(

    "%cVersion 4.0 Loaded Successfully",

    "color:#198754;font-size:13px"

);

// ============================================
// END
// ============================================