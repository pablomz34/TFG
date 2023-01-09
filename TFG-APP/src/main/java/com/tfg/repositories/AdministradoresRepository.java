package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tfg.entities.Administradores;

public interface AdministradoresRepository extends JpaRepository<Administradores, Long> {
	public List<Administradores> findAll();
}
