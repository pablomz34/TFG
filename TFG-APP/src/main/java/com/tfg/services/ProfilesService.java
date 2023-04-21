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
	public void guardarProfile(String features, int maxClusters) {
		
		List<Profiles> profiles = repos.findAll();
		
		if(profiles.size() == 0) {
			Profiles profileNuevo = new Profiles();
			profileNuevo.setFeatures(features);
			profileNuevo.setMaxClusters(maxClusters);
			repos.save(profileNuevo);
		}
		else {
			profiles.get(0).setFeatures(features);
			profiles.get(0).setMaxClusters(maxClusters);
			repos.save(profiles.get(0));
		}
		
	}

	@Override
	public Profiles findProfile() {
		return repos.findAll().get(0);
	}
		
	

}
