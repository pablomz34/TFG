package com.tfg.services;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Profiles;
import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.repositories.ImagenesRepository;
import com.tfg.repositories.ProfilesRepository;
import com.tfg.repositories.RolesRepository;
import com.tfg.repositories.UsuariosRepository;

import jakarta.persistence.PersistenceException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@Service
@Transactional
public class ProfilesService implements IProfilesService {

	@Autowired
	private ProfilesRepository repos;

	@Override
	public void guardarProfile(String features) {
		
		List<Profiles> profile = repos.findAll();
		
		if(profile.size() == 0) {
			Profiles profileNuevo = new Profiles();
			profileNuevo.setFeatures(features);
			repos.save(profileNuevo);
		}
		else {
			profile.get(0).setFeatures(features);
			repos.save(profile.get(0));
		}
		
	}
		
	

}
