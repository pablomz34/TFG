package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
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
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

@RestController
@RequestMapping("/admin/fases")
public class FasesController {

	static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";

	@Autowired
	private IUsuariosService usuariosService;

	@Autowired
	private IImagenesService imagenesService;

	@Autowired
	private IProfilesService profilesService;

	@Autowired
	private IPrediccionesService prediccionesService;

	@Value("${myapp.imagenesClusters.ruta}")
	private String rutaImagenesClusters;

	@GetMapping("/getMedicos")
	public List<UsuariosDto> getMedicos() {
		List<UsuariosDto> medicos = usuariosService.findAllMedicos();
		return medicos;
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
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

		String error = this.validarInputNumber(max_clusters, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		// Verificar el tipo de contenido del archivo
		error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(
				UrlServidor + "clustering/getOptimalNClusters?max_clusters=" + Integer.parseInt(max_clusters));

		// Crear un objeto MultipartEntityBuilder para construir el cuerpo de la
		// petición
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		// Agregar el archivo al cuerpo de la petición

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		// Copiar el contenido del objeto MultipartFile al objeto File
		multipartFile.transferTo(file);

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

		HttpEntity responseEntity = response.getEntity();

		InputStream responseInputStream = responseEntity.getContent();

		byte[] imageBytes = responseInputStream.readAllBytes();

		// Cerrar el objeto CloseableHttpClient y liberar los recursos
		httpClient.close();

		file.delete();

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);
	}

	@PostMapping(value = "/getSubPopulations", consumes = "multipart/form-data")
	public ResponseEntity<?> getSubPopulations(@RequestParam("nClustersAglomerativo") String nClustersAglomerativo,
			@RequestParam("nClustersKModes") String nClustersKModes, @RequestPart("file") MultipartFile multipartFile)
			throws IOException {

		String error = this.validarInputNumber(nClustersAglomerativo, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		error = this.validarInputNumber(nClustersKModes, 2, 20);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		// Verificar el tipo de contenido del archivo
		error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "clustering/getSubpopulations?n_agglomerative="
				+ Integer.parseInt(nClustersAglomerativo) + "&n_kmodes=" + Integer.parseInt(nClustersKModes));

		// Crear un objeto MultipartEntityBuilder para construir el cuerpo de la
		// petición
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		// Agregar el archivo al cuerpo de la petición

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		// Copiar el contenido del objeto MultipartFile al objeto File
		multipartFile.transferTo(file);

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

		HttpEntity responseEntity = response.getEntity();

		byte[] csvBytes = responseEntity.getContent().readAllBytes();

		file.delete();

		// Devuelve la respuesta con el archivo adjunto.
		return new ResponseEntity<>(csvBytes, HttpStatus.OK);
	}

	@PostMapping(value = "/getVarianceMetrics", consumes = "multipart/form-data")
	public ResponseEntity<?> getVarianceMetrics(@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException, JSONException {

		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "clustering/getVarianceMetrics");

		// Crear un objeto MultipartEntityBuilder para construir el cuerpo de la
		// petición
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		// Agregar el archivo al cuerpo de la petición

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		// Copiar el contenido del objeto MultipartFile al objeto File
		multipartFile.transferTo(file);

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

		HttpEntity responseEntity = response.getEntity();
		InputStream responseInputStream = responseEntity.getContent();

		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(responseInputStream));
		String line;
		StringBuffer res = new StringBuffer();
		while ((line = bufferedReader.readLine()) != null) {
			res.append(line);
		}
		String aux = res.substring(1, res.length() - 1);
		aux = aux.replaceAll("'", "\"");

		List<Map<String, Object>> map = null;
		map = new ObjectMapper().readValue(aux, List.class);

		file.delete();

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	@GetMapping("/getDescripcionesPredicciones")
	public ResponseEntity<?> getDescripcionesPredicciones() {
		return new ResponseEntity<>(prediccionesService.getDescripciones(), HttpStatus.OK);
	}

	@PostMapping("/createOrUpdatePrediction")
	public ResponseEntity<?> createOrFindPrediction(@RequestParam("crearPrediccion") boolean crearPrediccion, 
			@RequestParam("descripcion") String descripcion)
			throws UnsupportedEncodingException {
		
		
		if(descripcion==null || descripcion.isEmpty()) {
			String errorDescripcionVacía = "";
			
			if(crearPrediccion) {
				errorDescripcionVacía = "Por favor, escriba un nombre para la predicción";
			}
			else {
				errorDescripcionVacía = "Por favor, escoja una de las predicciones de la lista";
			}
			return new ResponseEntity<>(errorDescripcionVacía,
					HttpStatus.BAD_REQUEST);
		}

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcion);
			
		if(crearPrediccion) {
			
			if(prediccion==null) {

				prediccion = prediccionesService.guardarPrediccion(descripcion);

				if (!this.crearCarpetaPrediccion(prediccion)) {
					return new ResponseEntity<>("El sistema de gestión de archivos ha fallado",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}

				return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
			}
			else {
				return new ResponseEntity<>("El nombre de esa prediccion ya está cogido", HttpStatus.BAD_REQUEST);
			}
		}
		else {
			if(prediccion!=null) {
				if (!this.crearCarpetaPrediccion(prediccion)) {
					return new ResponseEntity<>("El sistema de gestión de archivos ha fallado",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}

				return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
			}
			else {
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

//	@PostMapping(value = "/createAllSurvivalCurves", consumes = "multipart/form-data")
//	public ResponseEntity<?> createAllSurvivalCurves(@RequestParam("idPrediccion") String idPrediccion,
//			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {
//
//		idPrediccion = StringEscapeUtils.escapeJava(idPrediccion);
//
//		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));
//
//		String error = this.validarInputFile(multipartFile);
//		if (!error.isEmpty()) {
//			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
//		}
//
//		CloseableHttpClient httpClient = HttpClients.createDefault();
//
//		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
//		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/createAllSurvivalCurves");
//
//		// Crear un objeto MultipartEntityBuilder para construir el cuerpo de la
//		// petición
//		MultipartEntityBuilder builder = MultipartEntityBuilder.create();
//
//		// Agregar el archivo al cuerpo de la petición
//
//		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());
//
//		// Copiar el contenido del objeto MultipartFile al objeto File
//		multipartFile.transferTo(file);
//
//		builder.addBinaryBody("file", // Nombre del parámetro en el servidor
//				file, // Archivo a enviar
//				ContentType.APPLICATION_OCTET_STREAM, // Tipo de contenido del archivo
//				file.getName() // Nombre del archivo en el cuerpo de la petición
//		);
//
//		// Construir el cuerpo de la petición
//		HttpEntity multipart = builder.build();
//
//		// Establecer el cuerpo de la petición en el objeto HttpPost
//		httpPost.setEntity(multipart);
//
//		// Ejecutar la petición y obtener la respuesta
//		CloseableHttpResponse response = httpClient.execute(httpPost);
//
//		HttpEntity responseEntity = response.getEntity();
//
//		InputStream responseInputStream = responseEntity.getContent();
//
//		byte[] imageBytes = responseInputStream.readAllBytes();
//
//		// Cerrar el objeto CloseableHttpClient y liberar los recursos
//		httpClient.close();
//
//
//		file.delete();
//
//		return new ResponseEntity<>(imageBytes, HttpStatus.OK);
//
//	}

	@PostMapping(value = "/createPopulationAndCurves", consumes = "multipart/form-data")
	public ResponseEntity<?> createPopulationProfile(@RequestParam("idPrediccion") String idPrediccion,
			@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException, ClassNotFoundException {
	
		idPrediccion = StringEscapeUtils.escapeJava(idPrediccion);

		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));
		
		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		multipartFile.transferTo(file);
		
		this.guardarFeatures(file, "survivalAndProfiling/createPopulationProfile", -1, prediccion.getId());
		
		for (int i = 0; i < prediccion.getMaxClusters(); i++) {
			this.guardarFeatures(file,
					"survivalAndProfiling/createClusterProfile?cluster_number=" + Integer.toString(i), i, prediccion.getId());
		}
		
		String rutaPrediccion = rutaImagenesClusters + File.separator + "prediccion" + prediccion.getId();

		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves", rutaPrediccion + File.separator + "allClusters.png",
				"/clustersImages/prediccion" + prediccion.getId() + "/allClusters.png", -1, prediccion.getId());
		for (int i = 0; i < prediccion.getMaxClusters(); i++) {
			this.guardarImagenes(file,
					"survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i),
					rutaPrediccion + File.separator +"cluster" + Integer.toString(i) + ".png",
					"/clustersImages/prediccion" + prediccion.getId() + "/cluster" + Integer.toString(i) + ".png", i,
					prediccion.getId());
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


		Imagenes imagen = imagenesService.findClusterImage(Integer.parseInt(clusterNumber), Long.parseLong(idPrediccion));

		if(imagen!=null) {
			return new ResponseEntity<>(imagen.getRuta(), HttpStatus.OK);
		}
		else{
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
		
		Profiles profile = profilesService.findClusterProfile(Integer.parseInt(clusterNumber), Long.parseLong(idPrediccion));
			
		if(profile!=null) {
			HashMap<String, Object> map = null;
			map = new ObjectMapper().readValue(profile.getFeatures(), HashMap.class);
		
			return new ResponseEntity<>(map, HttpStatus.OK);
		}
		else {
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

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/getModelPerformance");

		// Crear un objeto MultipartEntityBuilder para construir el cuerpo de la
		// petición
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		// Agregar el archivo al cuerpo de la petición

		File file = File.createTempFile("tempfile", multipartFile.getOriginalFilename());

		// Copiar el contenido del objeto MultipartFile al objeto File
		multipartFile.transferTo(file);

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

		HttpEntity responseEntity = response.getEntity();

		InputStream responseInputStream = responseEntity.getContent();

		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(responseInputStream));
		String line;
		StringBuilder stringBuilder = new StringBuilder();
		while ((line = bufferedReader.readLine()) != null) {
			stringBuilder.append(line);
		}
		String jsonString = stringBuilder.toString();

		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(jsonString, HashMap.class);

		file.delete();

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	private void guardarImagenes(File file, String url, String rutaImagenServidor, String rutaImagenBDD, Integer numCluster,
			Long idPrediccion) throws IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();

		HttpPost httpPost = new HttpPost(UrlServidor + url);
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

		HttpEntity responseEntity = response.getEntity();

		InputStream responseInputStream = responseEntity.getContent();

		byte[] imageBytes = responseInputStream.readAllBytes();

		FileOutputStream imgOutFile = new FileOutputStream(rutaImagenServidor);
		imgOutFile.write(imageBytes);
		imgOutFile.close();

		httpClient.close();

		imagenesService.guardarImagen(numCluster, rutaImagenBDD, idPrediccion);

	}

	private void guardarFeatures(File file, String url, Integer numCluster, Long idPrediccion) throws ClientProtocolException, IOException {
		CloseableHttpClient httpClient = HttpClients.createDefault();

		HttpPost httpPost = new HttpPost(UrlServidor + url);
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

		HttpEntity responseEntity = response.getEntity();

		InputStream responseInputStream = responseEntity.getContent();

		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(responseInputStream));
		String line;
		StringBuilder stringBuilder = new StringBuilder();
		while ((line = bufferedReader.readLine()) != null) {
			stringBuilder.append(line);
		}
		String jsonString = stringBuilder.toString();

		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(jsonString, HashMap.class);
		
		if(numCluster==-1){
			this.calculateMaxClusters(map, idPrediccion);
		}

		Gson gson = new Gson();
		String featuresString = gson.toJson(map);

		profilesService.guardarProfile(numCluster, featuresString,idPrediccion);

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
			return "Por favor escoja un número de cluster";

		}
		try {
			Integer n = Integer.parseInt(numClusters);
			if (n < minClusters || n >= maxClusters) {
				return "El valor no está dentro del rango permitido";
			}
		} catch (NumberFormatException e) {
			return "El valor introducido no es válido";

		}
		return "";
	}

	private String validarInputFile(MultipartFile multipartFile) {
		String contentType = multipartFile.getContentType();
		if (!contentType.equals("text/csv")) {
			return "El tipo de archivo no es válido, seleccion un archivo con extensión .csv";
		}
		return "";
	}
}