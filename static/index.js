/**
 * This function refresh the list of products
 */
function loadProducts() {

    const ul = document.getElementById('products');

    ul.innerHTML = '';

    fetch('../api/v1/products')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data
        
        // console.log(data);
        
        return data.map(function(product) { // Map through the results and for each run the code below
            
            let li = document.createElement('li');
            let span = document.createElement('span');
            let br = document.createElement('br');
            span.innerHTML = `<a href="product_details.html?id=${product._id}"> Nome:${product.name} Descrizione:${product.description} Prezzo:${product.price} Quantità:${product.amount}</a>`;
            
            // Append all our elements
            li.appendChild(span);
            ul.append(br);
            ul.appendChild(li);
        })
    })
    .catch( error => console.error(error) );// If there is any error you will catch them here
}