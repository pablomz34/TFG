package com.tfg.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Imagenes;
import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;

@Repository
public interface ImagenesRepository extends JpaRepository<Imagenes, Long> {
	
}
