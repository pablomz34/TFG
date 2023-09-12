/*
  
 TFG Realizado por: Pablo Martínez Muñoz, Óscar Molano Buitrago y Cristina Ioana Duduta 
 
 Dirigido por: Antonio Sarasa Cabezuelo y María Covadonga Díez Sanmartín
 
 Curso: 2022/23
 
 Universidad Complutense de Madrid - Facultad de Informática
 
 */

package com.tfg;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TfgAppApplication {

	public static void main(String[] args) {

		SpringApplication.run(TfgAppApplication.class, args);

		closeWireMockServer();

		String rutaWireMock = "src\\main\\WireMock";

		try {
			ProcessBuilder builder = new ProcessBuilder("java", "-jar", "wiremock-jre8-standalone-2.35.0.jar", "--port",
					"8090", "--verbose");
			builder.directory(new File(rutaWireMock)); // Establecer el directorio de trabajo
			builder.redirectErrorStream(true);
			Process wireMockProcess = builder.start();
			
			// Leer la salida del proceso (puede omitirse si no es necesario)
			BufferedReader reader = new BufferedReader(new InputStreamReader(wireMockProcess.getInputStream()));
			String linea;
			while ((linea = reader.readLine()) != null) {
				System.out.println(linea);
			}
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private static void closeWireMockServer()  {
		
		try {
			Process process = Runtime.getRuntime().exec("curl -X POST http://localhost:8090/__admin/shutdown");

			process.waitFor();
			
		} catch (IOException | InterruptedException e) {
			e.printStackTrace();
		}
		
	}
}
