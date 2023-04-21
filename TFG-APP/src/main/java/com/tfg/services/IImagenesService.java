package com.tfg.services;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Usuarios;

@Service
public interface IImagenesService {
	
	public void guardarImagen(int numCluster, String ruta);
	
	public Imagenes findClusterImage(int cluster);
}
