package com.tfg.services;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Usuarios;

@Service
public interface IUsuariosService {
	
	public void guardarMedico(UsuariosDto medico);
	
	public Usuarios findUsuariosByCorreo(String correo);
	
	public Usuarios findUsuariosByDni(String dni);
	
	public List<UsuariosDto> findAllMedicos();
}
