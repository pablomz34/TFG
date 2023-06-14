package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tfg.entities.HeadersPacientes;
import com.tfg.entities.Pacientes;

public interface HeadersPacientesRepository extends JpaRepository<HeadersPacientes, Long>{

	public HeadersPacientes findByPrediccionId(Long idPrediccion);
}
