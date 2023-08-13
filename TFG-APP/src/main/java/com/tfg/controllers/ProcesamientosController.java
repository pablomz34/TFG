package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.tfg.entities.AlgoritmosClustering;
import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;

import jakarta.servlet.http.HttpSession;

@RequestMapping("/admin/procesamientos")
public abstract class ProcesamientosController {

	protected static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";
	protected static final String UrlMock = "http://localhost:8090/";

	@Autowired
	protected HttpSession session;
	
	@Autowired
	protected IImagenesService imagenesService;

	@Autowired
	protected IProfilesService profilesService;

	@Autowired
	protected IPrediccionesService prediccionesService;

	@Autowired
	protected IAlgoritmosClusteringService algoritmosClusteringService;

	@Value("${myapp.imagenesClusters.ruta}")
	protected String rutaImagenesClusters;
	
	@Value("${myapp.rutasSecuenciales}")
	protected List<String> rutasSecuenciales;

	protected InputStream llamadaServidorNgrok(String url, File file, CloseableHttpClient httpClient)
			throws IOException {

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

	@GetMapping("/getAlgoritmosObligatorios")
	public ResponseEntity<?> getAlgoritmosObligatorios() {
		return new ResponseEntity<>(algoritmosClusteringService.findAlgoritmosObligatorios(), HttpStatus.OK);
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

		return new ResponseEntity<>(algoritmosCoincidentes, HttpStatus.OK);
	}

	protected void guardarImagenes(File file, String url, String rutaImagenServidor, String rutaImagenBDD,
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

	protected void guardarFeatures(File file, String url, Integer numCluster, String idPrediccionPoblacion)
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

	protected void calculateMaxClusters(HashMap<String, Object> map, Long idPrediccion) {

		List<HashMap<String, Object>> features = (List<HashMap<String, Object>>) map.get("features");

		HashMap<String, Object> algorithmMap = features.get(0);

		List<HashMap<String, Object>> algorithmArray = (List<HashMap<String, Object>>) algorithmMap
				.get("agglomerative");

		Integer maxClusters = algorithmArray.size();

		prediccionesService.guardarMaxClusters(maxClusters, idPrediccion);

	}

	protected String validarInputNumber(String numClusters, Integer minClusters, Integer maxClusters) {

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

	protected String validarNClustersAlgoritmo(String numClusters, Integer minClusters, Integer maxClusters,
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

	protected String validarInputFile(MultipartFile multipartFile) {

		String contentType = multipartFile.getContentType();
		if (!contentType.equals("text/csv")) {
			return "El tipo de archivo no es válido, seleccione un archivo con extensión .csv";
		}
		
		if (multipartFile.isEmpty() || !this.validarContenidoArchivoEnBlanco(multipartFile)) {
			return "El archivo debe contener datos, no puede estar vacío";
		}
		
		String validarFormatoError = this.validarFormatoArchivoCsv(multipartFile);

		if (!validarFormatoError.isEmpty()) {
			return validarFormatoError;
		}

		return "";
	}

	private boolean validarContenidoArchivoEnBlanco(MultipartFile multipartFile) {

		try {
			BufferedReader reader = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));

			StringBuilder content = new StringBuilder();
			String nextLine;
			while ((nextLine = reader.readLine()) != null) {
				content.append(nextLine).append("\n");
			}

			// Elimina cualquier carácter BOM o contenido en blanco
			String cleanedContent = content.toString().trim();

			return !cleanedContent.isEmpty();

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return false;
	}

	private String validarFormatoArchivoCsv(MultipartFile multipartFile) {

		try {
			BufferedReader reader = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));

			String nextLine = reader.readLine();

			int linesLength = nextLine.split(",").length;
			
			while ((nextLine = reader.readLine()) != null) {

				String[] nextLineSplit = nextLine.split(",");

				if (nextLineSplit.length < 2) {
					return "Los datos deben estar delimitados por comas";
				}
				
				if(linesLength != nextLineSplit.length){
					return "Las filas de los datos del archivo deben tener la misma cantidad de variables separadas por comas";
				}

			}

			return "";

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return "La lectura del archivo salió mal";
	}

}
