package com.tfg.entities;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;

@Entity
@Data
@Table(name = "rol")
public class Rol {
	
	@Id
	@GeneratedValue()
	private Long id;
	
	@Column(name = "nombre")
	private String nombre;
	
	public Rol(String nombre) {
		super();
		this.nombre = nombre;
	}
	
	public Rol() {
		
	}
}
