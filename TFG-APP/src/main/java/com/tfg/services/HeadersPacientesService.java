package com.tfg.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.entities.HeadersPacientes;
import com.tfg.repositories.HeadersPacientesRepository;
import com.tfg.repositories.PrediccionesRepository;

@Service
@Transactional
public class HeadersPacientesService implements IHeadersPacientesService {

	@Autowired
	private PrediccionesRepository prediccionesRepo;

	@Autowired
	private HeadersPacientesRepository repos;

	@Override
	public void guardarHeadersPoblacion(MultipartFile multipartFile, Long idPrediccion) throws IOException {

		try {
			InputStream inputStream = multipartFile.getInputStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));

			String headersString = reader.readLine();

			HeadersPacientes headersPaciente = new HeadersPacientes();

			int firstCommaIndex = headersString.indexOf(',');

			String headersVariableObjetivo = headersString.substring(0, firstCommaIndex).trim();
			String headersVariablesClinicas = headersString.substring(firstCommaIndex + 1).trim();

			headersPaciente.setHeadersVariableObjetivo(headersVariableObjetivo);

			headersPaciente.setHeadersVariablesClinicas(headersVariablesClinicas);

			headersPaciente.setPrediccion(prediccionesRepo.findPrediccionById(idPrediccion));

			repos.save(headersPaciente);

			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

	@Override
	public HeadersPacientes findHeadersPacientesByPrediccionId(Long idPrediccion) {
		return repos.findByPrediccionId(idPrediccion);
	}

	@Override
	public void borrarHeadersPoblacion(Long idPrediccion) {
		HeadersPacientes headersPacientes = repos.findByPrediccionId(idPrediccion);

		repos.delete(headersPacientes);
	}

	@Override
	public void addAlgoritmosHeadersPoblacion(InputStream file, Long idPrediccion) throws IOException {
		try {
			HeadersPacientes headersPaciente = repos.findByPrediccionId(idPrediccion);

			BufferedReader reader = new BufferedReader(new InputStreamReader(file));

			String[] headersString = reader.readLine().split(",");

			int saltos = headersPaciente.getHeadersVariablesClinicas().split(",").length;

			StringBuilder builder = new StringBuilder();

			for (int i = saltos + 1; i < headersString.length; i++) {
				builder.append(headersString[i].trim());
				if (i < headersString.length - 1)
					builder.append(",");
			}

			headersPaciente.setHeadersAlgoritmos(builder.toString());

			repos.save(headersPaciente);

			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}
	
	
	
	
	private List<String> calcularVariablesClinicasFiltradas(String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas) throws JsonMappingException, JsonProcessingException{
		
		String allVariablesClinicasString = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas().toLowerCase();
		
		List<String> allVariablesClinicas = Arrays.asList(allVariablesClinicasString.split(","));
		
		//List<String> variablesClinicasSeleccionadas = new ObjectMapper().readValue(variablesClinicasSeleccionadasString, List.class);
		
		List<String> variablesClinicasFiltradas = new ArrayList<String>();
		
		for(int i=0; i < allVariablesClinicas.size(); i++) {
			
			String variableClinica = allVariablesClinicas.get(i);
			
			if(variablesClinicasSeleccionadas.indexOf(variableClinica) == -1) {
				variablesClinicasFiltradas.add(variableClinica);
			}	
		}
		
		return variablesClinicasFiltradas;		
	}

	@Override
	public List<String> findVariablesClinicasCoincidentes(String nombreVariableClinica,
			String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas) throws JsonMappingException, JsonProcessingException {
		
		List<String> variablesClinicasFiltradas = this.calcularVariablesClinicasFiltradas(idPrediccionPoblacion, variablesClinicasSeleccionadas);
		
		List<String> variablesClinicasCoincidentes = new ArrayList<String>();
		
		for(int i=0; i<variablesClinicasFiltradas.size(); i++) {
			
			String variableClinica = variablesClinicasFiltradas.get(i);
			
			if(variableClinica.contains(nombreVariableClinica)) {
				
				variablesClinicasCoincidentes.add(variableClinica);
			}
			
		}		
		
		return variablesClinicasCoincidentes;
	}

	@Override
	public int findMaxNumVariablesClinicas(String idPrediccionPoblacion) {
		
		String variablesClinicas = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas();
		
		return variablesClinicas.split(",").length;
	}

	@Override
	public List<String> findAllVariablesClinicas(String idPrediccionPoblacion) {
		
		String allVariablesClinicasString = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas().toLowerCase();
		
		List<String> allVariablesClinicas = Arrays.asList(allVariablesClinicasString.split(","));
		
		return allVariablesClinicas;
	}

	@Override
	public Boolean validarVariablesSeleccionadas(String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas) {
		
		Boolean isValid = true;
		
		String allVariablesClinicasString = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas().toLowerCase();
		
		List<String> allVariablesClinicas = Arrays.asList(allVariablesClinicasString.split(","));
				
		for(int i=0; isValid && i < variablesClinicasSeleccionadas.size();i++ ) {
			
			for(int j=i+1; isValid && j < variablesClinicasSeleccionadas.size(); j++) {
				
				if(variablesClinicasSeleccionadas.get(i).equals(variablesClinicasSeleccionadas.get(j))) {
					isValid = false;
				}
			}
			
			if(allVariablesClinicas.indexOf(variablesClinicasSeleccionadas.get(i)) == -1) {
				isValid = false;
			}		
	
		}		
		
		return isValid;
	}

	@Override
	public List<Integer> findIndicesVariablesClinicas(String idPrediccionPoblacion, List<String> variablesClinicasSeleccionadas) {
		
		List<Integer> indicesVariablesSeleccionadas = new ArrayList<Integer>();
		
		String allVariablesClinicasString = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas().toLowerCase();
		
		List<String> allVariablesClinicas = Arrays.asList(allVariablesClinicasString.split(","));
		
		for(int i=0; i<variablesClinicasSeleccionadas.size(); i++) {
					
			indicesVariablesSeleccionadas.add(allVariablesClinicas.
					indexOf(variablesClinicasSeleccionadas.get(i)));
		}
		
		return indicesVariablesSeleccionadas;
	}

}
