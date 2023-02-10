package com.tfg.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicosDto {
	private Long id;
	
	@NotEmpty
	private String dni;
	
	@NotEmpty
	private String nombre;
	
	@NotEmpty
	private String apellidos;
	
	@NotEmpty(message = "El correo no debe estar vacío")
	@Email
	private String correo;
	
	@NotEmpty(message = "La contraseña no debe estar vacía")
	private String password;
	private Boolean dadoAlta;
}
