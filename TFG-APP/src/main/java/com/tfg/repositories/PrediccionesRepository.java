package com.tfg.repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Predicciones;


@Repository
public interface PrediccionesRepository extends JpaRepository<Predicciones, Long> {
	
	public Predicciones findByDescripcion(String descripcion);
	
	public Predicciones findPrediccionById(Long id);
	
	public List<Predicciones> findAll();
}
