package com.tfg.entities;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "predicciones")
public class Predicciones {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(name = "descripcion", nullable = false, unique = true)
	private String descripcion;
	
	@Column(name="max_clusters")
	private Integer maxClusters;
	
	@OneToMany(mappedBy = "prediccion")
    private List<Imagenes> imagenes;
	
	@OneToMany(mappedBy = "prediccion") 
    private List<Profiles> profiles;
	
	@OneToMany(mappedBy = "prediccion")
    private List<Pacientes> pacientes;
	
	@OneToOne(mappedBy = "prediccion")
    private HeadersPacientes headersPacientes;
	
}
