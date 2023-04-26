package com.tfg.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tfg.entities.Predicciones;

@Service
public interface IPrediccionesService {
	
	public Predicciones findPrediccionByDescripcion(String descripcion);
	
	public void guardarPrediccion(String descripcion);

	public List<String> getDescripciones(); 
}
