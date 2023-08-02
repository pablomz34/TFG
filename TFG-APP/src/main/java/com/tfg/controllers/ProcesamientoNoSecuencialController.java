package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.text.StringEscapeUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.HeadersPacientes;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Pacientes;
import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;
import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IHeadersPacientesService;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPacientesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

import jakarta.annotation.Nullable;

@Controller
@RequestMapping("/admin/procesamientoNoSecuencial")
public class ProcesamientoNoSecuencialController {

	static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";
	static final String UrlMock = "http://localhost:8090/";

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

	@GetMapping("/fases")
	public String fases() {
		return "fasesNoSecuencial";
	}

	@GetMapping("/getPredicciones")
	public List<String> getPredicciones() {
		List<String> descripciones = prediccionesService.getDescripciones();

		return descripciones;
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleException(Exception ex) {
		// Construir una respuesta personalizada para excepciones no capturadas
		HttpStatus status = HttpStatus.BAD_REQUEST;
		String mensaje;
		if (ex instanceof MissingServletRequestPartException) {
			mensaje = "Por favor, seleccione un archivo";
		} else {
			mensaje = "Ocurrió un error en el servidor: " + ex.getMessage();
		}

		return ResponseEntity.status(status).body(mensaje);
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

	@PostMapping(value = "/validarArchivoPantalla2", consumes = "multipart/form-data")
	public ResponseEntity<?> validarArchivoPantalla2(@RequestPart(name = "file") MultipartFile multipartFile) {

		String error = this.validarInputFile(multipartFile);

		if (!error.isEmpty()) {
			return new ResponseEntity(error, HttpStatus.BAD_REQUEST);
		} else {
			return new ResponseEntity("", HttpStatus.OK);
		}

	}

	@GetMapping("/getPacientesPrediccion")
	public ResponseEntity<?> getPacientesPrediccion(@RequestParam("descripcion") String descripcion) {

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity("Por favor, seleccione una descripción", HttpStatus.BAD_REQUEST);
		}

		Predicciones p = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (p == null) {
			return new ResponseEntity("No existe ninguna predicción con esa descripción", HttpStatus.BAD_REQUEST);
		} else {
			return new ResponseEntity(p.getPacientes().size(), HttpStatus.OK);
		}

	}

	@GetMapping("/getAlgoritmosObligatorios")
	public List<AlgoritmosClustering> getAlgoritmosObligatorios() {
		return algoritmosClusteringService.findAlgoritmosObligatorios();
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

	@PostMapping("/buscarVariablesClinicasCoincidentes")
	public ResponseEntity<?> buscarVariablesClinicasCoincidentes(
			@RequestParam("nombreVariableClinica") String nombreVariableClinica,
			@RequestParam("idPrediccionPoblacion") String idPrediccionPoblacion,
			@RequestParam("variablesClinicasSeleccionadas") String variablesClinicasSeleccionadas)
			throws JsonMappingException, JsonProcessingException {

		List<HashMap<String, Object>> variablesClinicas = new ArrayList<HashMap<String, Object>>();

		if (!nombreVariableClinica.equals("") && nombreVariableClinica != null) {
			variablesClinicas = headersPacientesService.findVariablesClinicasCoincidentes(nombreVariableClinica,
					idPrediccionPoblacion, variablesClinicasSeleccionadas);
		}

		return new ResponseEntity(variablesClinicas, HttpStatus.OK);
	}

	@GetMapping("/getMaximoVariablesClinicas")
	public int getMaximoVariablesClinicas(@RequestParam("idPrediccionPoblacion") String idPrediccionPoblacion) {

		return headersPacientesService.findMaxNumVariablesClinicas(idPrediccionPoblacion);
	}

	@GetMapping("/getAllVariablesClinicas")
	public List<HashMap<String, Object>> getAllVariablesClinicas(
			@RequestParam("idPrediccionPoblacion") String idPrediccionPoblacion) {
		return headersPacientesService.findAllVariablesClinicas(idPrediccionPoblacion);
	}

	@PostMapping(value = "/guardarInformacionPacientes", consumes = "multipart/form-data")
	public ResponseEntity<?> guardarInformacionPacientes(@RequestParam("descripcion") String descripcion,
			@RequestPart(name = "file", required = true) @Nullable MultipartFile multipartFile)
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

		return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
	}

	@PostMapping(value = "/getOptimalNClusters", consumes = "multipart/form-data")
	public ResponseEntity<?> getOptimalNClusters(@RequestParam("max_clusters") String max_clusters,
			@RequestPart(name = "file", required = false) MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		String error = this.validarInputNumber(max_clusters, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		// Verificar el tipo de contenido del archivo
		if (multipartFile != null) {
			error = this.validarInputFile(multipartFile);
			if (!error.isEmpty()) {
				return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
			}
		}

		String urlOptimalNClusters = UrlMock + "clustering/getOptimalNClusters?max_clusters="
				+ Integer.parseInt(max_clusters);

		InputStream inputStream;

		File file;

		CloseableHttpClient httpClient = HttpClients.createDefault();

		if (multipartFile != null) {

			file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

			multipartFile.transferTo(file);

			inputStream = llamadaServidorNgrok(urlOptimalNClusters, file, httpClient);

		} else {
			return new ResponseEntity<>("La llamada a getOptimalNClusters salió mal", HttpStatus.BAD_REQUEST);
		}

		byte[] imageBytes = inputStream.readAllBytes();

		httpClient.close();

		file.delete();

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);
	}

	@PostMapping(value = "/getSubPopulations", consumes = "multipart/form-data")
	public ResponseEntity<?> getSubPopulations(@RequestParam("algoritmos") @Nullable String algoritmosJsonString,
			@RequestPart(name = "file", required = true) MultipartFile multipartFile) throws IOException {

		List<Map<String, Object>> algoritmos;

		try {
			algoritmos = new ObjectMapper().readValue(algoritmosJsonString, List.class);

			if (algoritmos.isEmpty()) {
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

			// Verificar el tipo de contenido del archivo
			if (multipartFile != null) {
				error = this.validarInputFile(multipartFile);
				if (!error.isEmpty()) {
					return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
				}
			}

			String urlSubPopulations = UrlMock + "clustering/getSubpopulations?n_agglomerative="
					+ algoritmos.get(0).get("nClusters") + "&n_kmodes=" + algoritmos.get(1).get("nClusters");

			InputStream inputStream;

			File file;

			CloseableHttpClient httpClient = HttpClients.createDefault();

			byte[] csvBytes;

			if (multipartFile != null) {

				file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

				multipartFile.transferTo(file);

				inputStream = llamadaServidorNgrok(urlSubPopulations, file, httpClient);

				csvBytes = inputStream.readAllBytes();

			} else {
				return new ResponseEntity<>("La llamada a getSubPopulations salió mal", HttpStatus.BAD_REQUEST);
			}

			httpClient.close();

			file.delete();

			// Devuelve la respuesta con el archivo adjunto.
			return new ResponseEntity<>(csvBytes, HttpStatus.OK);
		} catch (JsonProcessingException e) {

			return new ResponseEntity<>("Formato de algoritmos inválido", HttpStatus.BAD_REQUEST);
		}

	}

	@PostMapping(value = "/getVarianceMetrics", consumes = "multipart/form-data")
	public ResponseEntity<?> getVarianceMetrics(
			@RequestPart(name = "file", required = true) MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		if (multipartFile != null) {
			String error = this.validarInputFile(multipartFile);
			if (!error.isEmpty()) {
				return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
			}
		}

		String urlVarianceMetrics = UrlMock + "clustering/getVarianceMetrics";

		InputStream inputStream;

		File file;

		CloseableHttpClient httpClient = HttpClients.createDefault();

		if (multipartFile != null) {

			file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

			multipartFile.transferTo(file);

			inputStream = llamadaServidorNgrok(urlVarianceMetrics, file, httpClient);

		} else {
			return new ResponseEntity<>("La llamada a getVarianceMetrics salió mal", HttpStatus.BAD_REQUEST);
		}

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

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	@GetMapping("/getDescripcionesPredicciones")
	public ResponseEntity<?> getDescripcionesPredicciones() {
		return new ResponseEntity<>(prediccionesService.getDescripciones(), HttpStatus.OK);
	}

	@PostMapping("/createOrUpdatePrediction")
	public ResponseEntity<?> createOrFindPrediction(@RequestParam("crearPrediccion") boolean crearPrediccion,
			@RequestParam("descripcion") String descripcion) throws UnsupportedEncodingException {

		if (descripcion == null || descripcion.isEmpty()) {
			String errorDescripcionVacía = "";

			if (crearPrediccion) {
				errorDescripcionVacía = "Por favor, escriba una descripción para la predicción";
			} else {
				errorDescripcionVacía = "Por favor, escoja una predicción válida";
			}
			return new ResponseEntity<>(errorDescripcionVacía, HttpStatus.BAD_REQUEST);
		}

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (crearPrediccion) {

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
		} else {
			if (prediccion != null) {
				if (!this.crearCarpetaPrediccion(prediccion)) {
					return new ResponseEntity<>("El sistema de gestión de archivos ha fallado",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}

				return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
			} else {
				return new ResponseEntity<>("Escoja una predicción válida", HttpStatus.BAD_REQUEST);
			}
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

	@PostMapping(value = "/createPopulationAndCurves", consumes = "multipart/form-data")
	public ResponseEntity<?> createPopulationProfile(
			@RequestParam(name = "idPrediccionPoblacion") String idPrediccionPoblacion,
			@RequestPart(name = "file", required = true) MultipartFile multipartFile)
			throws IllegalStateException, IOException, ClassNotFoundException {

		idPrediccionPoblacion = StringEscapeUtils.escapeJava(idPrediccionPoblacion);

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccionPoblacion));

		if (multipartFile != null) {
			String error = this.validarInputFile(multipartFile);
			if (!error.isEmpty()) {
				return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
			}
		}

		File file;

		file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		multipartFile.transferTo(file);

		this.guardarFeatures(file, "survivalAndProfiling/createPopulationProfile", -1, idPrediccionPoblacion);

		for (int i = 0; i < prediccion.getMaxClusters(); i++) {
			this.guardarFeatures(file,
					"survivalAndProfiling/createClusterProfile?cluster_number=" + Integer.toString(i), i,
					idPrediccionPoblacion);
		}

		String rutaPrediccion = rutaImagenesClusters + File.separator + "prediccion" + idPrediccionPoblacion;

		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves",
				rutaPrediccion + File.separator + "allClusters.png",
				"/clustersImages/prediccion" + idPrediccionPoblacion + "/allClusters.png", -1, idPrediccionPoblacion);
		for (int i = 0; i < prediccion.getMaxClusters(); i++) {
			this.guardarImagenes(file,
					"survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i),
					rutaPrediccion + File.separator + "cluster" + Integer.toString(i) + ".png",
					"/clustersImages/prediccion" + idPrediccionPoblacion + "/cluster" + Integer.toString(i) + ".png", i,
					idPrediccionPoblacion);
		}

		file.delete();

		return new ResponseEntity<>(prediccion.getMaxClusters(), HttpStatus.OK);

	}

	@GetMapping("/getRutaCluster")
	public ResponseEntity<?> getRutaCluster(@RequestParam("clusterNumber") String clusterNumber,
			@RequestParam("idPrediccion") String idPrediccion) throws IllegalStateException, IOException {

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
	public ResponseEntity<?> getClusterProfile(@RequestParam("clusterNumber") String clusterNumber,
			@RequestParam("idPrediccion") String idPrediccion) throws IllegalStateException, IOException {

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

	@PostMapping(value = "/getModelPerformance", consumes = "multipart/form-data")
	public ResponseEntity<?> getModelPerformance(
			@RequestPart(name = "file", required = false) @Nullable MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		if (multipartFile != null) {
			String error = this.validarInputFile(multipartFile);
			if (!error.isEmpty()) {
				return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
			}
		}

		String urlModelPerformance = UrlMock + "survivalAndProfiling/getModelPerformance";

		InputStream inputStream;

		File file;

		CloseableHttpClient httpClient = HttpClients.createDefault();

		if (multipartFile != null) {

			file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

			multipartFile.transferTo(file);

			inputStream = llamadaServidorNgrok(urlModelPerformance, file, httpClient);

		} else {
			return new ResponseEntity<>("La llamada a getModelPerformance salió mal", HttpStatus.BAD_REQUEST);
		}

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

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	private void guardarImagenes(File file, String url, String rutaImagenServidor, String rutaImagenBDD,
			Integer numCluster, String idPrediccionPoblacion) throws IOException {

		String urlImagenCluster = UrlMock + url;

		InputStream inputStream = null;

		CloseableHttpClient httpClient = HttpClients.createDefault();

		inputStream = llamadaServidorNgrok(urlImagenCluster, file, httpClient);

		byte[] imageBytes = inputStream.readAllBytes();

		FileOutputStream imgOutFile = new FileOutputStream(rutaImagenServidor);
		imgOutFile.write(imageBytes);
		imgOutFile.close();

		httpClient.close();

		imagenesService.guardarImagen(numCluster, rutaImagenBDD, Long.parseLong(idPrediccionPoblacion));

	}

	private void guardarFeatures(File file, String url, Integer numCluster, String idPrediccionPoblacion)
			throws ClientProtocolException, IOException {

		String urlPerfilCluster = UrlMock + url;

		InputStream inputStream = null;

		CloseableHttpClient httpClient = HttpClients.createDefault();

		inputStream = llamadaServidorNgrok(urlPerfilCluster, file, httpClient);

		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
		String line;
		StringBuilder stringBuilder = new StringBuilder();
		while ((line = bufferedReader.readLine()) != null) {
			stringBuilder.append(line);
		}
		String jsonString = stringBuilder.toString();

		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(jsonString, HashMap.class);

		if (numCluster == -1) {
			this.calculateMaxClusters(map, Long.parseLong(idPrediccionPoblacion));
		}

		Gson gson = new Gson();
		String featuresString = gson.toJson(map);

		httpClient.close();

		profilesService.guardarProfile(numCluster, featuresString, Long.parseLong(idPrediccionPoblacion));

	}

	private void calculateMaxClusters(HashMap<String, Object> map, Long idPrediccion) {

		List<HashMap<String, Object>> features = (List<HashMap<String, Object>>) map.get("features");

		HashMap<String, Object> algorithmMap = features.get(0);

		List<HashMap<String, Object>> algorithmArray = (List<HashMap<String, Object>>) algorithmMap
				.get("agglomerative");

		Integer maxClusters = algorithmArray.size();

		prediccionesService.guardarMaxClusters(maxClusters, idPrediccion);

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
