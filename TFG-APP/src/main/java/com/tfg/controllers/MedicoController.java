package com.tfg.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.tfg.services.IUsuariosService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/medico")
public class MedicoController {

	
	@Autowired
	private IUsuariosService usuariosService;
	
	@Autowired
	private HttpSession session;
	
	
	
	@GetMapping
	public String indexMedico() {
		return "index_medico";
	}
	
	
}
