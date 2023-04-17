package com.tfg.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuariosDto {
	private Long id;
	
	@NotEmpty(message = "El dni no debe estar vacío")
	@Pattern(regexp = "^[XYZ]\\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^\\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$", 
	message = "El formato de NIF/NIE introducido no es válido")
	private String dni;
	
	@NotEmpty(message = "El nombre no debe estar vacío")
	@Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$", 
	message = "El nombre debe contener únicamente letras, no puede contener números ni carácteres extraños")
	private String nombre;
	
	@NotEmpty(message = "Los apellidos no deben estar vacíos")
	@Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$", 
	message = "Los apellidos deben contener únicamente letras, no puede contener números ni carácteres extraños")
	private String apellidos;
	
	@NotEmpty(message = "El correo no debe estar vacío")
	@Email
	private String correo;
	
	@NotEmpty(message = "La contraseña no debe estar vacía")
	@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$", 
	message = "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter no alfanumérico "
			+ "y una longitud mínima de 8 caracteres")
	private String password;
	
	
	@NotEmpty(message = "La contraseña repetida no debe estar vacía")
	private String repeatPassword;
	
	private Boolean dadoAlta;
}
