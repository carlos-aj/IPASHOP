let categoriesCount = 5;
let offset = 0;
let limit = 10;
let peticion = false;
let currentCategoryId = null;
let arrayCar = [];

window.onload = () => {
    const logo = document.getElementById("logo");
    const categorias = document.getElementById('categoriesContainer');
    const car = document.getElementById("car");
    const home = document.getElementById("home");

    showCategories();
    showProductHero();

    logo.addEventListener("click", () => {
        const categorias = document.getElementById('categoriesContainer');
        
        categorias.style.opacity = "0"; 
        categorias.style.zIndex = "0"; 
    
        setTimeout(() => {
            categorias.innerHTML = "";  
            document.body.style.overflow = ""; 
        }, 300); 
    
        
        document.body.style.overflow = "auto";
    });

    car.addEventListener("click", () => {
        showCar();
    });

    home.addEventListener("click", () => {
        categorias.innerHTML = "";
        categorias.style.opacity = "0";
        categorias.style.zIndex = "0";
        document.body.style.overflow = "";
    });

    categorias.addEventListener("scroll", () => {
        let scrollTop = categorias.scrollTop;
        let scrollHeight = categorias.scrollHeight;
        let clientHeight = categorias.clientHeight;

        let endOfPage = scrollTop + clientHeight >= scrollHeight * 0.8;

        if (endOfPage && !peticion) {
            peticion = true;
            offset += 10;  
            limit += 10;   
            completeCantegorie(currentCategoryId);  
        }
    });
};

function showCategories() {
    fetch("https://api.escuelajs.co/api/v1/categories", { method: "GET" })
        .then((res) => res.json())
        .then((categories) => {
            let carousel = document.getElementsByClassName("carousel")[0];
            carousel.innerHTML = "";

            let validCount = 0;

            categories.forEach((category) => {
                if (validCount >= categoriesCount) return;

                let div = document.createElement("div");
                div.setAttribute("class", "carousel-item");

                let img = document.createElement("img");
                img.src = category.image;
                img.id = category.id;
                img.alt = category.name;

                img.onerror = () => {
                    console.warn(`Error loading image: ${category.image}, skipping...`);
                };

                img.onload = () => {
                    div.appendChild(img);
                    carousel.appendChild(div);
                    validCount++;
                };

                img.addEventListener("click", () => {
                    currentCategoryId = img.id;
                    offset = 0;
                    limit = 10;
                    completeCantegorie(currentCategoryId);
                });
            });
        })
        .catch((error) => {
            console.error("Error fetching categories:", error);
        });
}

function completeCantegorie(categorie) {
    let categorieWindow = document.getElementById("categoriesContainer");

    let currentScrollPosition = categorieWindow.scrollTop;

    document.body.style.overflow = "hidden";
    categorieWindow.style.opacity = "1";
    categorieWindow.style.zIndex = "1";

    document.body.appendChild(categorieWindow);
    peticion = true;

    let divG = document.createElement("div");
    divG.setAttribute("class", "itemsPosition");
    categorieWindow.appendChild(divG); 

    const defaultImage = "./imgs/notFound.jpg"; 

    fetch(`https://api.escuelajs.co/api/v1/categories/${categorie}/products?offset=${offset}&limit=${limit}`, { method: "GET" })
        .then((res) => res.json())
        .then((products) => {
            peticion = false; 

            products.forEach((product) => {
                let div = document.createElement("div");
                div.setAttribute("class", "item");
                divG.appendChild(div);

                let img = document.createElement("img");
                let name = document.createElement("p");
                let price = document.createElement("p");

                img.src = product.images[0] || defaultImage; 

                img.onerror = () => {
                    img.src = defaultImage; 
                    console.warn(`Error loading image: ${product.images[0]}, using default image...`);
                };

                name.textContent = product.title;
                price.textContent = `${product.price} $`;

                div.appendChild(img);
                div.appendChild(name);
                div.appendChild(price);

                img.addEventListener("click", () => productSelected(product.id));
            });

            categorieWindow.scrollTop = currentScrollPosition;
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            peticion = false;
        });
}



function showProductHero() {
    let product1 = document.getElementById("product1");
    let product2 = document.getElementById("product2");
    const num = [39, 10, 25, 50, 43, 47];

    let item1 = num[Math.floor(Math.random() * num.length)];
    let item2;

    do {
        item2 = num[Math.floor(Math.random() * num.length)];
    } while (item1 === item2);

    showSingleProduct(product1, item1);
    showSingleProduct(product2, item2);
}

function showSingleProduct(product, num) {
    fetch("https://api.escuelajs.co/api/v1/products/" + num, { method: "GET" })
        .then((res) => res.json())
        .then((obj) => {
            let img = document.createElement("img");
            let name = document.createElement("p");
            let price = document.createElement("p");

            img.src = obj.images[0];
            name.innerHTML = obj.title;
            price.innerHTML = `${obj.price} $`;

            img.id = num;

            img.addEventListener("click", () => productSelected(img.id));

            product.appendChild(img);
            product.appendChild(name);
            product.appendChild(price);
        });
}

function productSelected(id) {
    let productWindow = document.getElementById("categoriesContainer");
    productWindow.innerHTML = ""; 

    fetch("https://api.escuelajs.co/api/v1/products/" + id, { method: "GET" })
        .then((res) => res.json())
        .then((product) => {
            let images = product.images;
            let currentIndex = 0;

            document.body.style.overflow = "hidden"; 

            productWindow.style.opacity = "1";
            productWindow.style.zIndex = "1";

            
            let div = document.createElement("div");
            div.setAttribute("class", "singleProduct");

            
            let back = document.createElement("button");
            back.setAttribute("class", "backButton");
            back.textContent = "← Back";
            back.addEventListener("click", () => {
                document.body.style.overflow = "auto"; 
                completeCantegorie(product.category.id);
            });
            div.appendChild(back);

            
            let imgContainer = document.createElement("div");
            imgContainer.setAttribute("class", "imgContainer");

            let img = document.createElement("img");
            img.src = images[currentIndex];
            img.setAttribute("class", "productImage");
            imgContainer.appendChild(img);


            let prevButton = document.createElement("button");
            prevButton.setAttribute("class", "navButton prevButton");
            prevButton.textContent = "←";
            prevButton.addEventListener("click", () => {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                img.src = images[currentIndex];
            });
            imgContainer.appendChild(prevButton);

            let nextButton = document.createElement("button");
            nextButton.setAttribute("class", "navButton nextButton");
            nextButton.textContent = "→";
            nextButton.addEventListener("click", () => {
                currentIndex = (currentIndex + 1) % images.length;
                img.src = images[currentIndex];
            });
            imgContainer.appendChild(nextButton);

            div.appendChild(imgContainer);


            let details = document.createElement("div");
            details.setAttribute("class", "details");

            let title = document.createElement("h2");
            title.textContent = product.title;
            details.appendChild(title);

            let price = document.createElement("p");
            price.setAttribute("class", "price");
            price.textContent = `$${product.price}`;
            details.appendChild(price);

            let description = document.createElement("p");
            description.setAttribute("class", "description");
            description.textContent = product.description;
            details.appendChild(description);

            let sell = document.createElement("button");
            sell.setAttribute("class", "addToCartButton");
            sell.textContent = "Add to Shopping Car";
            sell.addEventListener("click", () => addShoppingCar(product.id));
            details.appendChild(sell);

            div.appendChild(details);

            productWindow.appendChild(div);

            document.body.appendChild(productWindow);
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
        });
}

function addShoppingCar(id) {
    fetch("https://api.escuelajs.co/api/v1/products/" + id, { method: "GET" })
        .then((res) => res.json())
        .then((product) => {
            
            const existingProduct = arrayCar.find(item => item.id === id);

            if (existingProduct) {
                
                existingProduct.count++;
            } else {
                
                arrayCar.push({
                    id: id,
                    image: product.images[0],
                    title: product.title,
                    price: product.price,
                    count: 1,
                });
            }
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
        });
}

function showCar() {
    let categorieWindow = document.getElementById("categoriesContainer");
    document.body.style.overflow = "hidden";

    
    categorieWindow.innerHTML = "";

    if (arrayCar.length === 0) {
        let emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Your shopping cart is empty.";
        emptyMessage.classList.add("empty-message");
        categorieWindow.appendChild(emptyMessage);
    } else {
        let totalprice = 0;

        // Iterar sobre los productos en el carrito
        arrayCar.forEach((product) => {
            let div = document.createElement("div");
            div.classList.add("product-item");

            let img = document.createElement("img");
            img.src = product.image;
            img.classList.add("product-item-img");

            let title = document.createElement("p");
            title.textContent = product.title;
            title.classList.add("product-item-title");

            let price = document.createElement("p");
            price.textContent = `$${product.price}`;
            price.classList.add("product-item-price");

            let count = document.createElement("p");
            count.innerText = product.count;
            count.classList.add("product-item-count");
            count.id = `count-${product.id}`;

            let increase = document.createElement("button");
            increase.textContent = "+";
            increase.classList.add("product-item-button");
            increase.addEventListener("click", () => {
                product.count++;
                document.getElementById(`count-${product.id}`).innerText = product.count;
                updateTotalPrice();
            });

            let decrease = document.createElement("button");
            decrease.textContent = "-";
            decrease.classList.add("product-item-button");
            decrease.addEventListener("click", () => {
                if (product.count > 1) {
                    product.count--;
                    document.getElementById(`count-${product.id}`).innerText = product.count;
                    updateTotalPrice();
                } else {
                    arrayCar = arrayCar.filter(item => item.id !== product.id);
                    showCar();
                }
            });

            let quantityContainer = document.createElement("div");
            quantityContainer.classList.add("product-item-quantity");
            quantityContainer.appendChild(decrease);
            quantityContainer.appendChild(count);
            quantityContainer.appendChild(increase);

            div.appendChild(img);
            div.appendChild(title);
            div.appendChild(price);
            div.appendChild(quantityContainer);

            categorieWindow.appendChild(div);

            totalprice += product.price * product.count;
        });

        let totalDiv = document.getElementById("totalPrice");
        if (!totalDiv) {
            totalDiv = document.createElement("div");
            totalDiv.id = "totalPrice";
            totalDiv.classList.add("total-price");
            categorieWindow.appendChild(totalDiv);
        }
        totalDiv.textContent = `Total: $${totalprice.toFixed(2)}`;

        
        let checkoutButton = document.createElement("button");
        checkoutButton.textContent = "Proceed to Checkout";
        checkoutButton.classList.add("checkout-button");
        checkoutButton.addEventListener("click", () => {
            sellFunction(); 
        });

        categorieWindow.appendChild(checkoutButton);
    }

    
    categorieWindow.style.opacity = "1";
    categorieWindow.style.zIndex = "1";
}


function sellFunction() {
    
    let form = document.createElement("form");
    form.id = "purchaseForm";
    form.classList.add("purchase-form");

    
    let formTitle = document.createElement("h3");
    formTitle.textContent = "Enter your details to complete the purchase";
    form.appendChild(formTitle);

    
    let nameLabel = document.createElement("label");
    nameLabel.textContent = "Full Name:";
    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.required = true;
    nameInput.classList.add("purchase-form-input");
    form.appendChild(nameLabel);
    form.appendChild(nameInput);

    
    let emailLabel = document.createElement("label");
    emailLabel.textContent = "Email Address:";
    let emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.name = "email";
    emailInput.required = true;
    emailInput.classList.add("purchase-form-input");
    form.appendChild(emailLabel);
    form.appendChild(emailInput);

    
    let addressLabel = document.createElement("label");
    addressLabel.textContent = "Shipping Address:";
    let addressInput = document.createElement("input");
    addressInput.type = "text";
    addressInput.name = "address";
    addressInput.required = true;
    addressInput.classList.add("purchase-form-input");
    form.appendChild(addressLabel);
    form.appendChild(addressInput);

    
    let submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Complete Purchase";
    submitButton.classList.add("purchase-form-submit");
    form.appendChild(submitButton);

    
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        let name = nameInput.value;
        let email = emailInput.value;
        let address = addressInput.value;

        
        alert(`Purchase completed successfully!\n\nName: ${name}\nEmail: ${email}\nShipping Address: ${address}`);

        
        arrayCar = [];
        showCar();

        form.style.display = "none";
    });

    let categorieWindow = document.getElementById("categoriesContainer");
    categorieWindow.innerHTML = "";
    categorieWindow.appendChild(form);
}

function updateTotalPrice() {
    let totalprice = arrayCar.reduce((sum, product) => sum + product.price * product.count, 0);
    let totalDiv = document.getElementById("totalPrice");
    if (totalDiv) {
        totalDiv.textContent = `Total: ${totalprice.toFixed(2)} $`;
    }
}
