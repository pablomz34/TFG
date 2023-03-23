package com.tfg.handlers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.tfg.entities.Medicos;
import com.tfg.entities.Roles;
import com.tfg.services.IMedicosService;

import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;



@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

	
	@Autowired
    private IMedicosService medicosService;

	
	@Autowired
	private HttpSession session;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		// TODO Auto-generated method stub
		
		String correo = ((org.springframework.security.core.userdetails.User)
				authentication.getPrincipal()).getUsername();
		
		Medicos medico = medicosService.findMedicosByCorreo(correo);
		
		session.setAttribute("medico", medico.getCorreo());
  
		response.sendRedirect("admin/fases");
	}



}
