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
                            <div class="col-sm embed-responsive embed-responsive-16by9">
                                <img alt="" class="card-img embed-responsive-item" src="${product.image}" />
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${product.name}</h5>
                                    <p class="card-text">${product.description}</p>
                                    <div class="row mt-5">
                                        <div class="col-sm">
                                            <div class="form-inline">
                                                <label class="my-1 mr-2" for="cart-item-amount">Quantità </label>
                                                <input class="my-1 mr-sm-2 form-control col-md-3" type="number" id="cart-item-amount" value="${item.amount}" min="1" max="5">
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

$(document).ready(function(){
    loadCart();
});
