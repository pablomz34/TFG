package com.tfg.services;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.tfg.entities.Pacientes;

public interface IPacientesService {

	public void guardarPoblacionInicial(MultipartFile file, Long idPrediccion) throws IOException;
	
	public void addAlgoritmosPoblacion(InputStream file, Long idPrediccion) throws IOException;
	
	public List<Pacientes> findPacientesByPrediccionId(Long idPrediccion);
	
	public void borrarPoblacion(Long idPrediccion);
	
	public Boolean addPaciente(String variables, String variableObjetivo, Long idPrediccion);
}
