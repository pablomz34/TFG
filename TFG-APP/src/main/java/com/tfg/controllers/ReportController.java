package com.tfg.controllers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.thymeleaf.util.StringUtils;

import com.tfg.dto.ReportDto;
import com.tfg.reports.StatisticsDto;
import com.tfg.services.IReportService;
import com.tfg.reports.VariablesDto;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@RestController
@RequestMapping("/report")
public class ReportController {

	@Autowired
	private IReportService repSer;

	@PostMapping("/download")
	public ResponseEntity<Resource> download(@RequestBody Map<String, Object> json,
			@RequestParam("nCluster") String nCluster) throws JRException, IOException, SQLException {
		Map<String, Object> params = new HashMap<>();

		List<StatisticsDto> statistics = new ArrayList<>();
		List<VariablesDto> variables = new ArrayList<>();
		
		Map<String, Object> statisticsMap = (Map<String, Object>) json.get("statistics");
		Map<String, Object> variablesMap = (Map<String, Object>) json.get("variables");
		
		String idPrediccion = (String) json.get("idPrediccion");

		for (Map.Entry<String, Object> i : statisticsMap.entrySet()) {
			StatisticsDto f = new StatisticsDto();
			f.setKey(StringUtils.capitalize(i.getKey().replace("_", " ").toLowerCase()));
			f.setValue(i.getValue().toString());
			statistics.add(f);
		}

		for (Map.Entry<String, Object> i : variablesMap.entrySet()) {
			VariablesDto f = new VariablesDto();
			f.setKey(i.getKey().replace("_", " "));
			f.setValue(i.getValue().toString().replace("{", "").replace("}", "").replace("[", "").replace("]", ""));
			variables.add(f);
		}
		
		JRBeanCollectionDataSource statParam = new JRBeanCollectionDataSource(statistics);
		JRBeanCollectionDataSource varParam = new JRBeanCollectionDataSource(variables);

		String titulo = (Integer.parseInt(nCluster) != -1) ? ("Reporte - Cluster " + nCluster)
				: ("Reporte - All Clusters");

		ClassPathResource resource = (Integer.parseInt(nCluster) != -1)
				? new ClassPathResource(
						"static/clustersImages/prediccion" + idPrediccion + "/cluster" + nCluster + ".png")
				: new ClassPathResource("static/clustersImages/prediccion" + idPrediccion + "/allClusters.png");
		
		InputStream inputStream = resource.getInputStream();
		byte[] clusterImage = inputStream.readAllBytes();

		params.put("titulo", titulo);
		params.put("statistics", statParam);
		params.put("variables", varParam);
		params.put("clusterImage", new ByteArrayInputStream(clusterImage));

		ReportDto dto = repSer.getReport(params);

		InputStreamResource stream = new InputStreamResource(dto.getStream());
		MediaType media = MediaType.APPLICATION_PDF;

		return ResponseEntity.ok().header("Content-Disposition", "inline; filename=\"" + dto.getNombreArchivo() + "\"")
				.contentLength(dto.getLength()).contentType(media).body(stream);
	}
}
