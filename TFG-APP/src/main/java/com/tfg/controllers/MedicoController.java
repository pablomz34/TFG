package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.text.StringEscapeUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPacientesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;

@Controller
@RequestMapping("/medico")
public class MedicoController {

	static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";
	static final String UrlMock = "http://localhost:8090/";

	@Autowired
	private IPrediccionesService prediccionesService;

	@Autowired
	private IProfilesService profilesService;

	@Autowired
	private IImagenesService imagenesService;

	@Autowired
	private IPacientesService pacientesService;

	@GetMapping("/herramientaPredictiva")
	public String herramientaPredictiva() {
		return "herramientaPredictiva";
	}

	@PostMapping(value = "/getNewPatientClassification", consumes = "application/json")
	public ResponseEntity<?> getNewPatientClassification(@RequestParam("idPrediccion") String idPrediccion,
			@RequestBody HashMap<String, Object> json)
			throws IllegalStateException, IOException, ClassNotFoundException {

		String error = validarJson(json, Long.parseLong(idPrediccion));

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlMock + "survivalAndProfiling/getNewPatientClassification");

		// Serializar el HashMap a formato JSON
		Gson gson = new Gson();

		String jsonString = gson.toJson(json);

		StringEntity stringEntity = new StringEntity(jsonString, ContentType.APPLICATION_JSON);

		// Establecer el cuerpo de la petición en el objeto HttpPost
		httpPost.setEntity(stringEntity);

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
		String responseJsonString = stringBuilder.toString();

		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(responseJsonString, HashMap.class);

		Integer numCluster = (Integer) map.get("Cluster");

		idPrediccion = StringEscapeUtils.escapeJava(idPrediccion);

		String rutaImagen = imagenesService.findClusterImage(numCluster, Long.parseLong(idPrediccion)).getRuta();

		Profiles profile = profilesService.findClusterProfile(numCluster, Long.parseLong(idPrediccion));

		HashMap<String, Object> featuresMap = new ObjectMapper().readValue(profile.getFeatures(), HashMap.class);

		HashMap<String, Object> responseMap = new HashMap<String, Object>();

		responseMap.put("numCluster", numCluster);

		responseMap.put("rutaImagen", rutaImagen);

		responseMap.put("clusterData", featuresMap);

		return new ResponseEntity<>(responseMap, HttpStatus.OK);

	}

	private String validarJson(HashMap<String, Object> json, Long idPrediccion)
			throws JsonMappingException, JsonProcessingException {

		String s = profilesService.findFeaturesAllClusters(idPrediccion);

		HashMap<String, Object> featuresBDDMap = null;
		featuresBDDMap = new ObjectMapper().readValue(s, HashMap.class);

		List<HashMap<String, Object>> featuresList = (List<HashMap<String, Object>>) featuresBDDMap.get("features");

		featuresList.remove(0);

		for (HashMap<String, Object> feature : featuresList) {

			String featureName = (String) feature.get("feature");
			List<HashMap<String, Object>> featureValues = (List<HashMap<String, Object>>) feature.get(featureName);
			String jsonFeatureValue = (String) json.get(featureName);

			if (jsonFeatureValue == null || jsonFeatureValue.isEmpty()) {
				return "Por favor, rellene el campo " + featureName;
			}

			Set<String> allFeatureValuesKeys = featureValues.stream().flatMap(hashMap -> hashMap.keySet().stream())
					.collect(Collectors.toSet());

			if (!allFeatureValuesKeys.contains(jsonFeatureValue)) {
				return "Por favor, elija una de las opciones válidas para el campo " + featureName;
			}

		}

		return "";

	}

	@GetMapping("/getFeatures")
	public ResponseEntity<?> getFeatures(@RequestParam("idPrediccion") String idPrediccion)
			throws IllegalStateException, IOException {

		String features = profilesService.findFeaturesAllClusters(Long.parseLong(idPrediccion));

		if (features == "") {
			return new ResponseEntity<>("No hay datos asignados a esta prediccion", HttpStatus.BAD_REQUEST);
		}

		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(features, HashMap.class);

		HashMap<String, Object> featuresMap = new HashMap<String, Object>();

		featuresMap.put("features", map.get("features"));

		return new ResponseEntity<>(featuresMap, HttpStatus.OK);

	}

	@GetMapping("/getIdPrediccion")
	public ResponseEntity<?> getIdPrediccion(@RequestParam("descripcionPrediccion") String descripcionPrediccion) {

		if (descripcionPrediccion == null || descripcionPrediccion.isEmpty()) {
			String errorDescripcionVacía = "";
			errorDescripcionVacía = "Por favor, seleccione una predicción";
			return new ResponseEntity<>(errorDescripcionVacía, HttpStatus.BAD_REQUEST);
		}

		descripcionPrediccion = StringEscapeUtils.escapeJava(descripcionPrediccion);

		Predicciones prediccion = prediccionesService.findPrediccionByDescripcion(descripcionPrediccion);

		if (prediccion != null) {
			return new ResponseEntity<>(prediccion.getId(), HttpStatus.OK);
		} else {
			return new ResponseEntity<>("La predicción seleccionada no es válida", HttpStatus.BAD_REQUEST);
		}

	}

	@GetMapping("/getDescripcionesPredicciones")
	public ResponseEntity<?> getDescripcionesPredicciones() {
		return new ResponseEntity<>(prediccionesService.getDescripciones(), HttpStatus.OK);
	}

	@PostMapping("/addPacienteBBDD")
	public ResponseEntity<?> addPacienteBBDD(@RequestParam("idPrediccion") String idPrediccion,
			@RequestBody HashMap<String, Object> json) {
		String error = validarInputNumber(json.get("variableObjetivo").toString());

		if (!error.isEmpty()) {
			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
		}

		String variables = json.get("variables").toString().replace(">=", "GET").replace("<=", "LET").replace(">", "GT")
				.replace("<", "LT").replace(" ", "");
		Integer l = (variables.length() - 1);
		variables = variables.substring(1, l);
		String variableObjetivo = json.get("variableObjetivo").toString();

		if (pacientesService.addPaciente(variables, variableObjetivo, Long.parseLong(idPrediccion))) {
			return new ResponseEntity<>("Paciente añadido de forma satisfactoria", HttpStatus.OK);
		} else {
			return new ResponseEntity<>("Ocurrió un error al añadir al paciente", HttpStatus.BAD_REQUEST);
		}

	}

	private String validarInputNumber(String numClusters) {

		if (numClusters == null || numClusters.isEmpty()) {
			return "Por favor, introduzca una cantidad";
		}
		try {
			if (Integer.parseInt(numClusters) <= 0) {
				return "Por favor, escoja un valor mayor que 0";
			}
		} catch (NumberFormatException e) {
			return "Por favor, introduzca un valor válido";

		}
		return "";
	}

}
