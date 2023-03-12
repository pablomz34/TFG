package com.tfg.controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import jakarta.validation.Valid;

import org.apache.tomcat.util.json.JSONParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

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
	public List<MedicosDto> getMedicos(){
		List<MedicosDto> medicos = medicosService.findAllMedicos();
        return medicos;
	}
	
	@GetMapping("/getHelloApi")
	public ResponseEntity<HashMap<String, Object>> getHelloApi() {
		String url = "https://pokeapi.co/api/v2/pokemon/ditto";
		HashMap<String,Object> map = null;
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

}
