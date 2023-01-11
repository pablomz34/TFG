package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tfg.entities.Medicos;

public interface MedicosRepository extends JpaRepository<Medicos, Long> {
	public List<Medicos> findAll();
}
