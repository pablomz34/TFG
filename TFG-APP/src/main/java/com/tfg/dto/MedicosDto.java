package com.tfg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicosDto {
	private String dni;
	private String nombre;
	private String apellidos;
	private String password;
	private Boolean dadoAlta;
}
