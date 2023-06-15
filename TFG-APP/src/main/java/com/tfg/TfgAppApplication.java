package com.tfg;

import java.io.File;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TfgAppApplication {

	public static void main(String[] args) {
		
//		try {
//
//			String comando = "java";
//			String argumento1 = "-jar";
//			String argumento2 = "wiremock-jre8-standalone-2.35.0.jar";
//			String argumento3 = "--port";
//			String argumento4 = "8090";
//			String argumento5 = "--verbose";
//
//			ProcessBuilder builder = new ProcessBuilder(comando, argumento1, argumento2, argumento3, argumento4, argumento5);
//
//			builder.directory(new File("src\\main\\WireMock"));
//
//			Process wireMockServer = builder.start();
//		} catch (IOException e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
		
		
		SpringApplication.run(TfgAppApplication.class, args);
		
		
	}
}
