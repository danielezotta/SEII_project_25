function loadCart() {

    fetch('../api/v1/cart/', {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        }
    })
    .then((response) => {
        if (!response.ok) {
            if (response.status == 404) {
                $("#error_modal_title").text("Errore 404");
                $("#error_modal_body").text('Il prodotto non è presente nel carrello');
            } else {
                $("#error_modal_title").text("Errore 500");
                $("#error_modal_body").text('Errore comunicazione con il server');
            }
            $("#error_modal").modal("show");
            throw new Error();
        } else {
            return response.json();
        }
    }).then((items) => {

        items.forEach(function(item) {
            fetch('../api/v1/products/' + item.productId, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                    'user-id': localStorage.getItem('user_id')
                }
            })
            .then((resp) => {
                if (!resp.ok) {
                    if (resp.status == 404) {
                        $("#error_modal_title").text("Errore 404");
                        $("#error_modal_body").text('Il prodotto non è presente nel carrello');
                    } else {
                        $("#error_modal_title").text("Errore 500");
                        $("#error_modal_body").text('Errore comunicazione con il server');
                    }
                    $("#error_modal").modal("show");
                    throw new Error();
                } else {
                    return resp.json();
                }
            }).then((product) => {

                $(`<div class="card mt-2 mb-2">
                    <div class="row">
                        <div class="col-sm">
                            <img alt="" class="img-fluid card-img h-100" src="${product.image}" style="object-fit:cover;" />
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <div class="card-title row">
                                    <div class="col-sm">
                                        <p class="h4">${product.name}</p>
                                    </div>
                                    <div class="col-sm  text-right">
                                        <p class="btn btn-outline-danger" onclick="deleteProduct(this, '${item.productId}', '${product.name}')">
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                            <path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                         Rimuovi</p>
                                    </div>
                                </div>
                                <p class="card-text">${product.description}</p>
                                <div class="row mt-auto">
                                    <div class="col-sm">
                                        <div class="form-inline">
                                            <label class="my-1 mr-2" for="cart-item-amount">Quantità </label>
                                            <input class="my-1 mr-sm-2 form-control col-md-3" type="number" id="cart-item-amount" value="${item.amount}" min="1" max="${product.amount}" onchange="changeProductAmount(this, '${item.productId}')"/>
                                            <div class="spinner-border text-primary d-none" role="status" id="loading_amount_${item.productId}">
                                                <span class="sr-only">Caricamento...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm text-right">
                                        <p class="cart-text font-weight-bold h1">${product.price} €</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`).hide().appendTo("#cart_container").fadeIn("slow");

            })
            .catch(error => {
                $("#error_modal").modal("show");
                $('#btn_login_text').removeClass('d-none');
                $('#btn_login_spinner').addClass('d-none');
                $("#btn_login").attr("disabled", false);
            });

        });

        $('#loading_cart').addClass('d-none');

    })
    .catch(error => {
        $("#error_modal").modal("show");
        $('#btn_login_text').removeClass('d-none');
        $('#btn_login_spinner').addClass('d-none');
        $("#btn_login").attr("disabled", false);
    });

};

function changeProductAmount(element, productId) {

    $("#loading_amount_" + productId).removeClass("d-none");
    element.disabled = true;
    var amount = element.value;

    fetch('../api/v1/cart/' + productId, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        },
        body: JSON.stringify({
            amount: amount
        })
    })
    .then((resp) => {
        if (!resp.ok) {
            if (resp.status == 400) {
                $("#error_modal_title").text("Errore 400");
                $("#error_modal_body").text('Il valore di amount non è valido');
            } else if (resp.status == 404) {
                $("#error_modal_title").text("Errore 404");
                $("#error_modal_body").text('Il prodotto non è presente nel carrello');
            } else {
                $("#error_modal_title").text("Errore 500");
                $("#error_modal_body").text('Errore comunicazione con il server');
            }
            $("#error_modal").modal("show");
            throw new Error();
        } else {
            return resp.json();
        }
    }).then((cartProduct) => {

        fetch('../api/v1/products/' + cartProduct.productId, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': localStorage.getItem('token'),
                'user-id': localStorage.getItem('user_id')
            }
        })
        .then((response) => {
            if (!response.ok) {
                if (response.status == 404) {
                    $("#error_modal_title").text("Errore 404");
                    $("#error_modal_body").text('Il prodotto non è presente nel carrello');
                } else {
                    $("#error_modal_title").text("Errore 500");
                    $("#error_modal_body").text('Errore comunicazione con il server');
                }
                $("#error_modal").modal("show");
                throw new Error();
            } else {
                return response.json();
            }
        }).then((product) => {

            var toastId = productId + "_" + amount;

            var successToast = `
            <div class="toast" id="${toastId}" data-delay="10000">
                <div class="toast-header">
                    <strong class="mr-auto">Successo</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="toast-body">
                    La quantità del prodotto "${product.name}" è stata aggiornata a ${cartProduct.amount}.
                </div>
            </div>
            `;

            $("#toast_container").append(successToast);
            $("#" + toastId).toast();
            $("#" + toastId).toast('show');

            element.disabled = false;
            $("#loading_amount_" + productId).addClass("d-none");

        })
        .catch(error => {
            $("#error_modal").modal("show");
            $('#btn_login_text').removeClass('d-none');
            $('#btn_login_spinner').addClass('d-none');
            $("#btn_login").attr("disabled", false);
        });

    })
    .catch(error => {
        $("#error_modal").modal("show");
        $('#btn_login_text').removeClass('d-none');
        $('#btn_login_spinner').addClass('d-none');
        $("#btn_login").attr("disabled", false);
    });
}

function deleteProduct(element, productId, productName) {

    element.disabled = true;

    fetch('../api/v1/cart/' + productId, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        }
    })
    .then((resp) => {
        if (!resp.ok) {
            if (resp.status == 404) {
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
    }).then((cartProduct) => {

        var toastId = productId;

        var successToast = `
        <div class="toast" id="${toastId}" data-delay="10000">
            <div class="toast-header">
                <strong class="mr-auto">Successo</strong>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                Il prodotto "${productName}" stato rimosso dal carrello.
            </div>
        </div>
        `;

        $("#toast_container").append(successToast);
        $("#" + toastId).toast();
        $("#" + toastId).toast('show');

        $(element).closest(".card").fadeOut("slow", function (){
            $(element).closest(".card").remove();
            $("#navbar_cart_total").text($("#navbar_cart_total").text() - 1);
        });

    })
    .catch(error => {
        $("#error_modal").modal("show");
        $('#btn_login_text').removeClass('d-none');
        $('#btn_login_spinner').addClass('d-none');
        $("#btn_login").attr("disabled", false);
    });
}

$(document).ready(function(){
    loadCart();
});
