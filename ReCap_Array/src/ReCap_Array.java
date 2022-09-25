
public class ReCap_Array {

	public static void main(String[] args) {
		double[] myList = {1.2,6.3,4.2,5.6};
		double max = myList[0] ;
		double total =  0;
		for(double number:myList) {
			if(max<number) {
				max=number ;
			}
			total = total + number ;
			System.out.println(number);
			
		}
		//Toplam sayı
		
		System.out.println("toplam= " + total);
		System.out.println("En büyük= " + max);

		
		
		
		
	}

}
