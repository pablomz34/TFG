package com.tfg.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;
import com.tfg.services.IMedicosService;

@RestController
@RequestMapping("/fases")
public class FasesController {
	
	@Autowired
	private IMedicosService medicosService;

	@GetMapping("/getMedicos")
	public List<MedicosDto> getMedicos(){
		List<MedicosDto> medicos = medicosService.findAllMedicos();
        return medicos;
	}
	 
}
