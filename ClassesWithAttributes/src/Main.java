
public class Main {

	public static void main(String[] args) {
		Product product = new Product();
		product.name ="laptop" ;
		product.id = 1 ;
		product.descrription ="HP Laptop" ;
		product.price = 5000 ;
		product.stockAmount = 8 ;
 		
		ProductManager productManager = new ProductManager();
		productManager.Add(product);
	}

}
