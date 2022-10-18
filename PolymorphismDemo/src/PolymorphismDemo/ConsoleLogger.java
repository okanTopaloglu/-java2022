package PolymorphismDemo;

public class ConsoleLogger extends BaseLogger {
	
	public final void log(String message) {
		System.out.println("Logged to Console :" + message);
	}

}
