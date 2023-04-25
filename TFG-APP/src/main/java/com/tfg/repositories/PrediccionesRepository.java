package com.tfg.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Predicciones;


@Repository
public interface PrediccionesRepository extends JpaRepository<Predicciones, Long> {
	
	public Predicciones findByDescripcion(String descripcion);
}
