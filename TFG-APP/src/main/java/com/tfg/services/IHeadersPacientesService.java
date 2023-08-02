package com.tfg.services;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.tfg.entities.HeadersPacientes;

public interface IHeadersPacientesService {

	public void guardarHeadersPoblacion(MultipartFile multipartFile, Long idPrediccion) throws IOException;
	
	public void addAlgoritmosHeadersPoblacion(InputStream file, Long idPrediccion) throws IOException;
	
	public HeadersPacientes findHeadersPacientesByPrediccionId(Long idPrediccion);
	
	public List<String> findVariablesClinicasCoincidentes(String nombreVariableClinica, String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas) throws JsonMappingException, JsonProcessingException;
	
	public void borrarHeadersPoblacion(Long idPrediccion);
	
	public int findMaxNumVariablesClinicas(String idPrediccionPoblacion);
	
	public List<String> findAllVariablesClinicas(String idPrediccionPoblacion);
	
	public Boolean validarVariablesSeleccionadas(String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas);
	
	public List<Integer> findIndicesVariablesClinicas(String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas);
}
