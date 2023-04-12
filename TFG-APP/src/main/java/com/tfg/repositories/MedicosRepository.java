package com.tfg.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Medicos;

@Repository
public interface MedicosRepository extends JpaRepository<Medicos, Long> {
	public List<Medicos> findAll();
	
	Medicos findByCorreo(String correo);
	
	Medicos findByDni(String dni);
}
