package com.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tfg.entities.HeadersPacientes;

public interface HeadersPacientesRepository extends JpaRepository<HeadersPacientes, Long>{

	public HeadersPacientes findByPrediccionId(Long idPrediccion);
}
