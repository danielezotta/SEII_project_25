function loadCart() {

    fetch('../api/v1/cart/', {
        method: 'GET',
        headers: {
            'Content-type': 'application/json',
            'x-access-token': localStorage.getItem('token'),
            'user-id': localStorage.getItem('user_id')
        }
    })
    .then(response => response.json())
    .then((items) => {

        items.forEach(function(item) {
            fetch('../api/v1/products/' + item.productId, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                    'user-id': localStorage.getItem('user_id')
                }
            })
            .then(resp => resp.json())
            .then((product) => {

                $("#cart_container").append(

                    `<div class="card mt-2 mb-2">
                        <div class="row">
                            <div class="col-sm">
                                <img alt="" class="img-fluid card-img" src="${product.image}" style="object-fit:cover; max-height: 300px;" />
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${product.name}</h5>
                                    <p class="card-text">${product.description}</p>
                                    <div class="row mt-auto">
                                        <div class="col-sm">
                                            <div class="form-inline">
                                                <label class="my-1 mr-2" for="cart-item-amount">Quantità </label>
                                                <input class="my-1 mr-sm-2 form-control col-md-3" type="number" id="cart-item-amount" value="${item.amount}" min="1" max="${product.amount}" onchange="changeProductAmount(this, '${item.productId}')">
                                            </div>
                                        </div>
                                        <div class="col-sm text-right">
                                            <p class="cart-text font-weight-bold h1">${product.price} €</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
                );
            });
        });

        $('#loading_cart').addClass('d-none');

    });

};

function changeProductAmount(element, productId) {

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
    .then(resp => resp.json())
    .then((product) => {

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
                La quantità del prodotto è stata aggiornata.
            </div>
        </div>
        `;

        $("#toast_container").append(successToast);
        $("#" + toastId).toast();
        $("#" + toastId).toast('show');

        element.disabled = false;

    });
}

$(document).ready(function(){
    loadCart();
});
