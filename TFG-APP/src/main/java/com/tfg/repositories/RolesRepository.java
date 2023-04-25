package com.tfg.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Roles;

@Repository
public interface RolesRepository extends CrudRepository<Roles, Long>, JpaSpecificationExecutor<Roles>, JpaRepository<Roles, Long> {
	
	public Roles findByNombre(String nombre);
	
	
}
