
class Product {
  constructor(categoria, descripcion, img, nombre, precio) {
    this.categoria = categoria;
    this.descripcion = descripcion;
    this.img = img;
    this.nombre = nombre;
    this.precio = precio;
  }

  displayProduct() {
    console.log(`Producto: ${this.nombre}`);
    console.log(`Categoría: ${this.categoria}`);
    console.log(`Descripción: ${this.descripcion}`);
    console.log(`Imagen: ${this.img}`);
    console.log(`Precio: $${this.precio}`);
  }
}

async function products() {
  let products = await fetch("https://script.google.com/macros/s/AKfycbyF6W6exVJ0ttrkbqN3jvkyqrjr38V14xLreckXkpfWyYZqiWxIc-26pz5sPEz1aTmW4Q/exec"); 
  let product = await products.json();

  let productInfo = product.data[0]
  product = new Product(productInfo.categoria, productInfo.descripcion, productInfo.img, productInfo.nombre, productInfo.precio)

  console.log(product)
}

function createProduct() {
  
}

products()
