package com.tfg;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TfgAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(TfgAppApplication.class, args);

		try {
			// Se lanza el ejecutable.
			String ruta = "cmd /c " + System.getProperty("user.dir") + "\\src\\main\\resources\\python\\HolaMundo.py";
			
			Process p = Runtime.getRuntime().exec(ruta);

			// Se obtiene el stream de salida del programa
			InputStream is = p.getInputStream();

			/* Se prepara un bufferedReader para poder leer la salida más comodamente. */
			BufferedReader br = new BufferedReader(new InputStreamReader(is));

			// Se lee la primera linea
			String aux = br.readLine();
			System.out.println(aux);
		} catch (Exception e) {
			// Excepciones si hay algún problema al arrancar el ejecutable o al leer su
			// salida.*/
			e.printStackTrace();
		}

	}

}
