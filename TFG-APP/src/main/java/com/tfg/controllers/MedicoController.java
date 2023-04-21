package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Profiles;
import com.tfg.services.IImagenesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/medico")
public class MedicoController {

	static final String UrlServidor = "https://50f5-81-41-173-74.ngrok-free.app/";
	
	@Autowired
	private IUsuariosService usuariosService;
	
	@Autowired
	private HttpSession session;
	
	@Autowired
	private IProfilesService profilesService;
	
	@Autowired
	private IImagenesService imagenesService;
	
	@GetMapping
	public String indexMedico() {
		return "index_medico";
	}
	
	@PostMapping(value="/getNewPatientClassification", consumes="application/json")
	public ResponseEntity<String> getNewPatientClassification(
			@RequestBody HashMap<String, Object> json)
			throws IllegalStateException, IOException, ClassNotFoundException {

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(UrlServidor + "survivalAndProfiling/getNewPatientClassification");

		ObjectMapper objectMapper = new ObjectMapper();
		String jsonString = objectMapper.writeValueAsString(json);
		
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
		
		System.out.println(cluster);
		String rutaImagen = imagenesService.findClusterImage(cluster).getRuta();
		
		return new ResponseEntity<>(rutaImagen, HttpStatus.OK);

	}
	
	
	@GetMapping("/getFeatures")
	public ResponseEntity<HashMap<String, Object>> getFeatures()
			throws IllegalStateException, IOException {

		Profiles p = profilesService.findProfile();
		
		HashMap<String, Object> map = null;
		map = new ObjectMapper().readValue(p.getFeatures(), HashMap.class);

		return new ResponseEntity<>(map, HttpStatus.OK);

	}
	
}
