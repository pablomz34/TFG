package com.tfg.services;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

import com.tfg.entities.HeadersPacientes;

public interface IHeadersPacientesService {

	public void guardarHeadersPoblacion(MultipartFile multipartFile, Long idPrediccion) throws IOException;
	
	public void addAlgoritmosHeadersPoblacion(InputStream file, Long idPrediccion) throws IOException;
	
	public HeadersPacientes findHeadersPacientesByPrediccionId(Long idPrediccion);
	
	public void borrarHeadersPoblacion(Long idPrediccion);
	
}
