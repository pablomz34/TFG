package com.tfg.controllers;

import com.tfg.dto.AdministradoresDto;
import com.tfg.entities.Administradores;
import com.tfg.services.IAdministradoresService;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/administradores")
public class AdministradoresController {

	@Autowired
	private IAdministradoresService service;

	@GetMapping("/getAll")
	public List<AdministradoresDto> getAll(){
		List<AdministradoresDto> admins= service.findAll();
		return admins;
	}
	
	@GetMapping("/getByDni/{dni}")
	public AdministradoresDto getByDni(@PathVariable("dni") String dni){
		AdministradoresDto admin = service.findByDni(dni);
		return admin;
	}
	
	
	
}
