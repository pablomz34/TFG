package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.tfg.services.IImagenesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

@RestController
@RequestMapping("/admin/fases")
public class FasesController {

	static final String UrlServidor = "https://531e-83-61-231-12.ngrok-free.app/";

	@Autowired
	private IUsuariosService usuariosService;

	@Autowired
	private IImagenesService imagenesService;

	@Autowired
	private IProfilesService profilesService;


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
			mensaje = "El archivo es obligatorio";
		} else {
			mensaje = "Ocurrió un error en el servidor: " + ex.getMessage();
		}

		return ResponseEntity.status(status).body(mensaje);
	}

	@PostMapping(value = "/getNClusters", consumes = "multipart/form-data")
	public ResponseEntity<?> getNClusters(@RequestParam("max_clusters") String max_clusters,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {
		
		String error = this.validarInputNumber(max_clusters);
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

		String error = this.validarInputNumber(nClustersAglomerativo);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		error = this.validarInputNumber(nClustersKModes);
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

	@PostMapping(value = "/createAllSurvivalCurves", consumes = "multipart/form-data")
	public ResponseEntity<?> createAllSurvivalCurves(@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException {

		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/createAllSurvivalCurves");

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

		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves",
				"\\src\\main\\resources\\static\\clustersImages\\allClusters.png", "clustersImages/allClusters.png",
				-1);
		for (int i = 0; i < 8; i++) {
			this.guardarImagenes(file,
					"survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i),
					"\\src\\main\\resources\\static\\clustersImages\\cluster" + Integer.toString(i) + ".png",
					"clustersImages/cluster" + Integer.toString(i) + ".png", i);
		}

		file.delete();

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);

	}

	@PostMapping(value = "/createPopulationProfile", consumes = "multipart/form-data")
	public ResponseEntity<?> createPopulationProfile(@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException, ClassNotFoundException {

		String error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/createPopulationProfile");

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

		this.guardarFeatures(file, "survivalAndProfiling/createPopulationProfile");

		file.delete();

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	@PostMapping(value = "/createClusterSurvivalCurve", consumes = "multipart/form-data")
	public ResponseEntity<?> createClusterSurvivalCurve(@RequestParam("cluster_number") String cluster_number,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

		String error = this.validarInputNumber(cluster_number);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/createClusterSurvivalCurve?cluster_number="
				+ Integer.parseInt(cluster_number));

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

		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves",
				"\\src\\main\\resources\\static\\clustersImages\\allClusters.png", "clustersImages/allClusters.png",
				-1);
		for (int i = 0; i < 8; i++) {
			this.guardarImagenes(file,
					"survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i),
					"\\src\\main\\resources\\static\\clustersImages\\cluster" + Integer.toString(i) + ".png",
					"clustersImages/cluster" + Integer.toString(i) + ".png", i);
		}

		file.delete();

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);

	}

	@PostMapping(value = "/createClusterProfile", consumes = "multipart/form-data")
	public ResponseEntity<?> createClusterProfile(@RequestParam("cluster_number") String cluster_number,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

		String error = this.validarInputNumber(cluster_number);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}
		error = this.validarInputFile(multipartFile);
		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/createClusterProfile?cluster_number="
				+ Integer.parseInt(cluster_number));

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

		this.guardarFeatures(file, "survivalAndProfiling/createPopulationProfile");

		file.delete();

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	@PostMapping(value = "/getModelPerformance", consumes = "multipart/form-data")
	public ResponseEntity<?> createClusterSurvivalCurve(@RequestPart("file") MultipartFile multipartFile)
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

	private void guardarImagenes(File file, String url, String rutaImagenServidor, String rutaImagenBDD, int numCluster)
			throws IOException {

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

		FileOutputStream imgOutFile = new FileOutputStream(System.getProperty("user.dir") + rutaImagenServidor);
		imgOutFile.write(imageBytes);
		imgOutFile.close();

		httpClient.close();

		imagenesService.guardarImagen(numCluster, rutaImagenBDD);

	}

	private void guardarFeatures(File file, String url) throws ClientProtocolException, IOException {
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

		int maxClusters = getMaxClusters(map);

		HashMap<String, Object> featuresMap = new HashMap<String, Object>();

		featuresMap.put("features", map.get("features"));

		Gson gson = new Gson();
		String featuresString = gson.toJson(featuresMap);

		profilesService.guardarProfile(featuresString, maxClusters);

	}

	private int getMaxClusters(HashMap<String, Object> map) {

		List<HashMap<String, Object>> features = (List<HashMap<String, Object>>) map.get("features");

		HashMap<String, Object> agglomerativeMap = features.get(0);

		List<HashMap<String, Object>> agglomerativeValues = (List<HashMap<String, Object>>) agglomerativeMap.get("agglomerative");

		return agglomerativeValues.size();

	}

	private String validarInputNumber(String max_clusters) {

		if (max_clusters == null || max_clusters.isEmpty()) {
			return "Es obligatorio rellenar todos los inputs";

		}
		try {
			int n = Integer.parseInt(max_clusters);
			if (n < 1 || n > 8) {
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
			return "El tipo de archivo no es válido";
		}
		return "";
	}
}