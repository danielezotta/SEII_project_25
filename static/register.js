function register() {

    //get the form object
    var name = $("#name").val();
    var surname = $("#surname").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var passwordRepeat = $("#password_repeat").val();

    if (!name || name.length < 0) {
        $("#error_modal_title").text("Errore nome");
        $("#error_modal_body").text('Il nome non può essere vuoto!');
        $("#error_modal").modal("show");
        return;
    }

    if (!surname || surname.length < 0) {
        $("#error_modal_title").text("Errore cognome");
        $("#error_modal_body").text('Il cognome non può essere vuoto!');
        $("#error_modal").modal("show");
        return;
    }

    if (!email || email.length < 0) {
        $("#error_modal_title").text("Errore email");
        $("#error_modal_body").text('L\'email non può essere vuota!');
        $("#error_modal").modal("show");
        return;
    } else if (!(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email))) {
        $("#error_modal_title").text("Errore email");
        $("#error_modal_body").text('L\'email non rispetta un formato valido.');
        $("#error_modal").modal("show");
        return;
    }

    if (!password || password.length < 0) {
        $("#error_modal_title").text("Errore password");
        $("#error_modal_body").text('La password non può essere vuota!');
        $("#error_modal").modal("show");
        return;
    } else if (password !== passwordRepeat) {
        $("#error_modal_title").text("Errore password");
        $("#error_modal_body").text('Le password non corrispondono!');
        $("#error_modal").modal("show");
        return;
    }

    var user = {
        name: name,
        surname: surname,
        email: email,
        password: password
    }

    fetch('../api/v1/users/', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(user),
    })
    .then(resp => {
        if (!resp.ok) {
            if (resp.status == 400) {
                $("#error_modal_title").text("Errore 400");
                $("#error_modal_body").text('Alcuni dati non sono validi');
            } else {
                $("#error_modal_title").text("Errore 500");
                $("#error_modal_body").text('Errore comunicazione con il server');
            }
            $("#error_modal").modal("show");
        } else {
            resp.json();
        }
    })
    .then(function(data) {
        window.location.href = "login.html";
        return;
    }).catch(error => {
        // $("#error_modal_title").text("Errore");
        // $("#error_modal_body").text("Errore durante la richiesta");
        $("#error_modal").modal("show");
    });

};
