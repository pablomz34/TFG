package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Administradores;
import com.tfg.entities.Rol;

@Repository
public interface RolRepository extends CrudRepository<Rol, Long>, JpaSpecificationExecutor<Rol>, JpaRepository<Rol, Long> {
	
	public Rol findFirstByNombre(String nombre);
}
