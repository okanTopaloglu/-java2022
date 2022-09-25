
public class MultiArray {

	public static void main(String[] args) {
		String[][] sehirler = new String[3][3];
		int i;
		int j;
		int g = 0;
		String[] sehirSec = new String[9];
		sehirSec[0] = "Ankara";
		sehirSec[1] = "İstanbul";
		sehirSec[2] = "İzmir";
		sehirSec[3] = "Antalya";
		sehirSec[4] = "Çanakkale";
		sehirSec[5] = "Tekirdağ";
		sehirSec[6] = "Edirne";
		sehirSec[7] = "Balıkesir";
		sehirSec[8] = "Bursa";

		for (i = 0; i <= 2; i++) {

			for (j = 0; j <= 2; j++) {

				sehirler[i][j] = sehirSec[g];

				System.out.println(sehirler[i][j] + " - " + i + "," + j);
				g = g + 1;

			}

		}
		System.out.println("yerleştirme bitti.");
	}

}
