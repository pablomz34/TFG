package com.tfg.controllers;

import com.tfg.dto.AdministradoresDto;
import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;
import com.tfg.repositories.MedicosRepository;
import com.tfg.services.IAdministradoresService;
import com.tfg.services.IMedicosService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MedicosController {

	@Autowired
	private IMedicosService service;
	
	
	@GetMapping("/getAll")
	public List<MedicosDto> getAll(){
		List<MedicosDto> admins= service.findAll();
		return admins;
	}
}
