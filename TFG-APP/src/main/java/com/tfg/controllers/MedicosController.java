package com.tfg.controllers;

import com.tfg.entities.Medicos;
import com.tfg.repositories.MedicosRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MedicosController {

	@Autowired
	private MedicosRepository repos;
	
	@GetMapping("/medicos")
	public List<Medicos> getMedicos(){
		return repos.findAll();
	}
}
