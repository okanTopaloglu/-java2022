package PolymorphismDemo;

public class EmailLoger extends BaseLogger {
	public void log(String message) {
		System.out.println("Logged to Email :" + message);
	}
}
