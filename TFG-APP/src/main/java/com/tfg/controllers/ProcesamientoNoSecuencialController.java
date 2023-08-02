package com.tfg.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tfg.services.IAlgoritmosClusteringService;
import com.tfg.services.IHeadersPacientesService;
import com.tfg.services.IImagenesService;
import com.tfg.services.IPacientesService;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IProfilesService;
import com.tfg.services.IUsuariosService;

@Controller
@RequestMapping("/admin/procesamientoNoSecuencial")
public class ProcesamientoNoSecuencialController {

	
	static final String UrlServidor = "https://1dd6-83-61-231-12.ngrok-free.app/";
	static final String UrlMock = "http://localhost:8090/";

	@Autowired
	private IUsuariosService usuariosService;

	@Autowired
	private IImagenesService imagenesService;

	@Autowired
	private IProfilesService profilesService;

	@Autowired
	private IPrediccionesService prediccionesService;

	@Autowired
	private IPacientesService pacientesService;

	@Autowired
	private IHeadersPacientesService headersPacientesService;

	@Autowired
	private IAlgoritmosClusteringService algoritmosClusteringService;

	@Value("${myapp.imagenesClusters.ruta}")
	private String rutaImagenesClusters;
	
	
	@GetMapping("/fases")
	public String index(){
		return "index";
	}
	
	
}
