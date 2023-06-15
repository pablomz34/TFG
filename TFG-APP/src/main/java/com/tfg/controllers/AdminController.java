package com.tfg.controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Predicciones;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IUsuariosService;

@Controller
@RequestMapping("/admin")
public class AdminController {
		
	
	@Autowired
	private IUsuariosService usuariosService;
	
	@Autowired
	private IPrediccionesService prediccionesService;
	
	@Value("${spring.datasource.url}")
	private String bbddConnectionUrl;
	
	@Value("${spring.datasource.username}")
	private String bbddUser;
	
	@Value("${spring.datasource.password}")
	private String bbddPassword;
	
	
	@GetMapping()
	public String adminIndex() {
		return "index";
	}
	
	@GetMapping("/medicosRegistrados")
    public String users(Model model){
        List<UsuariosDto> medicos = usuariosService.findAllMedicos();
        model.addAttribute("medicos", medicos);
        return "medicos_registrados";
    }
	
	@GetMapping("/predicciones")
	public String predicciones(Model model) {
		List<Predicciones> predicciones = prediccionesService.getAll();
        model.addAttribute("predicciones", predicciones);
		return "predicciones";
	}
	
	@GetMapping("/exportarBBDD")
    public String exportar(){
		return "exportarBBDD";
    }
	
	
	@GetMapping("/buscarPrediccionesCoincidentes")
	public ResponseEntity<?> buscarPrediccionesCoincidentes(@RequestParam("searchedDescripcion") String searchedDescripcion){
		
		List<Predicciones> prediccionesCoincidentes = new ArrayList<Predicciones>();
		
		List<HashMap<String,Object>> columnasPrediccionesCoincidentes = new ArrayList<HashMap<String,Object>>();
		
		if(searchedDescripcion != null && !searchedDescripcion.isEmpty()) {
			prediccionesCoincidentes = prediccionesService.buscarPrediccionesCoincidentes(searchedDescripcion);
		
			for(int i=0; i<prediccionesCoincidentes.size();i++) {
				
				HashMap<String, Object> columnas = new HashMap<String,Object>();
				
				columnas.put("id", prediccionesCoincidentes.get(i).getId());
				
				columnas.put("descripcion", prediccionesCoincidentes.get(i).getDescripcion());
				
				columnasPrediccionesCoincidentes.add(columnas);
			}
			
		}
		
		return new ResponseEntity(columnasPrediccionesCoincidentes, HttpStatus.OK);
	}
	
	@PostMapping("/borrarPrediccion")
	public ResponseEntity<?> borrarPredicciones(@RequestParam("idPrediccion") String idPrediccion) {
		
		Predicciones prediccion = prediccionesService.findPrediccionById(Long.parseLong(idPrediccion));
		
		if(prediccion != null) {
			prediccionesService.borrarPrediccion(prediccion.getId());
			return new ResponseEntity("La prediccion se ha borrado correctamente", HttpStatus.OK);
		}
		else {
			return new ResponseEntity("La predicción seleccionada no existe, por tanto no puede ser eliminada", HttpStatus.BAD_REQUEST);
		}
	}
	
}
