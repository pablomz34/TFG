package com.tfg.handlers;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.services.IUsuariosService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;


@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {
	
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
		
		session.setAttribute("idUsuario", usuario.getId());
		session.setAttribute("usuario", usuario.getCorreo());
		session.setAttribute("nombreUsuario", usuario.getNombre());
		session.setAttribute("rol", usuario.getRoles().get(0).getNombre());
		ArrayList<String> rolesNames = new ArrayList<String>();
			
		for(Roles rol: usuario.getRoles()) {
			rolesNames.add(rol.getNombre());
		}
	
		if(rolesNames.contains("ROLE_ADMIN")) {
			response.sendRedirect("index");
		}
		else if(rolesNames.contains("ROLE_MEDICO")){
			response.sendRedirect("index");
		}
		
	}



}
