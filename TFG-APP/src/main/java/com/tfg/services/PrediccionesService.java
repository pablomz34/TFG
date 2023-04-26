package com.tfg.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.Predicciones;
import com.tfg.repositories.PrediccionesRepository;

@Service
@Transactional
public class PrediccionesService implements IPrediccionesService {

	@Autowired
	private PrediccionesRepository repos;
	
	@Override
	public Predicciones findPrediccionByDescripcion(String descripcion) {
		return repos.findByDescripcion(descripcion);
	}

	@Override
	public Predicciones guardarPrediccion(String descripcion) {
		
		Predicciones prediccion = new Predicciones();
		
		prediccion.setDescripcion(descripcion);
		
		repos.save(prediccion);
		
		return prediccion;
	}

	@Override
	public List<String> getDescripciones() {
		List<Predicciones> predicciones = repos.findAll();
		List<String> descripciones = new ArrayList<>();
		if(predicciones != null) {
			for(Predicciones prediccion : predicciones) {
				descripciones.add(prediccion.getDescripcion());
			}
		}
		
		return descripciones;
	}

	@Override
	public Predicciones findPrediccionById(Long id) {
		return repos.findPrediccionById(id);
	}

	@Override
	public void guardarMaxClusters(int maxClusters, Long id) {
		
		Predicciones prediccion = repos.findPrediccionById(id);
		
		if(prediccion!=null) {
			prediccion.setMaxClusters(maxClusters);	
			repos.save(prediccion);
		}
		
	}
	
	
	
	
}
