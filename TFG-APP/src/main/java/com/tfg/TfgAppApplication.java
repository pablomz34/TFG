package com.tfg;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.tfg.entities.Administradores;
import com.tfg.entities.Medicos;
import com.tfg.repositories.AdministradoresRepository;
import com.tfg.repositories.MedicosRepository;

@SpringBootApplication
public class TfgAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(TfgAppApplication.class, args);
	}
	
	
	

	

}
