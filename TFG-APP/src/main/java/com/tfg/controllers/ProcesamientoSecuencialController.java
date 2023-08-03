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

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.HeadersPacientes;
import com.tfg.entities.Pacientes;
import com.tfg.entities.Predicciones;
import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IHeadersPacientesService;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPacientesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

import jakarta.annotation.Nullable;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin/procesamientoSecuencial")
public class ProcesamientoSecuencialController {

	static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";
	static final String UrlMock = "http://localhost:8090/";

	@Autowired
	private HttpSession session;

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

	@Value("${myapp.rutasSecuenciales}")
	private List<String> rutasSecuenciales;

	@GetMapping("/seleccionarPrediccionAndPoblacion")
	public String seleccionarPrediccionAndPoblacion() {

		List<String> atributosExtra = new ArrayList<String>();

		atributosExtra.add("idPrediccionProcesamientoSecuencial");

		atributosExtra.add("indicesVariablesSeleccionadas");

		atributosExtra.add("algoritmoOptimo");

		this.borrarVariablesSesion(1, atributosExtra);

		return "seleccionarPrediccionAndPoblacion";
	}

	@GetMapping("/seleccionarVariablesClinicas")
	public String seleccionarVariablesClinicas() {

		List<String> atributosExtra = new ArrayList<String>();

		atributosExtra.add("indicesVariablesSeleccionadas");

		atributosExtra.add("algoritmoOptimo");

		this.borrarVariablesSesion(2, atributosExtra);

		return "seleccionarVariablesClinicas";
	}

	@GetMapping("/fase1")
	public String fase1() {

		List<String> atributosExtra = new ArrayList<String>();

		atributosExtra.add("algoritmoOptimo");

		this.borrarVariablesSesion(3, atributosExtra);

		return "procesamientoSecuencialFase1";
	}

	@GetMapping("/fase2")
	public String fase2() {

		List<String> atributosExtra = new ArrayList<String>();

		atributosExtra.add("algoritmoOptimo");

		this.borrarVariablesSesion(4, atributosExtra);

		return "procesamientoSecuencialFase2";
	}

	@GetMapping("/fase3")
	public String fase3() {

		List<String> atributosExtra = new ArrayList<String>();

		atributosExtra.add("algoritmoOptimo");

		this.borrarVariablesSesion(5, atributosExtra);

		return "procesamientoSecuencialFase3";
	}

	@GetMapping("/fase4")
	public String fase4() {

		this.borrarVariablesSesion(6, new ArrayList<String>());

		return "procesamientoSecuencialFase4";
	}

	@GetMapping("/fase5")
	public String fase5() {

		this.borrarVariablesSesion(7, new ArrayList<String>());

		return "procesamientoSecuencialFase5";
	}

	private void borrarVariablesSesion(int indiceRuta, List<String> atributosExtra) {

		for (int i = 0; i < atributosExtra.size(); i++) {

			String nombreAtributo = atributosExtra.get(i);

			if (session.getAttribute(nombreAtributo) != null) {
				session.removeAttribute(nombreAtributo);
			}

		}

		for (int i = indiceRuta; i < this.rutasSecuenciales.size(); i++) {

			String rutaSecuencial = this.rutasSecuenciales.get(i);

			if (i >= 3) {
				if (session.getAttribute(rutaSecuencial + "_executed") != null) {
					session.removeAttribute(rutaSecuencial + "_executed");
				}
			}

			if (session.getAttribute(rutaSecuencial + "_passed") != null) {
				session.removeAttribute(rutaSecuencial + "_passed");
			}

		}

	}

	private InputStream llamadaServidorNgrok(String url, File file, CloseableHttpClient httpClient) throws IOException {

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(url);

		// Crear un objeto MultipartEntityBuilder para construir el cuerpo de la
		// petición
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		// Agregar el archivo al cuerpo de la petición

		builder.addBinaryBody("file", // Nombre del parámetro en el servidor
				file, // Archivo a enviar
				ContentType.APPLICATION_OCTET_STREAM, // Tipo de contenido del archivo
				file.getName() // Nombre del archivo en el cuerpo de la petición
		);

		// Construir el cuerpo de la petición
		HttpEntity multipart = builder.build();

		// Establecer el cuerpo de la petición en el objeto HttpPost
		httpPost.setEntity(multipart);

		// Ejecutar la petición y obtener la respuesta
		CloseableHttpResponse response = httpClient.execute(httpPost);

		return response.getEntity().getContent();
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

		this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(1));

		return new ResponseEntity<>(this.rutasSecuenciales.get(2), HttpStatus.OK);
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

		this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(2));

		return new ResponseEntity<>(this.rutasSecuenciales.get(3), HttpStatus.OK);
	}

	@PostMapping("/getOptimalNClusters")
	public ResponseEntity<?> getOptimalNClusters(@RequestParam("maxClusters") String maxClusters)
			throws IllegalStateException, IOException {

		String error = this.validarInputNumber(maxClusters, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		String urlOptimalNClusters = UrlMock + "clustering/getOptimalNClusters?max_clusters="
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
		
		List<AlgoritmosClustering> algoritmosObligatorios = algoritmosClusteringService.findAlgoritmosObligatorios();
		
		return new ResponseEntity<>(algoritmosObligatorios, HttpStatus.OK) ;
	}

	@PostMapping("/buscarAlgoritmosCoincidentes")
	public ResponseEntity<?> buscarAlgoritmosCoincidentes(@RequestParam("nombreAlgoritmo") String nombreAlgoritmo,
			@RequestParam("algoritmosSeleccionados") String algoritmosSeleccionados,
			@RequestParam("algoritmosPreSeleccionados") String algoritmosPreSeleccionados)
			throws JsonMappingException, JsonProcessingException {

		List<AlgoritmosClustering> algoritmosCoincidentes = new ArrayList<AlgoritmosClustering>();

		if (!nombreAlgoritmo.equals("") && nombreAlgoritmo != null) {

			algoritmosCoincidentes = algoritmosClusteringService.findAlgoritmosCoincidentesAndNoSeleccionados(
					nombreAlgoritmo, algoritmosSeleccionados, algoritmosPreSeleccionados);
		}

		return new ResponseEntity(algoritmosCoincidentes, HttpStatus.OK);
	}
	

	@PostMapping(value = "/getSubPopulations", consumes = "application/json")
	public ResponseEntity<?> getSubPopulations(@RequestBody List<Map<String, Object>> algoritmos)
			throws IOException {

		if (algoritmos.size() == 0) {
			return new ResponseEntity<>("Por favor, los algoritmos kmodes y agglomerative son obligatorios",
					HttpStatus.BAD_REQUEST);
		}

		String error = "";

		for (int i = 0; i < algoritmos.size(); i++) {

			error = this.validarNClustersAlgoritmo((String) algoritmos.get(i).get("nClusters"), 2, 20,
					(String) algoritmos.get(i).get("nombreAlgoritmo"));

			if (!error.isEmpty()) {
				return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
			}
		}

		String urlSubPopulations = UrlMock + "clustering/getSubpopulations?n_agglomerative="
				+ algoritmos.get(0).get("nClusters") + "&n_kmodes=" + algoritmos.get(1).get("nClusters");

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
	public ResponseEntity<?> getVarianceMetrics()
			throws IllegalStateException, IOException {

		String urlVarianceMetrics = UrlMock + "clustering/getVarianceMetrics";

		CloseableHttpClient httpClient = HttpClients.createDefault();	
		
		String idPrediccion = (String) session.getAttribute("idPrediccionProcesamientoSecuencial");

		File file = llamadaBBDDPoblacion(idPrediccion, "fase3", null, null);

		InputStream	inputStream = llamadaServidorNgrok(urlVarianceMetrics, file, httpClient);

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

	@PostMapping("/siguienteFase")
	public ResponseEntity<?> siguienteFase() {

		int indice = 3;

		while (indice < this.rutasSecuenciales.size()) {

			Boolean hasExecuted = (Boolean) session.getAttribute(this.rutasSecuenciales.get(indice) + "_executed");

			Boolean hasPassed = (Boolean) session.getAttribute(this.rutasSecuenciales.get(indice) + "_passed");

			if (hasExecuted == null && hasPassed == null) {
				return new ResponseEntity<>("Por favor, ejecute la fase antes de pasar a la siguiente",
						HttpStatus.BAD_REQUEST);
			} else if (hasExecuted && hasPassed == null) {
				this.actualizarRutaSecuencialSession(this.rutasSecuenciales.get(indice));
				return new ResponseEntity<>(this.rutasSecuenciales.get(indice + 1), HttpStatus.OK);

			} else if (hasExecuted && hasPassed) {
				indice++;
			}

		}

		return new ResponseEntity<>("Esta es la última fase", HttpStatus.BAD_REQUEST);
	}

	private int getNextFase() {

		for (int i = 3; i < this.rutasSecuenciales.size(); i++) {

			Boolean hasExecuted = (Boolean) session.getAttribute(this.rutasSecuenciales.get(i) + "_executed");

			if (hasExecuted == null) {
				return i;
			}

		}

		return -1;
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
