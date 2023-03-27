package com.tfg.controllers;

import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;

import jakarta.servlet.http.HttpSession;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

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
    	
        MedicosDto medicoDto = new MedicosDto();
        model.addAttribute("medico", medicoDto);
        return "registro";
    }
    
    @PostMapping("/registro/guardar")
    public String registration(@Valid @ModelAttribute("medico") MedicosDto medicoDto,
                               BindingResult result,
                               Model model){
        Medicos existingUser = medicosService.findMedicosByCorreo(medicoDto.getCorreo());

        if(existingUser != null && existingUser.getCorreo() != null && !existingUser.getCorreo().isEmpty()){
            result.rejectValue("correo", null,
                    "There is already an account registered with the same email");
        }

        if(result.hasErrors()){
            model.addAttribute("medico", medicoDto);
            return "/registro";
        }

        medicosService.guardarMedico(medicoDto);
        return "redirect:/registro?success";
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

}
