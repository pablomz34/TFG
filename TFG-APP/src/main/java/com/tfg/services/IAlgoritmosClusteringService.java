package com.tfg.services;

import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.tfg.entities.AlgoritmosClustering;

public interface IAlgoritmosClusteringService {

	public void crearAlgoritmosIniciales();
	
	public AlgoritmosClustering findAlgoritmoById(Long idAlgoritmo);
	
	public AlgoritmosClustering findAlgoritmoByNombreAlgoritmo(String nombreAlgoritmo);
	
	public void guardarAlgoritmo(String nombreAlgoritmo);
	
	public void borrarAlgoritmo(Long idAlgoritmo);
	
	public List<AlgoritmosClustering> findAlgoritmosCoincidentes(String nombreAlgoritmo);
	
	public List<AlgoritmosClustering> findAllAlgoritmos();
	
	public List<AlgoritmosClustering> findAlgoritmosObligatorios();
	
	public List<AlgoritmosClustering> findAlgoritmosCoincidentesAndNoSeleccionados(String nombreAlgoritmo, String algoritmosSeleccionadosString, String algoritmosPreSeleccionadosString) throws JsonMappingException, JsonProcessingException;
}
