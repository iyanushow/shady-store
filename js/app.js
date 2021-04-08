// VARIABLES
cartDom      = document.querySelector('.cart'),
cartBtn      = document.querySelector('.cart-btn'),
cartTotal    = document.querySelector('.cart-total'),
cartItems    = document.querySelector('.cart-items'),
clearCart    = document.querySelector('.clear-cart'),
closeCartBtn = document.querySelector('.close-cart'),
cartOverlay  = document.querySelector('.cart-overlay'),
cartContent  = document.querySelector('.cart-content'),
productsDom  = document.querySelector('.products-center')


// MAIN CART 
let cart = []
let buttonsDOm = []

// getting products
class Products {
  async getProducts() {
    try {
      const result = await fetch('../data/products.json');
      const data = await result.json()
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return {title,price,id,image}
      })
      return products;
    } catch (err) {
      console.log(err)
    }
  }
}

// displaying products on UI
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(({ image, id, title, price }) => {
      result += ` <article class="product">
          <div class="img-container">
            <img src=${image} class="product-img" alt=${title}>
            <button class="bag-btn" data-id=${id}>
              <i class="fas fa-shopping-cart">
              </i>
              add to cart
            </button>
          </div>
          <h3>${title}</h3>
          <h4>#${price}</h4>
        </article>`;
    });

    productsDom.innerHTML = result;
  }
  getButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOm = buttons;
    buttons.forEach((button) => {
      const id = button.dataset.id;
      const inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (e) => {
        e.target.innerText = 'In Cart';
        e.target.disabled = true;

        // get single product
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add to cart
        cart = [...cart, cartItem];
        // add cart to local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // display on cart ui
        this.addCartItem(cartItem);
      });
    });
  }
  setCartValues(cart) {
    let priceTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      priceTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(priceTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<img src=${item.image} alt="product">
          <div>
            <h4>${item.title}</h4>
            <h5>#${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
          </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDom.classList.add('showCart');
  }
  closeCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDom.classList.remove('showCart'); 
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.closeCart);
  }
  populateCart(cart) {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }

  cartLogic() {
    clearCart.addEventListener('click', this.clearCart.bind(this));
    cartContent.addEventListener('click', e => {
      if (cart.length <= 0) {
        console.log('should close')
        this.closeCart();
      }
      if (e.target.classList.contains('remove-item')) {
        let itemToRemove = e.target;
        this.removeItem(itemToRemove.dataset.id);
        cartContent.removeChild(e.target.closest('.cart-item'));
        
      } else if (e.target.classList.contains('fa-chevron-up')) {
        let addAmount = e.target;
        cart = cart.map((item) => {
          if (item.id === addAmount.dataset.id) {
            item.amount += 1;
            addAmount.nextElementSibling.innerText = item.amount;
          }
          return item;
        });
        Storage.saveCart(cart);
        this.setCartValues(cart);
      } else if (e.target.classList.contains('fa-chevron-down')) {
        let subAmount = e.target;
        let item = cart.find((item) => item.id === subAmount.dataset.id);
        item.amount -= 1;
        if (item.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          subAmount.previousElementSibling.innerText = item.amount
        } else {
          this.removeItem(subAmount.dataset.id);
          cartContent.removeChild(subAmount.closest('.cart-item'))
        }
      }
    })
  }
  clearCart() {
    cart = []
    this.setCartValues(cart);
    Storage.saveCart(cart);
    cartContent.innerHTML =''
    buttonsDOm.forEach(btn => {
     btn.disabled = false;
     btn.innerText = 'Add To Cart';
    })
    this.closeCart()

  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let btn = this.getSingleBtn(id);
    btn.disabled = false;
    btn.innerText = 'Add To Cart'
  }
  getSingleBtn(id) {
    return buttonsDOm.find(button => button.dataset.id === id)
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  }
  static getCart(){
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }

}

window.onload = (e) => {
  const ui = new UI();
  const products = new Products();

  // SET UP APP
  ui.setupApp()

  // get all products
  products.getProducts().then(products => {
    ui.displayProducts(products)
    Storage.saveProducts(products)
  }).then(() => {
    ui.getButtons()
    ui.cartLogic()
  })
}