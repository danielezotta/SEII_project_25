var user = {};

function getData() {
    fetch('../api/v1/users/' + localStorage.getItem('user_id'), {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        }
    }).then(resp => {
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
            return resp.json();
        }
    }).then(function(data) {
        // window.location.href = "login.html";
        $("#name").val(data.name);
        $("#surname").val(data.surname);
        $("#email").val(data.email);
        $("#password").val("password");
        $("#password_repeat").val("password");
        user.name = data.name;
        user.surname = data.surname;
        user.email = data.email;
        user.password = "password";
        return;
    }).catch(error => {
        // $("#error_modal_title").text("Errore");
        // $("#error_modal_body").text("Errore durante la richiesta");
        $("#error_modal").modal("show");
    });
}

function update() {

    $('#btn_update_text').addClass('d-none');
    $('#btn_update_spinner').removeClass('d-none');
    $("#btn_update").attr("disabled", true);

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

    var newUser = {};

    if (user.name != name) {
        newUser.name = name;
    }
    if (user.surname != surname) {
        newUser.surname = surname;
    }
    if (user.email != email) {
        newUser.email = email;
    }
    if (user.password != password) {
        newUser.password = password;
    }

    if (Object.keys(newUser).length != 0) {

        fetch('../api/v1/users/' + localStorage.getItem('user_id'), {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': localStorage.getItem('token'),
                'user-id': localStorage.getItem('user_id')
            },
            body: JSON.stringify(newUser)
        }).then(resp => {
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
        }).then(function(data) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            window.location.href = "login.html";
            return;
        }).catch(error => {
            // $("#error_modal_title").text("Errore");
            // $("#error_modal_body").text("Errore durante la richiesta");
            $("#error_modal").modal("show");
        });

    } else {
        $("#error_modal_title").text("Attenzione");
        $("#error_modal_body").text('Nessun dato è stato modificato');
        $("#error_modal").modal("show");
        $('#btn_update_text').removeClass('d-none');
        $('#btn_update_spinner').addClass('d-none');
        $("#btn_update").attr("disabled", false);
    }

};

$(document).ready(function() {
    getData();
});
