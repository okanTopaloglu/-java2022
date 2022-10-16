
public class Product {
	
	
	//attribute | field
	private int _id;
	private String _name ;
	private String _description;
	private double _price;
	private int _stockAmount;
	private String _renk ;
	private String _kod;
	
	//getter
	public int getId() {
		return _id;
	}
	//setter
	public void setId(int id) {
		_id = id ;
	}
	public String getName() {
		return _name;
	}
	public void setName(String name) {
		_name = name;
	}
	public String getDescription() {
		return _description;
	}
	public void setDescriptions(String descriptions) {
		_description=descriptions;
	}
	public double getPrice() {
		return _price;
	}
	public void setPrice(double price) {
		this._price = price;
	}
	public int getStockAmount() {
		return _stockAmount;
	}
	public void setStockAmount(int stockAmount) {
		this._stockAmount = stockAmount;
	}
	public String getRenk() {
		return _renk;
	}
	public void setRenk(String renk) {
		this._renk = renk;
	}
	public String getKod() {
		return this._name.substring(0,1) + _id ;
	}

	

}
