package com.tfg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdministradoresDto {
	private String nombre;
	private String apellidos;
	private String dni;
	private String password;
}
