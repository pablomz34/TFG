package com.tfg.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Usuarios;

@Service
public interface IUsuariosService {
	
	public void guardarMedico(UsuariosDto medico);
	
	public Usuarios findUsuariosByCorreo(String correo);
	
	public Usuarios findUsuariosByDni(String dni);
	
	public Usuarios findUsuarioById(Long idUsuario);
	
	public void updateDatoPerfilUsuario(Long idUsuario, String dato, String columnName);
	
	public List<UsuariosDto> findAllMedicos();
}
