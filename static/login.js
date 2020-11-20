function login() {

    //get the form object
    var email = $("#email").val();
    var password = $("#password").val();

    var user = {
        email: email,
        password: password
    }

    fetch('../api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(user)
    }).then((resp) => {
        if (!resp.ok) {
            if (resp.status == 400) {
                $("#error_modal_title").text("Errore 400");
                $("#error_modal_body").text('La password non corrisponde');
            } else if (resp.status == 404) {
                $("#error_modal_title").text("Errore 404");
                $("#error_modal_body").text('L\'utente non è registrato');
            } else {
                $("#error_modal_title").text("Errore 500");
                $("#error_modal_body").text('Errore comunicazione con il server');
            }
            $("#error_modal").modal("show");
            throw new Error();
        } else {
            return resp.json();
        }
    }).then((data) => {
        window.localStorage.setItem('user_id', data.user_id);
        window.localStorage.setItem('token', data.token);
        window.location.href = document.referrer;
        return;
    }).catch(error => {
        // $("#error_modal_title").text(error);
        // $("#error_modal_body").text("Errore durante la richiesta");
        $("#error_modal").modal("show");
    });

};
