package com.tfg.services;

import org.springframework.stereotype.Service;

import com.tfg.entities.Imagenes;

@Service
public interface IImagenesService {
	
	public void guardarImagen(int numCluster, String ruta);
	
	public Imagenes findClusterImage(int cluster);
}
