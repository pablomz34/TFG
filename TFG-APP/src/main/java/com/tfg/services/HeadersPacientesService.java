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
import com.tfg.entities.Pacientes;
import com.tfg.repositories.HeadersPacientesRepository;
import com.tfg.repositories.PacientesRepository;
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
	
	
	
	
	private List<String> calcularVariablesClinicasFiltradas(String idPrediccionPoblacion, String variablesClinicasSeleccionadas) throws JsonMappingException, JsonProcessingException{
		
		String allVariablesClinicas = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas().toLowerCase();
		
		List<String> splitAllVariablesClinicas = Arrays.asList(allVariablesClinicas.split(","));
		
		List<Map<String, Object>> listVariablesClinicasSeleccionadas = new ObjectMapper().readValue(variablesClinicasSeleccionadas, List.class);

		List<String> nombreVariables = listVariablesClinicasSeleccionadas.stream()
                .map(diccionario -> (String) diccionario.get("nombreVariable"))
                .collect(Collectors.toList());
		
		List<String> retVariablesClinicas = new ArrayList<String>();
		
		for(int i=0; i < splitAllVariablesClinicas.size(); i++) {
			
			if(!nombreVariables.contains(splitAllVariablesClinicas.get(i))) {
				retVariablesClinicas.add(splitAllVariablesClinicas.get(i));
			}	
		}
		
		return retVariablesClinicas;		
	}

	@Override
	public List<HashMap<String, Object>> findVariablesClinicasCoincidentes(String nombreVariableClinica,
			String idPrediccionPoblacion, String variablesClinicasSeleccionadas) throws JsonMappingException, JsonProcessingException {
		
		List<String> variablesClinicasFiltradas = this.calcularVariablesClinicasFiltradas(idPrediccionPoblacion, variablesClinicasSeleccionadas);
		
		List<HashMap<String, Object>> variablesClinicasCoincidentes = new ArrayList<HashMap<String, Object>>();
		
		for(int i=0; i<variablesClinicasFiltradas.size(); i++) {
			
			if(variablesClinicasFiltradas.get(i).contains(nombreVariableClinica)) {
				
				HashMap<String, Object> variable = new HashMap<String, Object>();
				
				variable.put("nombreVariable", variablesClinicasFiltradas.get(i));
				
				variable.put("indice", i);
				
				variablesClinicasCoincidentes.add(variable);
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
	public List<HashMap<String, Object>> findAllVariablesClinicas(String idPrediccionPoblacion) {
		
		String allVariablesClinicas = repos.findByPrediccionId(Long.parseLong(idPrediccionPoblacion)).getHeadersVariablesClinicas().toLowerCase();
		
		List<String> splitAllVariablesClinicas = Arrays.asList(allVariablesClinicas.split(","));
		
		List<HashMap<String, Object>> ret = new ArrayList<HashMap<String, Object>>();
		
		for(int i=0; i < splitAllVariablesClinicas.size();i++) {
			HashMap<String, Object> variableClinica = new HashMap<String, Object>();
			
			variableClinica.put("nombreVariable", splitAllVariablesClinicas.get(i));
			
			variableClinica.put("indice", i);
			
			ret.add(variableClinica);
			
		}
		
		return ret;
	}

}
