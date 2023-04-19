package com.tfg.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Imagenes;


@Repository
public interface ImagenesRepository extends JpaRepository<Imagenes, Long> {
	public Imagenes findByNumCluster(Integer numCluster);
}
