package com.tfg.controllers;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import javax.imageio.ImageIO;

import jakarta.validation.Valid;

import org.apache.tomcat.util.json.JSONParser;
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
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.commons.codec.binary.Base64;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.exceptions.CsvValidationException;
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
	public ResponseEntity<byte[]> getNClusters(@RequestPart("max_clusters") String max_clusters,
			@RequestPart("file") MultipartFile multipartFile) throws IllegalStateException, IOException {

		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(
				"https://5665-81-41-170-93.eu.ngrok.io/clustering/getOptimalNClusters?max_clusters="
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

		// Cerrar el objeto CloseableHttpClient y liberar los recursos
		httpClient.close();
		
		return new ResponseEntity<>(imageBytes, HttpStatus.OK);

		
	}
	
	@PostMapping(value = "/getSubPopulations", consumes = "multipart/form-data")
	public ResponseEntity<byte[]> getSubPopulations(@RequestPart("nClusteresAglomerativo") String nClusteresAglomerativo,
			@RequestPart("nClusteresKModes") String nClusteresKModes,
			@RequestPart("file") MultipartFile multipartFile) throws IOException, CsvValidationException {
		
		CloseableHttpClient httpClient = HttpClients.createDefault();

		// Crear un objeto HttpPost con la URL a la que se va a enviar la petición
		HttpPost httpPost = new HttpPost(
				"https://5665-81-41-170-93.eu.ngrok.io/clustering/getSubpopulations?n_agglomerative="
						+ Integer.parseInt(nClusteresAglomerativo) + "&n_kmodes=" + Integer.parseInt(nClusteresKModes));

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
		
//		Reader reader = new InputStreamReader(responseEntity.getContent());
//
//        // Create a CSVReader to read the CSV data
//        CSVReader csvReader = new CSVReaderBuilder(reader)
//                                .build();
//
//    	
//        // Create a Writer to write the CSV data to a file
//    	
//        Writer writer = new FileWriter(csvFile);
//
//
//        CSVWriter csvWriter = new CSVWriter(writer);
//
//        // Write the data rows
//        String[] nextLine;
//        while ((nextLine = csvReader.readNext()) != null) {
//            csvWriter.writeNext(nextLine);
//        }
//
//        // Close the CSVWriter and Writer objects
//        csvWriter.close();
//        writer.close();
//
//        // Close the CSVReader and Reader objects
//        csvReader.close();
//        reader.close();
		File csvFile = new File("C:\\Users\\omola\\OneDrive\\Documentos\\OptimalNClusters_250.csv");
		Path path = Paths.get(csvFile.getAbsolutePath());
        byte[] csvBytes = Files.readAllBytes(path);
		
        // Devuelve la respuesta con el archivo adjunto.
        return new ResponseEntity<>(csvBytes, HttpStatus.OK);
	}
	
	
	

}
