package com.tfg.controllers;


import com.tfg.dto.MedicosDto;
import com.tfg.services.IMedicosService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
@RequestMapping("/registro")
public class MedicosController {

	@Autowired
	private IMedicosService service;
	
	
	@GetMapping("/getAll")
	public List<MedicosDto> getAll(){
		List<MedicosDto> admins= service.findAll();
		return admins;
	}
	
	@ModelAttribute("medico")
	public MedicosDto retornarNuevoMedicoRegistroDto() {
		return new MedicosDto();
	}
	
	@GetMapping
	public String mostrarFormularioRegistro() {
		return "registro";
	}
	
	@PostMapping
	public String registrarMedico(@ModelAttribute("medico") MedicosDto registroDto) {
		service.guardar(registroDto);
		return "redirect:registro?exito";
	}
}
