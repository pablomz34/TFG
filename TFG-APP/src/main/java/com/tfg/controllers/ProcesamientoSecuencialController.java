package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.HeadersPacientes;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Pacientes;
import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;
import com.tfg.services.IHeadersPacientesService;
import com.tfg.services.IPacientesService;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin/procesamientos/secuencial")
public class ProcesamientoSecuencialController extends ProcesamientosController {

	@Autowired
	private IPacientesService pacientesService;

	@Autowired
	private IHeadersPacientesService headersPacientesService;

	private List<String> fasesInfo = new ArrayList<String>();

	public ProcesamientoSecuencialController() {

		this.fasesInfo.add("Nº Óptimo de clusters");

		this.fasesInfo.add("Subpoblaciones");

		this.fasesInfo.add("Métricas de varianza");

		this.fasesInfo.add("Estadísticas de población");

		this.fasesInfo.add("Rendimiento del modelo");

	}

	@GetMapping("/seleccionarPrediccionYPoblacion")
	public String seleccionarPrediccionYPoblacion(Model model) {

		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");

		if (accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}

		return "seleccionarPrediccionYPoblacion";
	}

	@GetMapping("/seleccionarVariablesClinicas")
	public String seleccionarVariablesClinicas(Model model) {

		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");

		if (accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}

		return "seleccionarVariablesClinicas";
	}

	@GetMapping("/fase1")
	public String fase1(Model model) {
		
		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");

		if (accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}

		model.addAttribute("indiceFase", 0);

		model.addAttribute("fases", this.fasesInfo);

		return "secuencialFase1";
	}

	@GetMapping("/fase2")
	public String fase2(Model model) {

		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");

		if (accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}

		model.addAttribute("indiceFase", 1);

		model.addAttribute("fases", this.fasesInfo);

		return "secuencialFase2";
	}

	@GetMapping("/fase3")
	public String fase3(Model model) {

		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");

		if (accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}

		model.addAttribute("indiceFase", 2);

		model.addAttribute("fases", this.fasesInfo);

		return "secuencialFase3";
	}

	@GetMapping("/fase4")
	public String fase4(Model model) {
		
		String accesoDenegadoMessage = (String) session.getAttribute("accesoDenegadoMessage");

		if (accesoDenegadoMessage != null) {
			model.addAttribute("accesoDenegadoMessage", accesoDenegadoMessage);
			session.removeAttribute("accesoDenegadoMessage");
		}

		model.addAttribute("indiceFase", 3);

		model.addAttribute("fases", this.fasesInfo);

		return "secuencialFase4";
	}

	@GetMapping("/fase5")
	public String fase5(Model model) {

		model.addAttribute("indiceFase", 4);

		model.addAttribute("fases", this.fasesInfo);

		return "secuencialFase5";
	}


	private File llamadaBBDDPoblacion(String idPrediccionPoblacion, String fase, String algoritmoOptimo,
			List<Integer> indices) throws IOException {

		List<Pacientes> poblacion = pacientesService.findPacientesByPrediccionId(Long.parseLong(idPrediccionPoblacion));
		HeadersPacientes headers = headersPacientesService
				.findHeadersPacientesByPrediccionId(Long.parseLong(idPrediccionPoblacion));
		String poblacionData = "";

		List<String> headersVariablesClinicas = new ArrayList<String>();
		List<String> variablesClinicas = new ArrayList<String>();
		List<String> headersAlgoritmos = new ArrayList<String>();
		List<String> algoritmos = new ArrayList<String>();

		int algoritmoOptimoIndex;

		switch (fase) {
		case "fase1":

			headersVariablesClinicas = Arrays.asList(headers.getHeadersVariablesClinicas().split(","));
			for (int i = 0; i < headersVariablesClinicas.size(); i++) {
				if (indices.contains(i)) {
					poblacionData += headersVariablesClinicas.get(i);
					poblacionData += i == (indices.get(indices.size() - 1)) ? "\n" : ",";
				}

			}

			for (int i = 0; i < poblacion.size(); i++) {
				variablesClinicas = Arrays.asList(poblacion.get(i).getVariablesClinicas().split(","));
				for (int j = 0; j < variablesClinicas.size(); j++) {
					if (indices.contains(j)) {
						poblacionData += variablesClinicas.get(j);
						poblacionData += j == (indices.get(indices.size() - 1)) ? "\n" : ",";
					}

				}
			}

			break;
		case "fase2":

			headersVariablesClinicas = Arrays.asList(headers.getHeadersVariablesClinicas().split(","));
			for (int i = 0; i < headersVariablesClinicas.size(); i++) {
				if (indices.contains(i)) {
					poblacionData += headersVariablesClinicas.get(i);
					poblacionData += i == (indices.get(indices.size() - 1)) ? "\n" : ",";
				}

			}

			for (int i = 0; i < poblacion.size(); i++) {
				variablesClinicas = Arrays.asList(poblacion.get(i).getVariablesClinicas().split(","));
				for (int j = 0; j < variablesClinicas.size(); j++) {
					if (indices.contains(j)) {
						poblacionData += variablesClinicas.get(j);
						poblacionData += j == (indices.get(indices.size() - 1)) ? "\n" : ",";
					}

				}
			}

			break;
		case "fase3":

			poblacionData += headers.getHeadersVariableObjetivo() + ",";
			poblacionData += headers.getHeadersAlgoritmos() + "\n";
			for (int i = 0; i < poblacion.size(); i++) {
				poblacionData += poblacion.get(i).getVariableObjetivo() + ",";
				poblacionData += poblacion.get(i).getAlgoritmos() + "\n";
			}

			break;
		case "fase4":

			poblacionData += headers.getHeadersVariableObjetivo() + ",";

			headersAlgoritmos = Arrays.asList(headers.getHeadersAlgoritmos().split(","));

			algoritmoOptimoIndex = headersAlgoritmos.indexOf(algoritmoOptimo);

			poblacionData += headersAlgoritmos.get(algoritmoOptimoIndex) + ",";

			headersVariablesClinicas = Arrays.asList(headers.getHeadersVariablesClinicas().split(","));
			for (int i = 0; i < headersVariablesClinicas.size(); i++) {
				if (indices.contains(i)) {
					poblacionData += headersVariablesClinicas.get(i);
					poblacionData += i == (indices.get(indices.size() - 1)) ? "\n" : ",";
				}

			}

			for (int i = 0; i < poblacion.size(); i++) {
				poblacionData += poblacion.get(i).getVariableObjetivo() + ",";
				algoritmos = Arrays.asList(poblacion.get(i).getAlgoritmos().split(","));
				poblacionData += algoritmos.get(algoritmoOptimoIndex) + ",";
				variablesClinicas = Arrays.asList(poblacion.get(i).getVariablesClinicas().split(","));
				for (int j = 0; j < variablesClinicas.size(); j++) {
					if (indices.contains(j)) {
						poblacionData += variablesClinicas.get(j);
						poblacionData += j == (indices.get(indices.size() - 1)) ? "\n" : ",";
					}

				}
			}

			break;
		case "fase5":

			headersAlgoritmos = Arrays.asList(headers.getHeadersAlgoritmos().split(","));

			algoritmoOptimoIndex = headersAlgoritmos.indexOf(algoritmoOptimo);

			poblacionData += headersAlgoritmos.get(algoritmoOptimoIndex) + ",";

			headersVariablesClinicas = Arrays.asList(headers.getHeadersVariablesClinicas().split(","));
			for (int i = 0; i < headersVariablesClinicas.size(); i++) {
				if (indices.contains(i)) {
					poblacionData += headersVariablesClinicas.get(i);
					poblacionData += i == (indices.get(indices.size() - 1)) ? "\n" : ",";
				}

			}

			for (int i = 0; i < poblacion.size(); i++) {
				algoritmos = Arrays.asList(poblacion.get(i).getAlgoritmos().split(","));
				poblacionData += algoritmos.get(algoritmoOptimoIndex) + ",";
				variablesClinicas = Arrays.asList(poblacion.get(i).getVariablesClinicas().split(","));
				for (int j = 0; j < variablesClinicas.size(); j++) {
					if (indices.contains(j)) {
						poblacionData += variablesClinicas.get(j);
						poblacionData += j == (indices.get(indices.size() - 1)) ? "\n" : ",";
					}

				}
			}

			break;
		}

		File tempFile = File.createTempFile("temp", "prediccion" + idPrediccionPoblacion + ".csv");

		Files.writeString(tempFile.toPath(), poblacionData);

		return tempFile;

	}

	@GetMapping("/getPacientesPrediccion")
	public ResponseEntity<?> getPacientesPrediccion(@RequestParam("descripcion") String descripcion) {

		if (!this.validarAccesoEndpoint(1)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity<>("Por favor, seleccione una descripción", HttpStatus.BAD_REQUEST);
		}

		Predicciones p = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (p == null) {
			return new ResponseEntity<>("La prediccion seleccionada no existe", HttpStatus.BAD_REQUEST);
		} else {
			return new ResponseEntity<>(p.getPacientes().size(), HttpStatus.OK);
		}

	}

	@PostMapping(value = "/actualizarInformacionPrediccionAndPacientes", consumes = "multipart/form-data")
	public ResponseEntity<?> guardarInformacionPacientes(@RequestParam("descripcion") String descripcion,
			@RequestPart(name = "file", required = false) @Nullable MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		if (!this.validarAccesoEndpoint(1)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity<>("Por favor, seleccione una predicción", HttpStatus.BAD_REQUEST);
		}

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (prediccion == null) {
			return new ResponseEntity<>("La predicción seleccionada no existe", HttpStatus.BAD_REQUEST);
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

		this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(1));

		return new ResponseEntity<>(this.rutasSecuenciales.get(2), HttpStatus.OK);
	}

	@GetMapping("/getMaximoVariablesClinicas")
	public ResponseEntity<?> getMaximoVariablesClinicas() {

		if (!this.validarAccesoEndpoint(2)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

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

		if (!this.validarAccesoEndpoint(2)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<String> variablesClinicasCoincidentes = new ArrayList<String>();

		if (!nombreVariableClinica.isEmpty() && nombreVariableClinica != null) {
			variablesClinicasCoincidentes = headersPacientesService.findVariablesClinicasCoincidentes(
					nombreVariableClinica, idPrediccion, variablesClinicasSeleccionadas);
		}

		return new ResponseEntity<>(variablesClinicasCoincidentes, HttpStatus.OK);
	}

	@GetMapping("/getAllVariablesClinicas")
	public ResponseEntity<?> getAllVariablesClinicas() {

		if (!this.validarAccesoEndpoint(2)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<String> allVariablesClinicas = headersPacientesService.findAllVariablesClinicas(idPrediccion);

		return new ResponseEntity<>(allVariablesClinicas, HttpStatus.OK);
	}

	@PostMapping(value = "/procesarVariablesClinicasSeleccionadas", consumes = "application/json")
	public ResponseEntity<?> procesarVariablesClinicasSeleccionadas(@RequestBody List<String> variablesSeleccionadas) {

		if (!this.validarAccesoEndpoint(2)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		String error = this.validarVariablesSeleccionadas(idPrediccion, variablesSeleccionadas);

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		List<Integer> indicesVariablesSeleccionadas = headersPacientesService.findIndicesVariablesClinicas(idPrediccion,
				variablesSeleccionadas);

		session.setAttribute("indicesVariablesSeleccionadas", indicesVariablesSeleccionadas);

		this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(2));

		return new ResponseEntity<>(this.rutasSecuenciales.get(3), HttpStatus.OK);
	}

	@PostMapping("/getOptimalNClusters")
	public ResponseEntity<?> getOptimalNClusters(@RequestParam("maxClusters") String maxClusters)
			throws IllegalStateException, IOException {

		if (!this.validarAccesoEndpoint(3)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String error = this.validarInputNumber(maxClusters, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		String urlOptimalNClusters = UrlServidor + "clustering/getOptimalNClusters?max_clusters="
				+ Integer.parseInt(maxClusters);

		CloseableHttpClient httpClient = HttpClients.createDefault();

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<Integer> indicesVariablesSeleccionadas = (List<Integer>) session
				.getAttribute("indicesVariablesSeleccionadas");

		File file = llamadaBBDDPoblacion(idPrediccion, "fase1", null, indicesVariablesSeleccionadas);

		InputStream inputStream = llamadaServidorNgrok(urlOptimalNClusters, file, httpClient);

		byte[] imageBytes = inputStream.readAllBytes();

		httpClient.close();

		file.delete();

		session.setAttribute(this.rutasSecuenciales.get(3) + "_executed", true);

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);
	}

	@GetMapping("/getAlgoritmosObligatorios")
	public ResponseEntity<?> getAlgoritmosObligatorios() {

		if (!this.validarAccesoEndpoint(4)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		return new ResponseEntity<>(algoritmosClusteringService.findAlgoritmosObligatorios(), HttpStatus.OK);
	}

	@PostMapping("/buscarAlgoritmosCoincidentes")
	public ResponseEntity<?> buscarAlgoritmosCoincidentes(@RequestParam("nombreAlgoritmo") String nombreAlgoritmo,
			@RequestParam("algoritmosSeleccionados") String algoritmosSeleccionados,
			@RequestParam("algoritmosPreSeleccionados") String algoritmosPreSeleccionados)
			throws JsonMappingException, JsonProcessingException {

		if (!this.validarAccesoEndpoint(4)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		List<AlgoritmosClustering> algoritmosCoincidentes = new ArrayList<AlgoritmosClustering>();

		if (!nombreAlgoritmo.equals("") && nombreAlgoritmo != null) {

			algoritmosCoincidentes = algoritmosClusteringService.findAlgoritmosCoincidentesAndNoSeleccionados(
					nombreAlgoritmo, algoritmosSeleccionados, algoritmosPreSeleccionados);
		}

		return new ResponseEntity<>(algoritmosCoincidentes, HttpStatus.OK);
	}

	@PostMapping(value = "/getSubPopulations", consumes = "application/json")
	public ResponseEntity<?> getSubPopulations(@RequestBody List<Map<String, Object>> algoritmos) throws IOException {

		if (!this.validarAccesoEndpoint(4)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}
		
		String error = this.validarAlgoritmos(algoritmos);

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error,
					HttpStatus.BAD_REQUEST);
		}
		
		Optional<Map<String, Object>> agglomerative = algoritmos.stream()
	            .filter(mapa -> "agglomerative".equals(mapa.get("nombreAlgoritmo")))
	            .findFirst();
		
		Optional<Map<String, Object>> kmodes = algoritmos.stream()
	            .filter(mapa -> "kmodes".equals(mapa.get("nombreAlgoritmo")))
	            .findFirst();

		String urlSubPopulations = UrlServidor + "clustering/getSubpopulations?n_agglomerative="
				+ agglomerative.get().get("nClusters") + "&n_kmodes=" + kmodes.get().get("nClusters");

		CloseableHttpClient httpClient = HttpClients.createDefault();

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<Integer> indicesVariablesSeleccionadas = (List<Integer>) session
				.getAttribute("indicesVariablesSeleccionadas");

		File file = llamadaBBDDPoblacion(idPrediccion, "fase2", null, indicesVariablesSeleccionadas);

		InputStream inputStream = llamadaServidorNgrok(urlSubPopulations, file, httpClient);

		byte[] csvBytes = inputStream.readAllBytes();

		InputStream input = new ByteArrayInputStream(csvBytes);

		headersPacientesService.addAlgoritmosHeadersPoblacion(input, Long.parseLong(idPrediccion));

		input = new ByteArrayInputStream(csvBytes);

		pacientesService.addAlgoritmosPoblacion(input, Long.parseLong(idPrediccion));

		httpClient.close();

		file.delete();

		session.setAttribute(this.rutasSecuenciales.get(4) + "_executed", true);

		// Devuelve la respuesta con el archivo adjunto.
		return new ResponseEntity<>(csvBytes, HttpStatus.OK);
	}

	@PostMapping("/getVarianceMetrics")
	public ResponseEntity<?> getVarianceMetrics() throws IllegalStateException, IOException {

		if (!this.validarAccesoEndpoint(5)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String urlVarianceMetrics = UrlServidor + "clustering/getVarianceMetrics";

		CloseableHttpClient httpClient = HttpClients.createDefault();

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		File file = llamadaBBDDPoblacion(idPrediccion, "fase3", null, null);

		InputStream inputStream = llamadaServidorNgrok(urlVarianceMetrics, file, httpClient);

		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
		String line;
		StringBuffer res = new StringBuffer();
		while ((line = bufferedReader.readLine()) != null) {
			res.append(line);
		}
		String aux = res.substring(1, res.length() - 1);
		aux = aux.replaceAll("'", "\"");

		List<Map<String, Object>> map = null;
		map = new ObjectMapper().readValue(aux, List.class);

		httpClient.close();

		file.delete();

		String algoritmoOptimo = this.calcularAlgoritmoOptimo(map);

		session.setAttribute("algoritmoOptimo", algoritmoOptimo);

		session.setAttribute(this.rutasSecuenciales.get(5) + "_executed", true);

		HashMap<String, Object> ret = new HashMap<String, Object>();

		ret.put("algoritmoOptimo", algoritmoOptimo);

		ret.put("lista", map);

		return new ResponseEntity<>(ret, HttpStatus.OK);

	}

	private String calcularAlgoritmoOptimo(List<Map<String, Object>> map) {

		Double minimoWc = (Double) map.get(1).get("total_wc");

		Double maximoBc = (Double) map.get(1).get("total_bc");

		String nombreAlgoritmo = (String) map.get(1).get("metric");

		for (int i = 2; i < map.size(); i++) {

			if ((Double) map.get(i).get("total_wc") <= minimoWc && (Double) map.get(i).get("total_bc") >= maximoBc) {
				minimoWc = (Double) map.get(i).get("total_wc");
				maximoBc = (Double) map.get(i).get("total_bc");
				nombreAlgoritmo = (String) map.get(i).get("metric");
			}

		}

		return nombreAlgoritmo;
	}

	@GetMapping("/getAlgoritmoOptimo")
	public ResponseEntity<?> getAlgoritmoOptimo() {

		if (!this.validarAccesoEndpoint(6)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String algoritmoOptimo = (String) session.getAttribute("algoritmoOptimo");

		if (algoritmoOptimo == null) {
			return new ResponseEntity<>("Para obtener el algoritmo óptimo tiene que ejecutar la fase 3 previamente",
					HttpStatus.BAD_REQUEST);
		} else {
			return new ResponseEntity<>(algoritmoOptimo, HttpStatus.OK);
		}
	}

	@PostMapping("/createPopulationAndCurves")
	public ResponseEntity<?> createPopulationAndCurves()
			throws IllegalStateException, IOException, ClassNotFoundException {

		if (!this.validarAccesoEndpoint(6)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<Integer> indicesVariablesSeleccionadas = (List<Integer>) session
				.getAttribute("indicesVariablesSeleccionadas");

		String algoritmoOptimo = (String) session.getAttribute("algoritmoOptimo");

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));

		File file = llamadaBBDDPoblacion(idPrediccion, "fase4", algoritmoOptimo, indicesVariablesSeleccionadas);

		this.guardarFeatures(file, "survivalAndProfiling/createPopulationProfile", -1, idPrediccion);

		for (int i = 0; i < prediccion.getMaxClusters(); i++) {
			this.guardarFeatures(file,
					"survivalAndProfiling/createClusterProfile?cluster_number=" + Integer.toString(i), i, idPrediccion);
		}

		String rutaPrediccion = rutaImagenesClusters + File.separator + "prediccion" + idPrediccion;

		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves",
				rutaPrediccion + File.separator + "allClusters.png",
				"/clustersImages/prediccion" + idPrediccion + "/allClusters.png", -1, idPrediccion);
		for (int i = 0; i < prediccion.getMaxClusters(); i++) {
			this.guardarImagenes(file,
					"survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i),
					rutaPrediccion + File.separator + "cluster" + Integer.toString(i) + ".png",
					"/clustersImages/prediccion" + idPrediccion + "/cluster" + Integer.toString(i) + ".png", i,
					idPrediccion);
		}

		file.delete();

		session.setAttribute(this.rutasSecuenciales.get(6) + "_executed", true);

		return new ResponseEntity<>(prediccion.getMaxClusters(), HttpStatus.OK);

	}

	@GetMapping("/getRutaCluster")
	public ResponseEntity<?> getRutaCluster(@RequestParam("clusterNumber") String clusterNumber)
			throws IllegalStateException, IOException {

		if (!this.validarAccesoEndpoint(6)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));

		String error = this.validarInputNumber(clusterNumber, -1, prediccion.getMaxClusters());
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		Imagenes imagen = imagenesService.findClusterImage(Integer.parseInt(clusterNumber),
				Long.parseLong(idPrediccion));

		if (imagen != null) {
			return new ResponseEntity<>(imagen.getRuta(), HttpStatus.OK);
		} else {
			return new ResponseEntity<>("No hay imagen asignada para ese cluster", HttpStatus.BAD_REQUEST);
		}

	}

	@GetMapping("/getClusterProfile")
	public ResponseEntity<?> getClusterProfile(@RequestParam("clusterNumber") String clusterNumber)
			throws IllegalStateException, IOException {

		if (!this.validarAccesoEndpoint(6)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));

		String error = this.validarInputNumber(clusterNumber, -1, prediccion.getMaxClusters());
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		Profiles profile = profilesService.findClusterProfile(Integer.parseInt(clusterNumber),
				Long.parseLong(idPrediccion));

		if (profile != null) {
			HashMap<String, Object> map = null;
			map = new ObjectMapper().readValue(profile.getFeatures(), HashMap.class);

			return new ResponseEntity<>(map, HttpStatus.OK);
		} else {
			return new ResponseEntity<>("No hay perfil de población asignado a ese cluster", HttpStatus.BAD_REQUEST);
		}

	}

	@PostMapping("/getModelPerformance")
	public ResponseEntity<?> getModelPerformance() throws IllegalStateException, IOException {

		if (!this.validarAccesoEndpoint(7)) {
			return new ResponseEntity<>("No puedes acceder todavía a este endpoint", HttpStatus.BAD_REQUEST);
		}

		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		List<Integer> indicesVariablesSeleccionadas = (List<Integer>) session
				.getAttribute("indicesVariablesSeleccionadas");

		String algoritmoOptimo = (String) session.getAttribute("algoritmoOptimo");

		String urlModelPerformance = UrlServidor + "survivalAndProfiling/getModelPerformance";

		CloseableHttpClient httpClient = HttpClients.createDefault();

		File file = llamadaBBDDPoblacion(idPrediccion, "fase5", algoritmoOptimo, indicesVariablesSeleccionadas);

		InputStream inputStream = llamadaServidorNgrok(urlModelPerformance, file, httpClient);

		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
		String line;
		StringBuilder stringBuilder = new StringBuilder();
		while ((line = bufferedReader.readLine()) != null) {
			stringBuilder.append(line);
		}
		String jsonString = stringBuilder.toString();

		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(jsonString, HashMap.class);

		httpClient.close();

		file.delete();

		session.setAttribute(this.rutasSecuenciales.get(7) + "_executed", true);

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	@PostMapping("/siguienteFase")
	public ResponseEntity<?> siguienteFase() {

		int indice = 3;

		while (indice < this.rutasSecuenciales.size() - 1) {

			Boolean hasExecuted = (Boolean) session.getAttribute(this.rutasSecuenciales.get(indice) + "_executed");

			Boolean hasPassed = (Boolean) session.getAttribute(this.rutasSecuenciales.get(indice) + "_passed");

			if (hasExecuted == null && hasPassed == null) {
				return new ResponseEntity<>(this.rutasSecuenciales.get(indice + 1), HttpStatus.OK);
			} else if (hasExecuted && hasPassed == null) {

				this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(indice));
				return new ResponseEntity<>(this.rutasSecuenciales.get(indice + 1), HttpStatus.OK);
			} else if (hasExecuted && hasPassed) {
				indice++;
			}

		}

		return new ResponseEntity<>("Esta es la última fase", HttpStatus.BAD_REQUEST);
	}

	@PostMapping("/terminarProceso")
	public ResponseEntity<?> terminarProcesoSecuencial() {

		Boolean hasExecuted = (Boolean) session.getAttribute(this.rutasSecuenciales.get(7) + "_executed");

		if (hasExecuted == null) {
			return new ResponseEntity<>("Es necesario ejecutar el endpoint Rendimiento del modelo",
					HttpStatus.BAD_REQUEST);
		} else {

			return new ResponseEntity<>(this.rutasSecuenciales.get(0), HttpStatus.OK);
		}
	}

	private void actualizarRutaSecuencialSession(String ruta) {

		session.setAttribute(ruta + "_passed", true);

	}

	private Boolean validarAccesoEndpoint(int index) {

		if (index > 3) {

			Boolean hasExecuted = (Boolean) session.getAttribute(this.rutasSecuenciales.get(index - 1) + "_executed");

			if (hasExecuted == null) {
				return false;
			}
		}

		Boolean hasPassed = (Boolean) session.getAttribute(this.rutasSecuenciales.get(index - 1) + "_passed");

		if (hasPassed == null) {
			return false;
		}

		return true;
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

}
