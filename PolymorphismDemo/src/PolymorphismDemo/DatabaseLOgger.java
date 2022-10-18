package PolymorphismDemo;

public class DatabaseLOgger  extends BaseLogger{
	public void log(String message) {
		System.out.println("Logged to Database :" + message);
	}

}
