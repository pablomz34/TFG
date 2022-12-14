package com.tfg.entities;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name = "administradores")
public class Administradores {
	
	@Id
	private long id;
	
	@Column(name = "dni", nullable = false)
	private String dni;
	
	@Column(name = "nombre", nullable = false)
	private String nombre;
	
	@Column(name = "apellidos", nullable = false)
	private String apellidos;
	
	@Column(name = "password", nullable = false)
	private String password;
	
}
