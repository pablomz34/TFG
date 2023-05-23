package com.tfg.controllers;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.util.StringUtils;

import com.tfg.dto.ReportDto;
import com.tfg.reports.FeaturesDto;
import com.tfg.services.IReportService;
import com.tfg.services.IUsuariosService;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@RestController
@RequestMapping("/report")
public class ReportController {

	@Autowired
	private IReportService repSer;
	
	@Autowired
	private IUsuariosService ser;

	@PostMapping("/download")
	public ResponseEntity<Resource> download(@RequestBody Map<String, Object> json)
			throws JRException, IOException, SQLException {
		Map<String,Object> params = new HashMap<>();
//		Gson gson = new Gson();
//		gson.toJson(json);
//		List<Map<String, Object>> lista = new ArrayList<>();
//		lista.add(json); 
		
		List<FeaturesDto> features = new ArrayList<>();
		for(Map.Entry<String, Object> i : json.entrySet()) {
			FeaturesDto f = new FeaturesDto();
			f.setKey(StringUtils.capitalize(i.getKey().replace("_", " ").toLowerCase()));
			f.setValue(i.getValue().toString().replace("_", " "));
			features.add(f);
		}
		
		
		//List<UsuariosDto> usuarios = ser.findAllMedicos();
		
		JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(features);
		params.put("CollectionBeanParam", dataSource);
		params.put("titulo", "Datos obtenidos");
		
		ReportDto dto = repSer.getReport(params);

		InputStreamResource stream = new InputStreamResource(dto.getStream());
		MediaType media = MediaType.APPLICATION_PDF;

		return ResponseEntity.ok().header("Content-Disposition", "inline; filename=\"" + dto.getNombreArchivo() + "\"")
				.contentLength(dto.getLength()).contentType(media).body(stream);
	}
}
 