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
import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.repositories.ImagenesRepository;
import com.tfg.repositories.RolesRepository;
import com.tfg.repositories.UsuariosRepository;

import jakarta.persistence.PersistenceException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@Service
@Transactional
public class ImagenesService implements IImagenesService {

	@Autowired
	ImagenesRepository repos;
		
	@Override
	public void guardarImagen(Integer numCluster, String ruta) {
		Imagenes imagen = repos.findByNumCluster(numCluster);
		
		if(imagen == null) {
			Imagenes imagenNueva = new Imagenes();
			imagenNueva.setNumCluster(numCluster);
			imagenNueva.setRuta(ruta);
			repos.save(imagenNueva);
		}
		
	}

}
