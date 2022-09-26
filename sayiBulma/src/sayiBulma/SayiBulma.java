package sayiBulma;

public class SayiBulma {

	public static void main(String[] args) {
		int[] sayilar = new int[] {1,2,5,7,9,0};
		int aranacak = 9 ;
		boolean buldum = false ;
		
		for(int i=0;i<sayilar.length;i=i+1) {
			if(sayilar[i]==aranacak) {
				buldum = true ;
				break;
				}
			
			}
		if(buldum) {
			System.out.println("Aranan saı sayıların içinde var ");
		}
		else {
			System.out.println("Aranan saı sayıların içinde yok ");
		}
		
		

	}

}
