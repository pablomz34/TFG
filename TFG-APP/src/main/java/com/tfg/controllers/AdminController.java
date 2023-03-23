package com.tfg.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.tfg.dto.MedicosDto;
import com.tfg.services.IMedicosService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminController {
		
	@Autowired
	private IMedicosService medicosService;
	
	@Autowired
	private HttpSession session;
	
	@GetMapping()
	public String adminIndex() {
		return "index";
	}
	
	
	@GetMapping("/medicos")
    public String users(Model model){
        List<MedicosDto> medicos = medicosService.findAllMedicos();
        model.addAttribute("medicos", medicos);
        return "medicos";
    }
	
}
