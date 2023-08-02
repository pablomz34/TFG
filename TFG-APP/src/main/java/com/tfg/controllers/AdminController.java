package com.tfg.controllers;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.Predicciones;
import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IUsuariosService;

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

	@GetMapping()
	public String adminIndex() {
		return "index";
	}
	
	@GetMapping("/fases")
	public String fases() {
		return "fases";
	}
	
	@GetMapping("/seleccionarModoDeProcesamiento")
	public String seleccionarModoDeProcesamiento() {
		return "seleccionarModoDeProcesamiento";
	}
	
	@PostMapping("/redigirAProcesamiento")
	public ResponseEntity<String> redigirAProcesamiento(@RequestParam("modoProcesamiento") String modoProcesamiento){
		
		String error = this.validarModoProcesamiento(modoProcesamiento);
		
		if(!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		
		int numProcesamiento = Integer.parseInt(modoProcesamiento);
		
		
		String domain = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
		
		String redirectUrl = "";
		
		if(numProcesamiento == 0) {
			redirectUrl = domain + "/admin/procesamientoSecuencial/seleccionarPrediccionAndPoblacion";
		}
		else {
			redirectUrl = domain + "/admin/procesamientoNoSecuencial/fases";
		}
		
		return new ResponseEntity<>(redirectUrl, HttpStatus.OK);
	}
	

	private String validarModoProcesamiento(String modoProcesamiento) {
		
		
		if(modoProcesamiento == null || modoProcesamiento.isEmpty()) {
			return "Por favor, seleccione un método de procesamiento";
		}
		
		int numProcesamiento = -1;
		
		try {
			numProcesamiento = Integer.parseInt(modoProcesamiento);
			
		}catch(NumberFormatException e) {
			return "Formato de url inválido";
		}
		
		
		if(numProcesamiento < 0 || numProcesamiento > 1) {
			return "Modo de procesamiento inválido";
		}
					
		return "";
	}
	
	
	@GetMapping("/getAllPredicciones")
	public ResponseEntity<?> getAllPredicciones() {
		List<String> predicciones = prediccionesService.getDescripciones();

		return new ResponseEntity<>(predicciones, HttpStatus.OK);
	}
	

	@GetMapping("/medicosRegistrados")
	public String users(Model model) {
		List<UsuariosDto> medicos = usuariosService.findAllMedicos();
		model.addAttribute("medicos", medicos);
		return "medicos_registrados";
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

	@PostMapping("/crearAlgoritmo")
	public ResponseEntity<?> crearAlgoritmo(@RequestParam("nombreAlgoritmo") String nombreAlgoritmo) {

		if (nombreAlgoritmo.equals("") || nombreAlgoritmo.isEmpty()) {
			return new ResponseEntity("Por favor, escriba un nombre para el algoritmo", HttpStatus.BAD_REQUEST);
		}

		if (algoritmosClusteringService.findAlgoritmoByNombreAlgoritmo(nombreAlgoritmo) != null) {
			return new ResponseEntity("Ya existe un algoritmo con ese nombre", HttpStatus.BAD_REQUEST);
		} else {
			algoritmosClusteringService.guardarAlgoritmo(nombreAlgoritmo);
			return new ResponseEntity("Algoritmo creado correctamente", HttpStatus.OK);
		}

	}

	@PostMapping("/buscarAlgoritmosCoincidentes")
	public ResponseEntity<?> buscarAlgoritmosCoincidentes(@RequestParam("nombreAlgoritmo") String nombreAlgoritmo) {
		
		List<AlgoritmosClustering> algoritmos = new ArrayList<AlgoritmosClustering>();
		
		if (!nombreAlgoritmo.equals("") && !nombreAlgoritmo.isEmpty()) {
			algoritmos = algoritmosClusteringService.findAlgoritmosCoincidentes(nombreAlgoritmo);
		}
		return new ResponseEntity(algoritmos, HttpStatus.OK);
	}
	
	@PostMapping("/borrarAlgoritmo")
	public ResponseEntity<?> borrarAlgoritmo(@RequestParam("idAlgoritmo") String idAlgoritmo) {

		AlgoritmosClustering algoritmo = algoritmosClusteringService.findAlgoritmoById(Long.parseLong(idAlgoritmo));

		if (algoritmo != null) {
			algoritmosClusteringService.borrarAlgoritmo(algoritmo.getId());
			return new ResponseEntity("El algoritmo se ha borrado correctamente", HttpStatus.OK);
		} else {
			return new ResponseEntity("El algoritmo seleccionado no existe",
					HttpStatus.BAD_REQUEST);
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

		return new ResponseEntity(columnasPrediccionesCoincidentes, HttpStatus.OK);
	}

	@PostMapping("/borrarPrediccion")
	public ResponseEntity<?> borrarPredicciones(@RequestParam("idPrediccion") String idPrediccion) {

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));

		if (prediccion != null) {
			prediccionesService.borrarPrediccion(prediccion.getId());
			return new ResponseEntity("La prediccion se ha borrado correctamente", HttpStatus.OK);
		} else {
			return new ResponseEntity("La predicción seleccionada no existe",
					HttpStatus.BAD_REQUEST);
		}
	}

}
