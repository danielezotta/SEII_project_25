function login()
{
    //get the form object
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    var user = {
        email: email,
        password: password
    }

    fetch('../api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(user),
    })
    .then(resp => {
        if (!resp.ok) {
            if (resp.status === 400) {
                throw new Error('La password non corrisponde');
            } else if (resp.status === 404) {
                throw new Error('L\'utente non è registrato');
            } else {
                throw new Error('Errore comunicazione con il server');
            }
        } else {
            resp.json();
        }
    })
    .then(function(data) {
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('token', data.token);
        return;
    }).catch(error => {
        $("#error_modal_title").text("Errore");
        $("#error_modal_body").text(error);
        $("#error_modal").modal("show");
    });

};
