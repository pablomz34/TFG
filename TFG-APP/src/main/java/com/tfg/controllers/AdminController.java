package com.tfg.controllers;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.tfg.config.AccessInterceptor;
import com.tfg.dto.UsuariosDto;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.Predicciones;
import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IUsuariosService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminController {

	@Autowired
	private IUsuariosService usuariosService;

	@Autowired
	private IPrediccionesService prediccionesService;

	@Autowired
	private IAlgoritmosClusteringService algoritmosClusteringService;

	@Value("${spring.datasource.url}")
	private String bbddConnectionUrl;

	@Value("${spring.datasource.username}")
	private String bbddUser;

	@Value("${spring.datasource.password}")
	private String bbddPassword;
	
	@Autowired
	private HttpSession session;

	@Value("${myapp.rutasSecuenciales}")
	private List<String> rutasSecuenciales;
	
	@Value("${myapp.imagenesClusters.ruta}")
	protected String rutaImagenesClusters;	
	
	@GetMapping("/procesamientos")
	public String procesamientos(Model model) {

		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");
		
		if(accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}
		
		return "procesamientos";
	}

	@PostMapping("/redigirAProcesamiento")
	public ResponseEntity<String> redigirAProcesamiento(@RequestParam("modoProcesamiento") String modoProcesamiento) {

		String error = this.validarModoProcesamiento(modoProcesamiento);

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		int numProcesamiento = Integer.parseInt(modoProcesamiento);

		String redirectUrl = "";

		if (numProcesamiento == 0) {

			redirectUrl = this.rutasSecuenciales.get(1);

			session.setAttribute(this.rutasSecuenciales.get(0) + "_passed", true);
		} else {
			
			session.setAttribute(this.rutasSecuenciales.get(0) + "noSecuencial_passed", true);
			
			redirectUrl = "/admin/procesamientos/noSecuencial/fases";
		}

		return new ResponseEntity<>(redirectUrl, HttpStatus.OK);
	}

	private String validarModoProcesamiento(String modoProcesamiento) {

		if (modoProcesamiento == null || modoProcesamiento.isEmpty()) {
			return "Por favor, seleccione un procesamiento";
		}

		int numProcesamiento = -1;

		try {
			numProcesamiento = Integer.parseInt(modoProcesamiento);

		} catch (NumberFormatException e) {
			return "No se cumple el formato válido de selección de procesamiento";
		}

		if (numProcesamiento < 0 || numProcesamiento > 1) {
			return "El procesamiento seleccionado no es válido";
		}

		return "";
	}

	@GetMapping()
	public String adminIndex() {
		return "index";
	}

	@GetMapping("/getAllPredicciones")
	public ResponseEntity<?> getAllPredicciones() {
		List<String> predicciones = prediccionesService.getDescripciones();

		return new ResponseEntity<>(predicciones, HttpStatus.OK);
	}

	@GetMapping("/medicosRegistrados")
	public String medicosRegistrados(Model model) {
		List<UsuariosDto> medicos = usuariosService.findAllMedicos();
		model.addAttribute("medicos", medicos);
		return "medicosRegistrados";
	}

	@GetMapping("/predicciones")
	public String predicciones(Model model) {
		return "predicciones";
	}

	@GetMapping("/algoritmos")
	public String algoritmos(Model model) {
		return "algoritmos";
	}

	@GetMapping("/exportarBBDD")
	public String exportar() {
		return "exportarBBDD";
	}
	
	
	@PostMapping("/crearPrediccion")
	public ResponseEntity<?> createOrFindPrediction(@RequestParam("descripcion") String descripcion)
			throws UnsupportedEncodingException {

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity<>("Por favor, escriba una descripción para la predicción",
					HttpStatus.BAD_REQUEST);
		}

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (prediccion == null) {

			prediccion = prediccionesService.guardarPrediccion(descripcion);

			if (!this.crearCarpetaPrediccion(prediccion)) {
				return new ResponseEntity<>("El sistema de gestión de archivos ha fallado",
						HttpStatus.INTERNAL_SERVER_ERROR);
			}

			return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Ya existe una predicción con esa descripción", HttpStatus.BAD_REQUEST);
		}

	}
	
	private boolean crearCarpetaPrediccion(Predicciones prediccion) {

		File carpetaClusters = new File(rutaImagenesClusters);

		if (!carpetaClusters.exists()) {
			if (!carpetaClusters.mkdirs()) {
				return false;
			}
		}

		String nombreCarpetaPrediccion = "prediccion" + prediccion.getId();
		File carpetaPrediccion = new File(rutaImagenesClusters + File.separator + nombreCarpetaPrediccion);

		if (!carpetaPrediccion.exists()) {
			if (!carpetaPrediccion.mkdirs()) {
				return false;
			}
		}
		return true;
	}
	

	@PostMapping("/crearAlgoritmo")
	public ResponseEntity<?> crearAlgoritmo(@RequestParam("nombreAlgoritmo") String nombreAlgoritmo) {

		if (nombreAlgoritmo.equals("") || nombreAlgoritmo.isEmpty()) {
			return new ResponseEntity<>("Por favor, escriba un nombre para el algoritmo", HttpStatus.BAD_REQUEST);
		}

		if (algoritmosClusteringService.findAlgoritmoByNombreAlgoritmo(nombreAlgoritmo) != null) {
			return new ResponseEntity<>("Ya existe un algoritmo con ese nombre", HttpStatus.BAD_REQUEST);
		} else {
			algoritmosClusteringService.guardarAlgoritmo(nombreAlgoritmo);
			return new ResponseEntity<>("Algoritmo creado correctamente", HttpStatus.OK);
		}

	}

	@PostMapping("/buscarAlgoritmosCoincidentes")
	public ResponseEntity<?> buscarAlgoritmosCoincidentes(@RequestParam("nombreAlgoritmo") String nombreAlgoritmo) {

		List<AlgoritmosClustering> algoritmos = new ArrayList<AlgoritmosClustering>();

		if (!nombreAlgoritmo.equals("") && !nombreAlgoritmo.isEmpty()) {
			algoritmos = algoritmosClusteringService.findAlgoritmosCoincidentes(nombreAlgoritmo);
		}
		return new ResponseEntity<>(algoritmos, HttpStatus.OK);
	}

	@PostMapping("/borrarAlgoritmo")
	public ResponseEntity<?> borrarAlgoritmo(@RequestParam("idAlgoritmo") String idAlgoritmo) {

		AlgoritmosClustering algoritmo = algoritmosClusteringService.findAlgoritmoById(Long.parseLong(idAlgoritmo));

		if (algoritmo != null) {
			algoritmosClusteringService.borrarAlgoritmo(algoritmo.getId());
			return new ResponseEntity<>("El algoritmo se ha borrado correctamente", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("El algoritmo seleccionado no existe", HttpStatus.BAD_REQUEST);
		}
	}

	@GetMapping("/buscarPrediccionesCoincidentes")
	public ResponseEntity<?> buscarPrediccionesCoincidentes(
			@RequestParam("searchedDescripcion") String searchedDescripcion) {

		List<Predicciones> prediccionesCoincidentes = new ArrayList<Predicciones>();

		List<HashMap<String, Object>> columnasPrediccionesCoincidentes = new ArrayList<HashMap<String, Object>>();

		if (searchedDescripcion != null && !searchedDescripcion.isEmpty()) {
			prediccionesCoincidentes = prediccionesService.buscarPrediccionesCoincidentes(searchedDescripcion);

			for (int i = 0; i < prediccionesCoincidentes.size(); i++) {

				HashMap<String, Object> columnas = new HashMap<String, Object>();

				columnas.put("id", prediccionesCoincidentes.get(i).getId());

				columnas.put("descripcion", prediccionesCoincidentes.get(i).getDescripcion());

				columnasPrediccionesCoincidentes.add(columnas);
			}

		}

		return new ResponseEntity<>(columnasPrediccionesCoincidentes, HttpStatus.OK);
	}

	@PostMapping("/borrarPrediccion")
	public ResponseEntity<?> borrarPredicciones(@RequestParam("idPrediccion") String idPrediccion) {

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));

		if (prediccion != null) {
			prediccionesService.borrarPrediccion(prediccion.getId());
			return new ResponseEntity<>("La prediccion se ha borrado correctamente", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("La predicción seleccionada no existe", HttpStatus.BAD_REQUEST);
		}
	}

}
