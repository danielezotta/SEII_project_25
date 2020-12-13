// HTML for the navbar, used in all pages to avoid repetition
var navbar = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark justify-content-between">
        <a class="navbar-brand" href="index.html">SEII_project_25</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbar">
            <div class="navbar-nav">
                <a class="nav-link" href="index.html">Home</a>
            </div>
            <div class="navbar-nav mx-auto">
                <div class="nav-item dropdown" id="navbar_search">
                    <div class="d-none" data-toggle="dropdown"></div>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Cerca" name="navbar_search_field" id="navbar_search_field" autocomplete="off" oninput="searchProductSuggestion();">
                        <div class="input-group-append">
                            <span class="input-group-text">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
                                    <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="dropdown-menu w-100" id="navbar_search_suggestions">
                    </div>
                </div>
            </div>
            <div class="navbar-nav" id="navbar_status_right">
            </div>
        </div>
    </nav>
    `;

document.write(navbar);

// Check if token and user_id have value
if (localStorage.getItem('token') !== null && localStorage.getItem('user_id') !== null) {
    // Fetch data with two fields in header
    fetch('../api/v1/users/' + localStorage.getItem('user_id'), {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        }
    })
    .then(response => response.json())
    .then((json) => {
        // Surname has value if login successfull
        if (json.surname !== undefined) {
            // Add cart and user options
            $("#navbar_status_right").html(`
                <a class="nav-link" href="cart.html">
                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-cart2" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
                    </svg>
                    Carrello <span id="navbar_cart_total" class="badge badge-light"></span>
                </a>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbar_status_right_dropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z"/>
                            <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                            <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                        </svg>
                        ${json.name}
                    </a>
                    <div class="dropdown-menu dropdown-menu-right text-right bg-dark " aria-labelledby="navbar_status_right_dropdown">
                        <a class="nav-link" href="#">I miei ordini</a>
                        <a class="nav-link" href="#">I miei prodotti</a>
                        <a class="nav-link" href="#">Metti in vendita</a>
                        <div class="dropdown-divider"></div>
                        <a class="nav-link" href="edit_user.html">Il mio profilo</a>
                        <a class="nav-link" href="logout.html">Logout</a>
                    </div>
                </li>
                `);
                // Get cart number of objects
                fetch('../api/v1/cart/', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'x-access-token': localStorage.getItem('token'),
                        'user-id': localStorage.getItem('user_id')
                    }
                })
                .then(resp => resp.json())
                .then(cart => $("#navbar_cart_total").text(cart.length));

        } else {
            // Not logget, option to login
            $("#navbar_status_right").html(`
                        <a class="nav-link" href="login.html">
                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z"/>
                                <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                            </svg>
                            Login
                        </a>
                    `);
        }
    });
} else {
    // Not logged, option to login
    $("#navbar_status_right").html(`
                <a class="nav-link" href="login.html">
                    <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-person-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z"/>
                        <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                    </svg>
                    Login
                </a>
            `);
}

// Search suggestions and result to click
function searchProductSuggestion() {
    $("#navbar_search_suggestions").addClass("d-none");
    if ($("#navbar_search_field").val().length >= 3) {
        $("#navbar_search_suggestions").html("");
        // Get search passing value in query
        fetch('../api/v1/products?search=' + $("#navbar_search_field").val(), {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': localStorage.getItem('token'),
                'user-id': localStorage.getItem('user_id')
            }
        })
        .then(response => response.json())
        .then((json) => {
            // Check if there is a result
            if (json.length > 0) {
                json.forEach((item, i) => {
                    var suggestion = `
                        <a href="" class="dropdown-item text-wrap" onclick="window.location.href = '/product_details.html?id=${item._id}'">
                            <div class="row">
                                <div class="col-sm-4">
                                    <img src="${item.image}" class="w-100">
                                </div>
                                <div class="col-sm-8">
                                    ${item.name}
                                </div>
                            </div>
                        </a>
                    `
                    $("#navbar_search_suggestions").append(suggestion);
                });
                $("#navbar_search_suggestions").removeClass("d-none");
            }
        });
    }
}

// Init navbar components
$(document).ready(function() {
    $("#navbar_search").dropdown();
    $("#navbar_search").dropdown('toggle');
    $("#navbar_search_suggestions").addClass("d-none");
})
