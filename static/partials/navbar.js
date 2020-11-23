// HTML for the navbar, used in all pages to avoid repetition
document.write(
    `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="index.html">SEII_project_25</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav">
                <a class="nav-link" href="index.html">Home</a>
            </div>
            <div class="navbar-nav ml-auto">
                <a class="nav-link" href="cart.html">Carrello</a>
                <a class="nav-link" href="login.html">Login</a>
                <a class="nav-link" href="register.html">Registrati</a>
            </div>
        </div>
    </nav>
    `
);