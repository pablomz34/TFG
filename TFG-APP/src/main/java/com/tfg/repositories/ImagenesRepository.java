package com.tfg.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Imagenes;
import com.tfg.entities.Predicciones;


@Repository
public interface ImagenesRepository extends JpaRepository<Imagenes, Long> {
	public Imagenes findByNumCluster(Integer numCluster);
	
	public Imagenes findByNumClusterAndPrediccion(Integer numCluster, Predicciones prediccion);
}
