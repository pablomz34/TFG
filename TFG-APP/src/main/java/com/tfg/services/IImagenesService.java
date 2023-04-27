package com.tfg.services;

import org.springframework.stereotype.Service;

import com.tfg.entities.Imagenes;

@Service
public interface IImagenesService {
	
	public void guardarImagen(Integer numCluster, String ruta, Long idPrediccion);
	
	public Imagenes findClusterImage(Integer numCluster, Long idPrediccion);
}
