package com.tfg.controllers;

import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriUtils;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Usuarios;
import com.tfg.services.IUsuariosService;

import jakarta.validation.Valid;

@Controller
public class AuthController {
	
	@Autowired
	private IUsuariosService usuariosService;
	
	
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
    	
        UsuariosDto medico = new UsuariosDto();
        model.addAttribute("medico", medico);
        return "registro";
    }
    
    
    @GetMapping("/registro/comprobarCorreo")
    @Transactional
    public ResponseEntity<?> comprobarCorreo(@RequestParam("correo") String correo) { 
    		
    	String scapedCorreo = UriUtils.encodeQueryParam(correo, StandardCharsets.UTF_8);
		Usuarios medico = usuariosService.findUsuariosByCorreo(scapedCorreo);
	    boolean correoExiste = (medico != null && medico.getCorreo() != null && !medico.getCorreo().isEmpty());
	    return new ResponseEntity<>(correoExiste, HttpStatus.OK);
    }
    
    
    @GetMapping("/registro/comprobarDNI")
    @Transactional
    public ResponseEntity<?> comprobarDNI(@RequestParam("dni") String dni) { 
    		
    	String scapedDNI = UriUtils.encodeQueryParam(dni, StandardCharsets.UTF_8);
    	Usuarios usuario = usuariosService.findUsuariosByDni(scapedDNI);
	    boolean DNIExiste = (usuario != null && usuario.getCorreo() != null && !usuario.getCorreo().isEmpty());
	    return new ResponseEntity<>(DNIExiste, HttpStatus.OK);
    }
    @PostMapping("/registro/guardar")
    public String registration(@Valid @ModelAttribute("medico") UsuariosDto medicoDto,
                               BindingResult result,
                               Model model){
    		
    	if(result.hasErrors() || !ValidarRegistro(medicoDto, result, model)) {
    		model.addAttribute("medico", medicoDto);
    		return "/registro";
    	}
    	else {
    		usuariosService.guardarMedico(medicoDto);
            
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
    	
    	Usuarios medico = usuariosService.findUsuariosByCorreo(auth.getName());
    	
        if (medico != null) {
            return true;
        }
        
        return false;
    }
    
    
    private boolean ValidarRegistro(UsuariosDto medicoDto,
                               BindingResult result,
                               Model model) {
    	
    	 Usuarios medicoByCorreo = usuariosService.findUsuariosByCorreo(medicoDto.getCorreo());

         if(medicoByCorreo != null && medicoByCorreo.getCorreo() != null && !medicoByCorreo.getCorreo().isEmpty()){
             result.rejectValue("correo", null,
                     "Ya existe una cuenta creada con ese correo");
         }
         
         Usuarios medicoByDni = usuariosService.findUsuariosByDni(medicoDto.getDni());
         
         if(medicoByDni != null && medicoByDni.getDni() != null && !medicoByDni.getDni().isEmpty()){
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
    	final String letras = "TRWAGMYFPDXBNJZSQVHLCKE";
        final String letra = String.valueOf(nifNie.charAt(8)).toUpperCase();

        if (nifNie.matches("^[XYZ].*")) {
            // convertir primera letra a número
            int firstChar = 0;
            switch (nifNie.charAt(0)) {
                case 'X':
                    firstChar = 0;
                    break;
                case 'Y':
                    firstChar = 1;
                    break;
                case 'Z':
                    firstChar = 2;
                    break;
            }
            int number = Integer.parseInt(firstChar + nifNie.substring(1, 8));
            int index = number % 23;
            return letra.equals(String.valueOf(letras.charAt(index)));
        }

        // comprobar si es NIF
        int number = Integer.parseInt(nifNie.substring(0, 8));
        int index = number % 23;
        return letra.equals(String.valueOf(letras.charAt(index)));
    }



}
