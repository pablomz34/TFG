package com.tfg.controllers;

import com.tfg.entities.Administradores;
import com.tfg.repositories.AdministradoresRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AdministradoresController {

	@Autowired
	private AdministradoresRepository repos;
	
	@GetMapping("/administradores")
	public List<Administradores> getAdministradores(){
		return repos.findAll();
	}
}
