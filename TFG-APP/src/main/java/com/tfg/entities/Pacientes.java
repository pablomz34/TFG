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
@Table(name = "pacientes")
public class Pacientes {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(name = "variable_objetivo", nullable = true)
	private String variableObjetivo;
	
	@Column(name = "variables_clinicas", nullable = false)
	private String variablesClinicas;
	
	@Column(name = "algoritmos", nullable = true)
	private String algoritmos;
	
	@ManyToOne
    @JoinColumn(name = "prediccion_id") 
    private Predicciones prediccion;

}
