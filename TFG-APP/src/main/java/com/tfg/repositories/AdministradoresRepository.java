package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;

import com.tfg.entities.Administradores;

public interface AdministradoresRepository extends CrudRepository<Administradores, Long>, JpaSpecificationExecutor<Administradores>, JpaRepository<Administradores, Long> {
	public List<Administradores> findAll();
	
	public Administradores findByDni(String dni);
}
