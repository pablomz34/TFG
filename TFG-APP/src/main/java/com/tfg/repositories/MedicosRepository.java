package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Medicos;

@Repository
public interface MedicosRepository extends JpaRepository<Medicos, Long> {
	public List<Medicos> findAll();
	
	public Medicos findByDni(String dni);
}
