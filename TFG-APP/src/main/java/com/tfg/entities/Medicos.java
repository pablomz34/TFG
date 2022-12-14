package com.tfg.entities;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name = "medicos")
public class Medicos {
	
	@Id
	private long id;
	
	@Column(name = "dni", nullable = false)
	private String dni;
	
	@Column(name = "nombre", nullable = false)
	private String nombre;
	
	@Column(name = "apellidos", nullable = false)
	private String apellidos;
	
	@Column(name = "telefono", nullable = false, length = 9)
	private String telefono;
	
	@Column(name  = "correo", nullable = false)
	private String correo;
	
	@Column(name = "password", nullable = false)
	private String password;
	
	@Column(name = "contador_errores_password", nullable = false, columnDefinition="Int default '0'")
	private Integer contadorErroresPassword;
	
	@Column(name = "bloqueado", nullable = false)
	private Boolean bloqueado;
	
	@Column(name = "hospital")
	private String hospital;
	
	@Column(name = "cargo")
	private String cargo;
	
	@Column(name = "departamento")
	private String departamento;
	
	@Column(name = "dado_alta")
	private Boolean dadoAlta;
}
