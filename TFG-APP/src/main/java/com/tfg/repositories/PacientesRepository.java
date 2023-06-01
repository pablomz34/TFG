package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Pacientes;


@Repository
public interface PacientesRepository extends JpaRepository<Pacientes, Long> {
	
	public List<Pacientes> findAllByPrediccionId(Long idPrediccion);
	
}