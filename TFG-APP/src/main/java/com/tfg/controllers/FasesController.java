package com.tfg.controllers;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.imageio.ImageIO;

import jakarta.validation.Valid;

import org.apache.tomcat.util.json.JSONParser;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.commons.codec.binary.Base64;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;
import com.tfg.services.IMedicosService;

@RestController
@RequestMapping("/fases")
public class FasesController {

	@Autowired
	private IMedicosService medicosService;

	@GetMapping("/getMedicos")
	public List<MedicosDto> getMedicos() {
		List<MedicosDto> medicos = medicosService.findAllMedicos();
		return medicos;
	}

	@GetMapping("/getHelloApi")
	public ResponseEntity<HashMap<String, Object>> getHelloApi() {
		String url = "https://pokeapi.co/api/v2/pokemon/ditto";
		HashMap<String, Object> map = null;
		try {
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String line;
			StringBuilder stringBuilder = new StringBuilder();
			while ((line = bufferedReader.readLine()) != null) {
				stringBuilder.append(line);
			}
			String jsonString = stringBuilder.toString();

			map = new ObjectMapper().readValue(jsonString, HashMap.class);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return new ResponseEntity<>(map, HttpStatus.OK);
	}

	@PostMapping(value = "/getNClusters", consumes = "multipart/form-data")
	public void getNClusters(@RequestPart("max_clusters") String max_clusters,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(
				"https://df33-83-61-234-144.eu.ngrok.io/clustering/getOptimalNClusters?max_clusters="
						+ Integer.parseInt(max_clusters));

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
		FileOutputStream imgOutFile = new FileOutputStream(System.getProperty("user.dir") + "\\src\\main\\resources\\images\\imagen.png");
		imgOutFile.write(imageBytes);
		imgOutFile.close();

//			 byte[] bytesImagen = Base64.getDecoder().decode(imageString);
//
//	        // Crear un objeto ByteArrayInputStream a partir del array de bytes
//	        ByteArrayInputStream inputStream = new ByteArrayInputStream(bytesImagen);
//
//	        // Leer la imagen desde el objeto ByteArrayInputStream y crear un objeto BufferedImage
//	        BufferedImage imagen = ImageIO.read(inputStream);
//	        
//	        File archivoImagen = new File("C:\\Users\\omola\\OneDrive\\Documentos\\imagen.jpg");
//	        
//	        ImageIO.write(imagen, "jpg", archivoImagen);

		// Manejar la respuesta
		// ...

		// Cerrar el objeto CloseableHttpClient y liberar los recursos
		httpClient.close();

		
	}

}
