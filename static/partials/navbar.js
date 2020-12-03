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
            <div class="navbar-nav ml-auto">
    `;

if (localStorage.getItem('token') !== null && localStorage.getItem('user_id') !== null) {
    navbar += `
                <a class="nav-link" href="cart.html">&#128722 Carrello <span id="navbar_cart_total" class="badge badge-light"></span></a>
                <a class="nav-link" href="logout.html">Logout</a>
            `;

    fetch('../api/v1/cart/', {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        }
    })
    .then(response => response.json())
    .then(json => $("#navbar_cart_total").text(json.length));

} else {
    navbar += `
                <a class="nav-link" href="login.html">Login</a>
            `;
}

navbar += `
            </div>
        </div>
    </nav>
    `;

document.write(navbar);
