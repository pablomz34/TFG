package com.tfg.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.Imagenes;
import com.tfg.repositories.ImagenesRepository;

@Service
@Transactional
public class ImagenesService implements IImagenesService {

	@Autowired
	private ImagenesRepository repos;
		
	@Override
	public void guardarImagen(int numCluster, String ruta) {
		Imagenes imagen = repos.findByNumCluster(numCluster);
		
		if(imagen == null) {
			Imagenes imagenNueva = new Imagenes();
			imagenNueva.setNumCluster(numCluster);;
			imagenNueva.setRuta(ruta);
			repos.save(imagenNueva);
		}
		
	}

	@Override
	public Imagenes findClusterImage(int cluster) {
		return repos.findByNumCluster(cluster);
	}

}
