
public class AsalSayi {

	public static void main(String[] args) {
		int number = 19;
		int remainder;
		
		if(number<2) {
			System.out.println("Geçersiz Sayı");
			return;
		}
		for (int i = 2; i < 11; i++) {
			remainder = number % i;
			if (remainder == 0) {
				if(i!=number) {
				System.out.println("Sayı Asal Sayı değildir!");
				return;
			}
			}
			if (i < 10) {
				continue;
			} else {
				System.out.println("Sayı Asal Sayıdır");
				return;
			}

		}

	}

}
