package com.tfg.handlers;

import java.io.IOException;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.tfg.entities.Medicos;

import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;



@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

	
	@Autowired
	private HttpSession session;
	
	@Autowired
    private EntityManager entityManager; 


	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		// TODO Auto-generated method stub
		String correo = ((org.springframework.security.core.userdetails.User)
				authentication.getPrincipal()).getUsername();
		
		
		Medicos m = entityManager.createNamedQuery("Medicos.getMedico", Medicos.class)
					.setParameter("correo", correo)
					.getSingleResult();
		
		
		session.setAttribute("medico", m);
		
		response.sendRedirect("/fases");
	}



}
