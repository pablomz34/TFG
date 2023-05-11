//package com.tfg.controllers;
//
//import java.io.IOException;
//import java.sql.SQLException;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.core.io.InputStreamResource;
//import org.springframework.core.io.Resource;
//import org.springframework.http.MediaType;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.tfg.dto.ReportDto;
//import com.tfg.services.IReportService;
//
//import net.sf.jasperreports.engine.JRException;
//
//@RestController
//@RequestMapping("/report")
//public class ReportController {
//
//	@Autowired
//	private IReportService repSer;
//
//	@GetMapping("/download")
//	public ResponseEntity<Resource> download(@RequestParam Map<String, Object> params)
//			throws JRException, IOException, SQLException {
//		ReportDto dto = repSer.getReport(params);
//
//		InputStreamResource stream = new InputStreamResource(dto.getStream());
//		MediaType media = MediaType.APPLICATION_PDF;
//
//		return ResponseEntity.ok().header("Content-Disposition", "inline; filename=\"" + dto.getNombreArchivo() + "\"")
//				.contentLength(dto.getLength()).contentType(media).body(stream);
//	}
//}
