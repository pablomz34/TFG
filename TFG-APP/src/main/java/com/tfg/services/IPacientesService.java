package com.tfg.services;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.tfg.entities.Pacientes;

public interface IPacientesService {

	public void guardarPoblacion(MultipartFile file, Long idPrediccion) throws IOException;
	
	public List<Pacientes> findPacientesByPrediccionId(Long idPrediccion);
}
