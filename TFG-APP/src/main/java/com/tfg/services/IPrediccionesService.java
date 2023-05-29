package com.tfg.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tfg.entities.Predicciones;

@Service
public interface IPrediccionesService {
	
	public Predicciones findPrediccionByDescripcion(String descripcion);
	
	public Predicciones findPrediccionById(Long id);
	
	public Predicciones guardarPrediccion(String descripcion);
	
	public void guardarMaxClusters(Integer maxClusters, Long id);

	public List<String> getDescripciones(); 
	
	public List<Predicciones> getAll();
	
	public List<Predicciones> buscarPrediccionesCoincidentes(String substring);
	
	public boolean borrarPrediccion(Long id);
}
