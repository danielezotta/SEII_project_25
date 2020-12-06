// HTML for the navbar, used in all pages to avoid repetition

var navbar = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="index.html">SEII_project_25</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbar">
            <div class="navbar-nav">
                <a class="nav-link" href="index.html">Home</a>
            </div>
            <div class="navbar-nav ml-auto" id="navbar_status_right">
            </div>
        </div>
    </nav>
    `;

document.write(navbar);

if (localStorage.getItem('token') !== null && localStorage.getItem('user_id') !== null) {

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

        if (json.surname !== undefined) {

            $("#navbar_status_right").html(`
                <a class="nav-link" href="cart.html">&#128722 Carrello <span id="navbar_cart_total" class="badge badge-light"></span></a>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbar_status_right_dropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        &#128100 ${json.name}
                    </a>
                    <div class="dropdown-menu dropdown-menu-right text-right" aria-labelledby="navbar_status_right_dropdown">
                        <a class="dropdown-item" href="#">I miei ordini</a>
                        <a class="dropdown-item" href="#">I miei prodotti</a>
                        <a class="dropdown-item" href="#">Metti in vendita</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="logout.html">Logout</a>
                    </div>
                </li>
                `);

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
            $("#navbar_status_right").html(`
                        <a class="nav-link" href="login.html">Login</a>
                    `);
        }

    });

} else {
    $("#navbar_status_right").html(`
                <a class="nav-link" href="login.html">Login</a>
            `);
}
