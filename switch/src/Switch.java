
public class Switch {

	public static void main(String[] args) {
		char grade = 'Y';
		switch (grade) {

		case 'A':
			System.out.println("Mükkemmel Geçtiniz ");
			break;
		case 'B':
			System.out.println("Çok iyi Geçtiniz ");
			break;
		case 'C':
			System.out.println("İyi Geçtiniz ");
			break;
		case 'F':
			System.out.println("Kaldınız ! ");
			break;
		default:
			System.out.println("Geçersiz Bir not girdiniz  ");

		}

	}

}
