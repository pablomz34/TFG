package com.tfg.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "headers_pacientes")
public class HeadersPacientes {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(name = "headers_variable_objetivo", nullable = true)
	private String headersVariableObjetivo;
	
	@Column(name = "headers_variables_clinicas", nullable = false)
	private String headersVariablesClinicas;
	
	@Column(name = "headers_algoritmos", nullable = true)
	private String headersAlgoritmos;
	
	@OneToOne
    @JoinColumn(name = "prediccion_id") 
    private Predicciones prediccion;
}
