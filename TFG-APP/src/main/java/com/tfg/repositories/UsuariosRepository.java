package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;

@Repository
public interface UsuariosRepository extends JpaRepository<Usuarios, Long> {
	public List<Usuarios> findAll();
	
	Usuarios findByCorreo(String correo);
	
	Usuarios findByDni(String dni);
	
	Usuarios findUsuarioById(Long idUsuario);
	
	List<Usuarios> findByRoles(Roles rol);
}
