package com.tfg.services;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Profiles;
import com.tfg.entities.Usuarios;

@Service
public interface IProfilesService {
	
	public void guardarProfile(String features, int max_clusters);
	
	public Profiles findProfile();
}
