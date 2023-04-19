package com.tfg.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "imagenes")
public class Imagenes {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(name = "ruta", nullable = false, unique=true)
	private String ruta;
	
	@Column(name = "n_cluster", nullable = false, unique = true)
	private Integer nCluster;
}
