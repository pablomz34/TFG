package com.tfg.controllers;

import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;

import jakarta.servlet.http.HttpSession;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;
import com.tfg.entities.Roles;
import com.tfg.services.IMedicosService;

@Controller
public class AuthController {
	
	@Autowired
	private IMedicosService medicosService;
	
	@Autowired 
	private HttpSession session;

	
	@GetMapping("/admin/fases")
    public String fases(){
        return "fases";
    }
	
	
    // handler method to handle home page request
    @GetMapping("/index")
    public String index(){
        return "index";
    }
    
    
    @GetMapping("/")
    public String index2(){ 
    	
    	
    	return "index";
    }
    
    @GetMapping("/registro")
    public String showRegistrationForm(Model model){
        // create model object to store form data
    	
    	if(RedirectLoginRegistro()) {
    		return "redirect:/";
    	}
    	
        MedicosDto medico = new MedicosDto();
        model.addAttribute("medico", medico);
        return "registro";
    }
    
    @PostMapping("/registro/guardar")
    public String registration(@Valid @ModelAttribute("medico") MedicosDto medicoDto,
                               BindingResult result,
                               Model model){
    		
    	if(result.hasErrors() || !ValidarRegistro(medicoDto, result, model)) {
    		model.addAttribute("medico", medicoDto);
    		return "/registro";
    	}
    	else {
    		medicosService.guardarMedico(medicoDto);
            
            return "redirect:/registro?success";
    	}
        
    }
    
    
    @GetMapping("/login")
    public String login(){
    	
    	if(RedirectLoginRegistro()) {
    		return "redirect:/";
    	}
    	
        return "login";
    }
    
    private boolean RedirectLoginRegistro() {
    	Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	
    	Medicos medico = medicosService.findMedicosByCorreo(auth.getName());
    	
        if (medico != null) {
            return true;
        }
        
        return false;
    }
    
    
    private boolean ValidarRegistro(MedicosDto medicoDto,
                               BindingResult result,
                               Model model) {
    	
    	 Medicos userByCorreo = medicosService.findMedicosByCorreo(medicoDto.getCorreo());

         if(userByCorreo != null && userByCorreo.getCorreo() != null && !userByCorreo.getCorreo().isEmpty()){
             result.rejectValue("correo", null,
                     "Ya existe una cuenta creada con ese correo");
         }
         
         Medicos userByDni = medicosService.findMedicosByDni(medicoDto.getDni());
         
         if(userByDni != null && userByDni.getDni() != null && !userByDni.getDni().isEmpty()){
             result.rejectValue("dni", null,
                     "Ya existe una cuenta creada con este DNI");
         }
         
         if(!medicoDto.getPassword().equals(medicoDto.getRepeatPassword())) {
         	 result.rejectValue("repeatPassword", null,
                      "Las contraseñas deben coincidir");
         }
         
         if(!validarNifNie(medicoDto.getDni())) {
        	 result.rejectValue("dni", null,
                     "El dígito de control del NIF/NIE no es válido");
         }
         
         if(result.hasErrors()) {
        	 return false;
         }
    	
    	 return true;
    }
    
    
    private boolean validarNifNie(String nifNie) {
        String letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        boolean valido = false;

        if (nifNie != null && nifNie.matches("^[XYZ]?\\d{7,8}[A-Z]$")) {
            String numero = nifNie.replaceAll("[^0-9]", ""); // Eliminar letra del NIF/NIE
            int indice = Integer.parseInt(numero) % 23;
            char letra = nifNie.charAt(nifNie.length() - 1);

            if (letra == letras.charAt(indice)) {
                valido = true;
            }
        }

        return valido;
    }



}
