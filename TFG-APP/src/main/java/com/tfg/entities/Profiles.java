package com.tfg.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "profiles")
public class Profiles {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(name = "features", nullable = false, unique=true, columnDefinition = "TEXT")
	private String features;
	
	@Column(name = "num_cluster", nullable = false)
	private int numCluster;
	
	@ManyToOne
    @JoinColumn(name = "prediccion_id") 
    private Predicciones prediccion;
}
