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

import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.repositories.RolesRepository;
import com.tfg.services.IUsuariosService;

import jakarta.persistence.EntityManager;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;



@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {
	
	@Autowired
	private RolesRepository rolesRep;
	
	@Autowired
    private IUsuariosService medicosService;
	
	@Autowired
	private HttpSession session;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {
		// TODO Auto-generated method stub
		
		String correo = ((org.springframework.security.core.userdetails.User)
				authentication.getPrincipal()).getUsername();
		Usuarios usuario = medicosService.findUsuariosByCorreo(correo);		
		
		session.setAttribute("usuario", usuario.getCorreo());
		
		ArrayList<String> rolesNames = new ArrayList<String>();
			
		for(Roles rol: usuario.getRoles()) {
			rolesNames.add(rol.getNombre());
		}
	
		if(rolesNames.contains("ROLE_ADMIN")) {
			response.sendRedirect("admin/fases");
		}
		else if(rolesNames.contains("ROLE_MEDICO")){
			response.sendRedirect("medico");
		}
		
	}



}
