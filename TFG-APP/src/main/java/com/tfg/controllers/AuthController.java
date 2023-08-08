package com.tfg.controllers;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriUtils;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Usuarios;
import com.tfg.services.IUsuariosService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@Controller
public class AuthController {

	@Autowired
	private IUsuariosService usuariosService;

	@Autowired
	private HttpSession session;

	// handler method to handle home page request
	@GetMapping("/index")
	public String index() throws IOException {

		return "index";
	}

	@GetMapping("/")
	public String index2() {

		return "index";
	}

	@GetMapping("/registro")
	public String showRegistrationForm(Model model) {
		// create model object to store form data

		if (RedirectLoginRegistro()) {
			return "redirect:/";
		}

		UsuariosDto medico = new UsuariosDto();
		model.addAttribute("medico", medico);
		return "registro";
	}
	
	
	@GetMapping("/login")
	public String login() {

		if (RedirectLoginRegistro()) {
			return "redirect:/";
		}

		return "login";
	}
	
	@GetMapping("/perfilUsuario/{idUsuario}")
	public String editarUsuario(@PathVariable("idUsuario") Long idUsuario, Model model, HttpServletRequest request) {

		Long sessionIdUsuario = (Long) session.getAttribute("idUsuario");
		if (idUsuario.longValue() != sessionIdUsuario.longValue()) {

			return "redirect:/";
		}

		return "perfilUsuario";
	}

	@GetMapping("/comprobarCorreoUnico")
	@Transactional
	public ResponseEntity<?> comprobarCorreo(@RequestParam("correo") String correo) {

		String scapedCorreo = UriUtils.encodeQueryParam(correo, StandardCharsets.UTF_8);
		Usuarios medico = usuariosService.findUsuariosByCorreo(scapedCorreo);
		boolean correoExiste = (medico != null && medico.getCorreo() != null && !medico.getCorreo().isEmpty());
		return new ResponseEntity<>(correoExiste, HttpStatus.OK);
	}

	@GetMapping("/comprobarDNIUnico")
	@Transactional
	public ResponseEntity<?> comprobarDNI(@RequestParam("dni") String dni) {

		String scapedDNI = UriUtils.encodeQueryParam(dni, StandardCharsets.UTF_8);
		Usuarios usuario = usuariosService.findUsuariosByDni(scapedDNI);
		boolean DNIExiste = (usuario != null && usuario.getCorreo() != null && !usuario.getCorreo().isEmpty());
		return new ResponseEntity<>(DNIExiste, HttpStatus.OK);
	}

	@PostMapping("/registro/guardar")
	public String registration(@Valid @ModelAttribute("medico") UsuariosDto medicoDto, BindingResult result,
			Model model) {

		if (result.hasErrors() || !ValidarRegistro(medicoDto, result, model)) {
			model.addAttribute("medico", medicoDto);
			return "/registro";
		} else {
			usuariosService.guardarMedico(medicoDto);

			return "redirect:/registro?success";
		}

	}

	@GetMapping("/obtenerDatosPerfilUsuario")
	@Transactional
	public ResponseEntity<?> obtenerDatosPerfilUsuario(@RequestParam("idUsuario") String idUsuario) {

		Long id = Long.parseLong(idUsuario);

		Long sessionIdUsuario = (Long) session.getAttribute("idUsuario");

		if (id.longValue() != sessionIdUsuario.longValue()) {
			return new ResponseEntity<>("No puedes obtener datos de otro usuario", HttpStatus.FORBIDDEN);
		}

		Usuarios usuario = usuariosService.findUsuarioById(id);

		HashMap<String, Object> map = new HashMap<String, Object>();

		map.put("nombre", usuario.getNombre());

		map.put("apellidos", usuario.getApellidos());

		map.put("correo", usuario.getCorreo());

		map.put("dni", usuario.getDni());

		map.put("password", usuario.getPassword());

		return new ResponseEntity<>(map, HttpStatus.OK);
	}

	@PostMapping(value = "/cambiarDatoPerfilUsuario", consumes = "application/json")
	@Transactional
	public ResponseEntity<?> cambiarDatoPerfilUsuario(@RequestParam("idUsuario") String idUsuario,
			@RequestBody HashMap<String, Object> json) {

		Long id = Long.parseLong(idUsuario);

		Long sessionIdUsuario = (Long) session.getAttribute("idUsuario");

		if (id.longValue() != sessionIdUsuario.longValue()) {
			return new ResponseEntity<>("No puedes modificar datos de otro usuario", HttpStatus.FORBIDDEN);
		}

		String dato = (String) json.get("dato");

		String columnName = (String) json.get("columnName");

		String repeatPassword = (String) json.get("repeatPassword");

		String error = validarDatoaModificar(dato, columnName, repeatPassword);

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		if (columnName.equals("nombre")) {
			usuariosService.updateDatoPerfilUsuario(id, dato, columnName);
		}
		if (columnName.equals("apellidos")) {
			usuariosService.updateDatoPerfilUsuario(id, dato, columnName);
		}
		if (columnName.equals("correo")) {
			usuariosService.updateDatoPerfilUsuario(id, dato, columnName);
		}
		if (columnName.equals("dni")) {
			usuariosService.updateDatoPerfilUsuario(id, dato, columnName);
		}
		if (columnName.equals("password")) {
			usuariosService.updateDatoPerfilUsuario(id, dato, columnName);
		}

		return new ResponseEntity<>("", HttpStatus.OK);
	}

	private String validarDatoaModificar(String dato, String columnName, String repeatPassword) {

		if (dato == null || dato.isEmpty()) {
			return "El valor introducido no puede ser vacío";
		}

		String regex = "";
		String regexErrorMessage = "";

		if (columnName.equals("nombre") || columnName.equals("apellidos")) {
			regex = "^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*(?:\\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\\s*[a-zA-ZáéíóúÁÉÍÓÚñÑ]*)*$";
			if (columnName.equals("nombre")) {
				regexErrorMessage = "El " + columnName
						+ " debe contener únicamente letras, no puede contener números ni carácteres extraños";
			}
			if (columnName.equals("apellidos")) {
				regexErrorMessage = "Los " + columnName
						+ " debe contener únicamente letras, no puede contener números ni carácteres extraños";
			}

		}
		if (columnName.equals("correo")) {
			regex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
			regexErrorMessage = "El " + columnName + " no tiene un formato válido (Ej: pruebacorreo@gmail.com)";
		}
		if (columnName.equals("dni")) {
			regex = "^[XYZ]\\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$|^\\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$";
			regexErrorMessage = "El " + columnName + " no tiene un formato válido (Ej: 12345678Z)";
		}
		if (columnName.equals("password")) {
			regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$";
			regexErrorMessage = "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter no alfanumérico "
					+ "y una longitud mínima de 8 caracteres";
		}

		if (!dato.matches(regex)) {
			return regexErrorMessage;
		}

		Long sessionIdUsuario = (Long) session.getAttribute("idUsuario");

		if (columnName.equals("correo")) {
			Usuarios usuarioByCorreo = usuariosService.findUsuariosByCorreo(dato);

			if (usuarioByCorreo != null && usuarioByCorreo.getCorreo() != null
					&& !usuarioByCorreo.getCorreo().isEmpty()) {
				if (usuarioByCorreo.getId().longValue() != sessionIdUsuario) {
					return "Ya existe una cuenta creada con ese correo";
				}
			}
		}

		if (columnName.equals("dni")) {
			Usuarios usuarioByDni = usuariosService.findUsuariosByDni(dato);

			if (usuarioByDni != null && usuarioByDni.getCorreo() != null && !usuarioByDni.getCorreo().isEmpty()) {
				if (usuarioByDni.getId().longValue() != sessionIdUsuario) {
					return "Ya existe una cuenta creada con ese NIF/NIE";
				}
			}

			if (!validarNifNie(dato)) {
				return "El dígito de control del NIF/NIE no es válido";
			}
		}

		if (columnName.equals("password")) {
			if (!dato.equals(repeatPassword)) {
				return "Las contraseñas deben coincidir";
			}
		}

		return "";
	}

	

	private boolean RedirectLoginRegistro() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		Usuarios medico = usuariosService.findUsuariosByCorreo(auth.getName());

		if (medico != null) {
			return true;
		}

		return false;
	}

	private boolean ValidarRegistro(UsuariosDto medicoDto, BindingResult result, Model model) {

		Usuarios medicoByCorreo = usuariosService.findUsuariosByCorreo(medicoDto.getCorreo());

		if (medicoByCorreo != null && medicoByCorreo.getCorreo() != null && !medicoByCorreo.getCorreo().isEmpty()) {
			result.rejectValue("correo", null, "Ya existe una cuenta creada con ese correo");
		}

		Usuarios medicoByDni = usuariosService.findUsuariosByDni(medicoDto.getDni());

		if (medicoByDni != null && medicoByDni.getDni() != null && !medicoByDni.getDni().isEmpty()) {
			result.rejectValue("dni", null, "Ya existe una cuenta creada con este NIF/NIE");
		}

		if (!medicoDto.getPassword().equals(medicoDto.getRepeatPassword())) {
			result.rejectValue("repeatPassword", null, "Las contraseñas deben coincidir");
		}

		if (!validarNifNie(medicoDto.getDni())) {
			result.rejectValue("dni", null, "El dígito de control del NIF/NIE no es válido");
		}

		if (result.hasErrors()) {
			return false;
		}

		return true;
	}

	private boolean validarNifNie(String nifNie) {
		final String letras = "TRWAGMYFPDXBNJZSQVHLCKE";
		final String letra = String.valueOf(nifNie.charAt(8)).toUpperCase();

		if (nifNie.matches("^[XYZ].*")) {
			// convertir primera letra a número
			int firstChar = 0;
			switch (nifNie.charAt(0)) {
			case 'X':
				firstChar = 0;
				break;
			case 'Y':
				firstChar = 1;
				break;
			case 'Z':
				firstChar = 2;
				break;
			}
			int number = Integer.parseInt(firstChar + nifNie.substring(1, 8));
			int index = number % 23;
			return letra.equals(String.valueOf(letras.charAt(index)));
		}

		// comprobar si es NIF
		int number = Integer.parseInt(nifNie.substring(0, 8));
		int index = number % 23;
		return letra.equals(String.valueOf(letras.charAt(index)));
	}

}
