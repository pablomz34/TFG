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

import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;
import com.tfg.services.IMedicosService;

@Controller
public class AuthController {
	
	@Autowired
	private IMedicosService medicosService;

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
        MedicosDto medico = new MedicosDto();
        model.addAttribute("medico", medico);
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
    
    @GetMapping("/medicos")
    public String users(Model model){
        List<MedicosDto> medicos = medicosService.findAllMedicos();
        model.addAttribute("medicos", medicos);
        return "medicos";
    }
    
    @GetMapping("/fases")
    public String fases(){
        return "fases";
    }
    
    @GetMapping("/login")
    public String login(){
        return "login";
    }
}
