package PolymorphismDemo;



public class Main {

	public static void main(String[] args) {
		BaseLogger[] loggers = new BaseLogger[] {new FileLogger(), new EmailLoger(), new DatabaseLOgger(), new ConsoleLogger()};
		for (BaseLogger logger:loggers) {
			logger.log("Log Mesajı");
		} 
	CustomerManager customerManager = new CustomerManager(new DatabaseLOgger());
	customerManager.add();


	}

}
