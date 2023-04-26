package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.tfg.dto.ImagenesDto;
import com.tfg.entities.Profiles;
import com.tfg.services.IImagenesService;
import com.tfg.services.IProfilesService;

@Controller
@RequestMapping("/medico")
public class MedicoController {

	static final String UrlServidor = "https://91c1-83-61-231-12.ngrok-free.app/";
	
	@Autowired
	private IProfilesService profilesService;
	
	@Autowired
	private IImagenesService imagenesService;
	
	@GetMapping
	public String indexMedico() {
		return "index_medico";
	}
	
	@PostMapping(value="/getNewPatientClassification", consumes="application/json")
	public ResponseEntity<?> getNewPatientClassification(
			@RequestBody HashMap<String, Object> json)
			throws IllegalStateException, IOException, ClassNotFoundException {
		
		//String error = validarJson(json);
		
//		if(!error.isEmpty()) {
//			return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
//		}
		
		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/getNewPatientClassification");

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


		int cluster = (int) map.get("Cluster");
		
		
		String rutaImagen = imagenesService.findClusterImage(cluster).getRuta();
		ImagenesDto imagen = new ImagenesDto();
		imagen.setNCluster(cluster);
		imagen.setRuta(rutaImagen);
		return new ResponseEntity<>(imagen, HttpStatus.OK);

	}
	
//	private String validarJson(HashMap<String, Object> json) throws JsonMappingException, JsonProcessingException {
//		
//		Profiles p = profilesService.findProfile();
//		
//		HashMap<String, Object> featuresBDDMap = null;
//		featuresBDDMap = new ObjectMapper().readValue(p.getFeatures(), HashMap.class);
//		
//		List<HashMap<String, Object>> featuresList = (List<HashMap<String, Object>>) featuresBDDMap.get("features");
//		
//		featuresList.remove(0);
//		
//		for(HashMap<String, Object> feature: featuresList) {
//			
//			String featureName = (String) feature.get("feature");
//			List<HashMap<String, Object>> featureValues = (List<HashMap<String, Object>>) feature.get(featureName);
//			String jsonFeatureValue = (String) json.get(featureName);
//			
//			if(jsonFeatureValue == null || jsonFeatureValue.isEmpty()) {
//				return "El campo " + featureName + " no puedo estar vacío";
//			}
//			
//			Set<String> allFeatureValuesKeys = featureValues.stream()
//                    .flatMap(hashMap -> hashMap.keySet().stream())
//                    .collect(Collectors.toSet());
//			
//			if(!allFeatureValuesKeys.contains(jsonFeatureValue)) {
//				return "Elija una de las opciones válidas para el campo " + featureName;
//			}
//					
//		}
//		
//		return "";
//		
//	}

//	@GetMapping("/getFeatures")
//	public ResponseEntity<HashMap<String, Object>> getFeatures()
//			throws IllegalStateException, IOException {
//
//		Profiles p = profilesService.findProfile();
//		
//		HashMap<String, Object> map = null;
//		map = new ObjectMapper().readValue(p.getFeatures(), HashMap.class);
//
//		return new ResponseEntity<>(map, HttpStatus.OK);
//
//	}
	
}
