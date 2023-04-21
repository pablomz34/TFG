package com.tfg.controllers;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.lang.reflect.Type;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Array;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.imageio.ImageIO;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.apache.tomcat.util.json.JSONParser;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.apache.commons.codec.binary.Base64;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Profiles;
import com.tfg.services.IImagenesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

@RestController
@RequestMapping("/admin/fases")
public class FasesController {

	static final String UrlServidor = "https://de22-81-41-173-74.ngrok-free.app/";

	@Autowired
	private IUsuariosService usuariosService;
	
	@Autowired
	private IImagenesService imagenesService;
	
	@Autowired
	private IProfilesService profilesService;

	@Autowired
	private HttpSession session;

	@GetMapping("/getMedicos")
	public List<UsuariosDto> getMedicos() {
		List<UsuariosDto> medicos = usuariosService.findAllMedicos();
		return medicos;
	}

	@PostMapping(value = "/getNClusters", consumes = "multipart/form-data")
	public ResponseEntity<byte[]> getNClusters(@RequestPart("max_clusters") String max_clusters,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

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
	public ResponseEntity<byte[]> getSubPopulations(@RequestPart("nClustersAglomerativo") String nClustersAglomerativo,
			@RequestPart("nClustersKModes") String nClustersKModes, @RequestPart("file") MultipartFile multipartFile)
			throws IOException {

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
	public ResponseEntity<List<Map<String, Object>>> getVarianceMetrics(
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException, JSONException {

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
	public ResponseEntity<byte[]> createAllSurvivalCurves(@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException {

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
		
		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves", "\\src\\main\\resources\\static\\clustersImages\\allClusters.png", -1);
		for(int i=0; i<8; i++) {
			this.guardarImagenes(file, "survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i), "\\src\\main\\resources\\static\\clustersImages\\cluster" + Integer.toString(i) + ".png", i);
		}
		
		file.delete();
		
		return new ResponseEntity<>(imageBytes, HttpStatus.OK);

	}

	@PostMapping(value = "/createPopulationProfile", consumes = "multipart/form-data")
	public ResponseEntity<HashMap<String, Object>> createPopulationProfile(
			@RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException, ClassNotFoundException {

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
		
		file.delete();

		return new ResponseEntity<>(map, HttpStatus.OK);

	}
	
	@PostMapping(value = "/createClusterSurvivalCurve", consumes = "multipart/form-data")
	public ResponseEntity<byte[]> createClusterSurvivalCurve(@RequestPart("cluster_number") String cluster_number,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

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
		
				
		this.guardarImagenes(file, "survivalAndProfiling/createAllSurvivalCurves", "\\src\\main\\resources\\static\\clustersImages\\allClusters.png", -1);
		for(int i=0; i<8; i++) {
			this.guardarImagenes(file, "survivalAndProfiling/createClusterSurvivalCurve?cluster_number=" + Integer.toString(i), "\\src\\main\\resources\\static\\clustersImages\\cluster" + Integer.toString(i) + ".png", i);
		}
		
		file.delete();

		return new ResponseEntity<>(imageBytes, HttpStatus.OK);

	}

	@PostMapping(value = "/createClusterProfile", consumes = "multipart/form-data")
	public ResponseEntity<HashMap<String, Object>> createClusterProfile(
			@RequestPart("cluster_number") String cluster_number, @RequestPart("file") MultipartFile multipartFile)
			throws IllegalStateException, IOException {

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
		
		file.delete();

		return new ResponseEntity<>(map, HttpStatus.OK);

	}

	

	@PostMapping(value = "/getModelPerformance", consumes = "multipart/form-data")
	public ResponseEntity<HashMap<String, Object>> createClusterSurvivalCurve(
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

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
	
	
	private void guardarImagenes(File file, String url, String rutaServidor, Integer numCluster) throws IOException {
		
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
		
        FileOutputStream imgOutFile = new FileOutputStream(System.getProperty("user.dir") + rutaServidor);
        imgOutFile.write(imageBytes);
        imgOutFile.close();
        
        httpClient.close();
        
        imagenesService.guardarImagen(numCluster, "clustersImages/allClusters.png");
		
	}
	
	@GetMapping("/getHello")
	public String getHello() throws JsonMappingException, JsonProcessingException {
		
		String jsonString = "{\"id_prediction\":1,\"number_of_variables\":8,\"number_of_observations\":199,\"target_median\":6.850243331,\"target_third_quantile\":9.035093123,\"features\":[{\"feature\":\"agglomerative\",\"agglomerative\":[{\"0\":56},{\"1\":20},{\"7\":19},{\"3\":21},{\"4\":25},{\"6\":13},{\"5\":6},{\"2\":39}]},{\"feature\":\"GENDER\",\"GENDER\":[{\"F\":101},{\"M\":98}]},{\"feature\":\"EDUCATION\",\"EDUCATION\":[{\"ML\":80},{\"ME\":43},{\"UNK\":29},{\"LO\":27},{\"MH\":11},{\"HI\":9}]},{\"feature\":\"ETHCAT\",\"ETHCAT\":[{\"BLA\":83},{\"WHI\":53},{\"OTH\":18},{\"HIS\":45}]},{\"feature\":\"WORK_INCOME_TCR\",\"WORK_INCOME_TCR\":[{\"U\":29},{\"N\":143},{\"Y\":27}]},{\"feature\":\"PRI_PAYMENT_TCR_KI\",\"PRI_PAYMENT_TCR_KI\":[{\"MC\":122},{\"MA\":20},{\"PI\":53},{\"OT\":4}]},{\"feature\":\"AGE_RANGE\",\"AGE_RANGE\":[{\"<60\":112},{\"<40\":25},{\">=60\":62}]}]}";
		
		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(jsonString, HashMap.class);
		
		int maxClusters = getMaxClusters(map);
	
		HashMap<String, Object> featuresMap = new HashMap<String, Object>();
		
		featuresMap.put("features", map.get("features"));
		
		
		
		Gson gson = new Gson();
        String featuresString = gson.toJson(featuresMap);
		
		//System.out.println(features);
		profilesService.guardarProfile(featuresString, maxClusters);

		Profiles p = profilesService.findProfile();
		
		HashMap<String, Object> map3 = null;
		map3 = new ObjectMapper().readValue(p.getFeatures(), HashMap.class);
		
		return "getHello";
	}
	
	
	private int getMaxClusters(HashMap<String, Object> map) {
		
		List<HashMap<String, Object>> features = (List<HashMap<String, Object>>) map.get("features");
		
		HashMap<String, Object> agglomerativeMap = features.get(0);
		
		List<HashMap<String, Object>> agglomerativeValues = (List<HashMap<String, Object>>) agglomerativeMap.get("agglomerative");
		
		return agglomerativeValues.size();
		
	}
}