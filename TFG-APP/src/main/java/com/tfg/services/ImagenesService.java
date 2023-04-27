package com.tfg.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.Imagenes;
import com.tfg.entities.Predicciones;
import com.tfg.repositories.ImagenesRepository;
import com.tfg.repositories.PrediccionesRepository;

@Service
@Transactional
public class ImagenesService implements IImagenesService {

	
	@Autowired 
	private PrediccionesRepository prediccionesRepo;
	
	@Autowired
	private ImagenesRepository repos;
		
	@Override
	public void guardarImagen(Integer numCluster, String ruta, Long idPrediccion) {
		
		Predicciones prediccion = prediccionesRepo.findPrediccionById(idPrediccion);
		
		Imagenes imagen = repos.findByNumClusterAndPrediccion(numCluster, prediccion);
		
		if(imagen == null) {
			Imagenes imagenNueva = new Imagenes();
			imagenNueva.setNumCluster(numCluster);
			imagenNueva.setRuta(ruta);
			imagenNueva.setPrediccion(prediccion);
			
			repos.save(imagenNueva);
		}
		
	}

	@Override
	public Imagenes findClusterImage(Integer numCluster, Long idPrediccion) {
		
		Predicciones prediccion = prediccionesRepo.findPrediccionById(idPrediccion);
		
		return repos.findByNumClusterAndPrediccion(numCluster, prediccion);
	}

}
