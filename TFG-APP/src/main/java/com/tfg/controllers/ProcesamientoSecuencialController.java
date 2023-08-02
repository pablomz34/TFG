package com.tfg.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.tfg.entities.Predicciones;
import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IHeadersPacientesService;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPacientesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin/procesamientoSecuencial")
public class ProcesamientoSecuencialController {

	static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";
	static final String UrlMock = "http://localhost:8090/";

	@Autowired
	private HttpSession session;

	private List<String> rutasSecuenciales = new ArrayList<String>();

	@Autowired
	private IUsuariosService usuariosService;

	@Autowired
	private IImagenesService imagenesService;

	@Autowired
	private IProfilesService profilesService;

	@Autowired
	private IPrediccionesService prediccionesService;

	@Autowired
	private IPacientesService pacientesService;

	@Autowired
	private IHeadersPacientesService headersPacientesService;

	@Autowired
	private IAlgoritmosClusteringService algoritmosClusteringService;

	@Value("${myapp.imagenesClusters.ruta}")
	private String rutaImagenesClusters;

	public ProcesamientoSecuencialController() {

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/seleccionarPrediccionAndPoblacion");

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/seleccionarVariablesClinicas");

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase1");

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase2");

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase3");

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase4");

		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase5");
	}

	@GetMapping("/seleccionarPrediccionAndPoblacion")
	public String seleccionarPrediccionAndPoblacion(
			@ModelAttribute("sessionAttributeError") String sessionAttributeError, Model model) {

		model.addAttribute("sessionAttributeError", sessionAttributeError);

		return "seleccionarPrediccionAndPoblacion";
	}

	@GetMapping("/seleccionarVariablesClinicas")
	public String seleccionarVariablesClinicas() {
		return "seleccionarVariablesClinicas";
	}
	
	@GetMapping("/fase1")
	public String fase1() {
		return "procesamientoSecuencialFase1";
	}
	
	@GetMapping("/fase2")
	public String fase2() {
		return "procesamientoSecuencialFase2";
	}
	
	@GetMapping("/fase3")
	public String fase3() {
		return "procesamientoSecuencialFase3";
	}
	
	@GetMapping("/fase4")
	public String fase4() {
		return "procesamientoSecuencialFase4";
	}
	
	@GetMapping("/fase5")
	public String fase5() {
		return "procesamientoSecuencialFase5";
	}

	@GetMapping("/getPacientesPrediccion")
	public ResponseEntity<?> getPacientesPrediccion(@RequestParam("descripcion") String descripcion) {

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity("Por favor, seleccione una descripción", HttpStatus.BAD_REQUEST);
		}

		Predicciones p = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (p == null) {
			return new ResponseEntity("La prediccion seleccionada no existe", HttpStatus.BAD_REQUEST);
		} else {
			return new ResponseEntity(p.getPacientes().size(), HttpStatus.OK);
		}

	}

	@PostMapping(value = "/actualizarInformacionPrediccionAndPacientes", consumes = "multipart/form-data")
	public ResponseEntity<?> guardarInformacionPacientes(@RequestParam("descripcion") String descripcion,
			@RequestPart(name = "file", required = false) @Nullable MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity("Por favor, seleccione una descripción", HttpStatus.BAD_REQUEST);
		}

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (prediccion == null) {
			return new ResponseEntity<>("La prediccion seleccionada no existe", HttpStatus.BAD_REQUEST);
		}

		if (prediccion.getPacientes().size() == 0 && multipartFile == null) {
			return new ResponseEntity<>("Es necesario subir un archivo con la información de la población",
					HttpStatus.BAD_REQUEST);
		}

		if (multipartFile != null) {

			String multipartFileError = this.validarInputFile(multipartFile);

			if (!multipartFileError.isEmpty()) {
				return new ResponseEntity<>(multipartFileError, HttpStatus.BAD_REQUEST);

			}

			if (prediccion.getHeadersPacientes() != null) {
				headersPacientesService.borrarHeadersPoblacion(prediccion.getId());
			}

			if (prediccion.getPacientes().size() > 0) {
				pacientesService.borrarPoblacion(prediccion.getId());

			}

			headersPacientesService.guardarHeadersPoblacion(multipartFile, prediccion.getId());

			pacientesService.guardarPoblacionInicial(multipartFile, prediccion.getId());

		}

		session.setAttribute("idPrediccionProcesamientoSecuencial", prediccion.getId().toString());

		this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(0));

		return new ResponseEntity<>(this.rutasSecuenciales.get(1), HttpStatus.OK);
	}

	@GetMapping("/getMaximoVariablesClinicas")
	public ResponseEntity<?> getMaximoVariablesClinicas() {

		String idPrediccionProcesamientoSecuencial = (String) session
				.getAttribute("idPrediccionProcesamientoSecuencial");

		int maxVariablesClinicas = headersPacientesService
				.findMaxNumVariablesClinicas(idPrediccionProcesamientoSecuencial);

		return new ResponseEntity<>(maxVariablesClinicas, HttpStatus.OK);
	}

	@PostMapping(value = "/buscarVariablesClinicasCoincidentes", consumes = "application/json")
	public ResponseEntity<?> buscarVariablesClinicasCoincidentes(
			@RequestParam("nombreVariableClinica") String nombreVariableClinica,
			@RequestBody List<String> variablesClinicasSeleccionadas)
			throws JsonMappingException, JsonProcessingException {

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<String> variablesClinicasCoincidentes = new ArrayList<String>();

		if (!nombreVariableClinica.isEmpty() && nombreVariableClinica != null) {
			variablesClinicasCoincidentes = headersPacientesService.findVariablesClinicasCoincidentes(
					nombreVariableClinica, idPrediccion, variablesClinicasSeleccionadas);
		}

		return new ResponseEntity(variablesClinicasCoincidentes, HttpStatus.OK);
	}

	@GetMapping("/getAllVariablesClinicas")
	public ResponseEntity<?> getAllVariablesClinicas() {

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<String> allVariablesClinicas = headersPacientesService.findAllVariablesClinicas(idPrediccion);

		return new ResponseEntity<>(allVariablesClinicas, HttpStatus.OK);
	}

	@PostMapping(value = "/procesarVariablesClinicasSeleccionadas", consumes = "application/json")
	public ResponseEntity<?> procesarVariablesClinicasSeleccionadas(@RequestBody List<String> variablesSeleccionadas) {

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		String error = this.validarVariablesSeleccionadas(idPrediccion, variablesSeleccionadas);

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		List<Integer> indicesVariablesSeleccionadas = headersPacientesService.findIndicesVariablesClinicas(idPrediccion,
				variablesSeleccionadas);

		session.setAttribute("indicesVariablesSeleccionadas", indicesVariablesSeleccionadas);

		this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(1));
		
		return new ResponseEntity<>(this.rutasSecuenciales.get(2), HttpStatus.OK);
	}

	
	private void actualizarRutaSecuencialSession(String ruta) {

		session.setAttribute(ruta + "_passed", true);

	}
	
	private String validarVariablesSeleccionadas(String idPrediccion, List<String> variablesSeleccionadas) {

		if (variablesSeleccionadas.size() == 0) {

			return "Por favor, seleccione las variables clínicas que desee utilizar";
		}

		if (!headersPacientesService.validarVariablesSeleccionadas(idPrediccion, variablesSeleccionadas)) {
			return "Las variables seleccionadas no son válidas";
		}

		return "";
	}

	

	private String validarInputNumber(String numClusters, Integer minClusters, Integer maxClusters) {

		if (numClusters == null || numClusters.isEmpty()) {
			return "Por favor, escoja un número de clusters";

		}
		try {
			Integer n = Integer.parseInt(numClusters);
			if (n < minClusters || n > maxClusters) {
				return "El valor no está dentro del rango permitido";
			}
		} catch (NumberFormatException e) {
			return "El valor introducido no es válido";

		}
		return "";
	}

	private String validarNClustersAlgoritmo(String numClusters, Integer minClusters, Integer maxClusters,
			String nombreAlgoritmo) {

		if (numClusters == null || numClusters.isEmpty()) {
			return "Por favor, escoja un número de clusters para el algoritmo " + nombreAlgoritmo;

		}
		try {
			Integer n = Integer.parseInt(numClusters);
			if (n < minClusters || n > maxClusters) {
				return "El número de clusters del algoritmo " + nombreAlgoritmo + " no está dentro del rango permitido";
			}
		} catch (NumberFormatException e) {
			return "El número de clusters del algoritmo " + nombreAlgoritmo + " no es válido";

		}
		return "";
	}

	private String validarInputFile(MultipartFile multipartFile) {
		String contentType = multipartFile.getContentType();
		if (!contentType.equals("text/csv")) {
			return "El tipo de archivo no es válido, seleccione un archivo con extensión .csv";
		}
		return "";
	}

}
