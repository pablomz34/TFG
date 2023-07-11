package com.tfg.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.repositories.AlgoritmosClusteringRepository;

@Service
@Transactional
public class AlgoritmosClusteringService implements IAlgoritmosClusteringService {

	@Autowired
	private AlgoritmosClusteringRepository repos;

	@Override
	public void crearAlgoritmosIniciales() {
		
		
		if(repos.findByNombreAlgoritmo("agglomerative") == null) {
			AlgoritmosClustering agglomerative = new AlgoritmosClustering();

			agglomerative.setNombreAlgoritmo("agglomerative");
			
			repos.save(agglomerative);
		}

		if(repos.findByNombreAlgoritmo("kmodes") == null) {
			
			AlgoritmosClustering kModes = new AlgoritmosClustering();

			kModes.setNombreAlgoritmo("kmodes");
			
			repos.save(kModes);
		}
		
		if(repos.findByNombreAlgoritmo("kmeans_labels") == null) {
			
			AlgoritmosClustering kMeansLabels = new AlgoritmosClustering();

			kMeansLabels.setNombreAlgoritmo("kmeans_labels");
			
			repos.save(kMeansLabels);
		}
		
		if(repos.findByNombreAlgoritmo("mini_batch_labels") == null) {
			
			AlgoritmosClustering miniBatchLabels = new AlgoritmosClustering();

			miniBatchLabels.setNombreAlgoritmo("mini_batch_labels");
			
			repos.save(miniBatchLabels);
		}

	}
	
	@Override
	public AlgoritmosClustering findAlgoritmoByNombreAlgoritmo(String nombreAlgoritmo) {
		return repos.findByNombreAlgoritmo(nombreAlgoritmo);
	}

	@Override
	public void guardarAlgoritmo(String nombreAlgoritmo) {
		
		AlgoritmosClustering algoritmo = new AlgoritmosClustering();
		
		algoritmo.setNombreAlgoritmo(nombreAlgoritmo);
		
		repos.save(algoritmo);
		
	}

	@Override
	public List<AlgoritmosClustering> findAlgoritmosCoincidentes(String nombreAlgoritmo) {
		return repos.findByNombreAlgoritmoContaining(nombreAlgoritmo);
	}

	@Override
	public AlgoritmosClustering findAlgoritmoById(Long idAlgoritmo) {
		return repos.findAlgoritmoById(idAlgoritmo);
	}

	@Override
	public void borrarAlgoritmo(Long idAlgoritmo) {
		
		AlgoritmosClustering algoritmo = repos.findAlgoritmoById(idAlgoritmo);
		
		repos.delete(algoritmo);
		
	}

	@Override
	public List<AlgoritmosClustering> findAllAlgoritmos() {
	
		return repos.findAll();
	}

	@Override
	public List<AlgoritmosClustering> findAlgoritmosAgglomerativeAndKmodes() {

		return repos.findAlgoritmosAgglomerativeAndKmodes("agglomerative", "kmodes");
	}

	@Override
	public List<AlgoritmosClustering> findAlgoritmosCoincidentesAndNoSeleccionados(String nombreAlgoritmo,
			String algoritmosSeleccionadosString, String algoritmosPreSeleccionadosString) throws JsonMappingException, JsonProcessingException {
		
		List<HashMap<String, Object>> algoritmosSeleccionados = new ObjectMapper().readValue(algoritmosSeleccionadosString, List.class);
		
		List<String> nombresAlgoritmosSeleccionados = algoritmosSeleccionados.stream()
                .map(algoritmo -> (String) algoritmo.get("nombreAlgoritmo"))
                .collect(Collectors.toList());
		
		List<HashMap<String, Object>> algoritmosPreSeleccionados = new ObjectMapper().readValue(algoritmosPreSeleccionadosString, List.class);
		
		List<String> nombresAlgoritmosPreSeleccionados = algoritmosPreSeleccionados.stream()
                .map(algoritmo -> (String) algoritmo.get("nombreAlgoritmo"))
                .collect(Collectors.toList());
		
		return repos.findAlgoritmosCoincidentesAndNoSelected(
				nombreAlgoritmo, 
				nombresAlgoritmosSeleccionados, 
				nombresAlgoritmosPreSeleccionados);
	}

}
