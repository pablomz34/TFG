package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.commons.text.StringEscapeUtils;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;

import jakarta.annotation.Nullable;
import jakarta.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/admin/procesamientos/noSecuencial")
public class ProcesamientoNoSecuencialController extends ProcesamientosController {

	@GetMapping("/fases")
	public String fases(HttpServletResponse response) throws IOException {
		
		Boolean hasPassedSeleccionProcesamiento = (Boolean) session.getAttribute(this.rutasSecuenciales.get(0) + "noSecuencial_passed");
		
		if(hasPassedSeleccionProcesamiento == null) {
			session.setAttribute("accesoDenegadoMessage", "Es necesario seleccionar el procesamiento no secuencial y manual");
			response.sendRedirect(this.rutasSecuenciales.get(0));
		}	
		
		return "noSecuencialFases";
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

	@PostMapping(value = "/getOptimalNClusters", consumes = "multipart/form-data")
	public ResponseEntity<?> getOptimalNClusters(@RequestParam("max_clusters") String max_clusters,
			@RequestPart(name = "file") MultipartFile multipartFile) throws IllegalStateException, IOException {

		String error = this.validarInputNumber(max_clusters, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		// Verificar el tipo de contenido del archivo
		
		error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		
		String urlOptimalNClusters = UrlServidor + "clustering/getOptimalNClusters?max_clusters="
				+ Integer.parseInt(max_clusters);

		CloseableHttpClient httpClient = HttpClients.createDefault();

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		multipartFile.transferTo(file);

		InputStream inputStream = llamadaServidorNgrok(urlOptimalNClusters, file, httpClient);

		byte[] imageBytes = inputStream.readAllBytes();

		httpClient.close();

		file.delete();

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);
	}

	@PostMapping(value = "/getSubPopulations", consumes = "multipart/form-data")
	public ResponseEntity<?> getSubPopulations(@RequestParam("algoritmos") String algoritmosJsonString,
			@RequestPart(name = "file") MultipartFile multipartFile) throws IOException {

		List<Map<String, Object>> algoritmos;

		try {
			algoritmos = new ObjectMapper().readValue(algoritmosJsonString, List.class);

			String error = this.validarAlgoritmos(algoritmos);

			if (!error.isEmpty()) {
				return new ResponseEntity<>(error,
						HttpStatus.BAD_REQUEST);
			}

			// Verificar el tipo de contenido del archivo
			
			error = this.validarInputFile(multipartFile);
			if (!error.isEmpty()) {
				return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
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

			byte[] csvBytes;

			File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

			multipartFile.transferTo(file);

			InputStream inputStream = llamadaServidorNgrok(urlSubPopulations, file, httpClient);

			csvBytes = inputStream.readAllBytes();

			httpClient.close();

			file.delete();

			// Devuelve la respuesta con el archivo adjunto.
			return new ResponseEntity<>(csvBytes, HttpStatus.OK);
		} catch (JsonProcessingException e) {

			return new ResponseEntity<>("Formato de algoritmos inválido", HttpStatus.BAD_REQUEST);
		}

	}

	@PostMapping(value = "/getVarianceMetrics", consumes = "multipart/form-data")
	public ResponseEntity<?> getVarianceMetrics(@RequestPart(name = "file") MultipartFile multipartFile)
			throws IllegalStateException, IOException {
		
		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		
		String urlVarianceMetrics = UrlServidor + "clustering/getVarianceMetrics";

		CloseableHttpClient httpClient = HttpClients.createDefault();

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		multipartFile.transferTo(file);

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

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	@GetMapping("/getDescripcionesPredicciones")
	public ResponseEntity<?> getDescripcionesPredicciones() {
		return new ResponseEntity<>(prediccionesService.getDescripciones(), HttpStatus.OK);
	}

	@PostMapping("/getPrediccion")
	public ResponseEntity<?> modificarPrediccion(@RequestParam("descripcion") String descripcion)
			throws UnsupportedEncodingException {

		if (descripcion == null || descripcion.isEmpty()) {
			return new ResponseEntity<>("Por favor, escoja una predicción", HttpStatus.BAD_REQUEST);
		}

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcion);

		if (prediccion == null) {
			return new ResponseEntity<>("La predicción seleccionada no es válida", HttpStatus.BAD_REQUEST);
		}
		else {
			return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
		}

	}

	@PostMapping(value = "/createPopulationAndCurves", consumes = "multipart/form-data")
	public ResponseEntity<?> createPopulationProfile(
			@RequestParam("idPrediccionPoblacion") String idPrediccionPoblacion,
			@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException, ClassNotFoundException {

		idPrediccionPoblacion = StringEscapeUtils.escapeJava(idPrediccionPoblacion);

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccionPoblacion));
	
		if(prediccion == null) {
			return new ResponseEntity<>("La predicción seleccionada no existe", HttpStatus.BAD_REQUEST);
		}
		
		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		
		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

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

		if(prediccion == null) {
			return new ResponseEntity<>("La predicción seleccionada no existe", HttpStatus.BAD_REQUEST);
		}
		
		String error = this.validarInputNumber(clusterNumber, -1, prediccion.getMaxClusters());
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		Imagenes imagen = imagenesService.findClusterImage(Integer.parseInt(clusterNumber),
				prediccion.getId());

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

		if(prediccion == null) {
			return new ResponseEntity<>("La predicción seleccionada no existe", HttpStatus.BAD_REQUEST);
		}
		
		String error = this.validarInputNumber(clusterNumber, -1, prediccion.getMaxClusters());
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		Profiles profile = profilesService.findClusterProfile(Integer.parseInt(clusterNumber),
				prediccion.getId());

		if (profile != null) {
			HashMap<String, Object> map = null;
			map = new ObjectMapper().readValue(profile.getFeatures(), HashMap.class);

			return new ResponseEntity<>(map, HttpStatus.OK);
		} else {
			return new ResponseEntity<>("No hay perfil de población asignado a ese cluster", HttpStatus.BAD_REQUEST);
		}

	}

	@PostMapping(value = "/getModelPerformance", consumes = "multipart/form-data")
	public ResponseEntity<?> getModelPerformance(@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		
		String urlModelPerformance = UrlServidor + "survivalAndProfiling/getModelPerformance";

		CloseableHttpClient httpClient = HttpClients.createDefault();

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		multipartFile.transferTo(file);

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

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

}
