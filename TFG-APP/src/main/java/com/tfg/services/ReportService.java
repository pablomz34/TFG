package com.tfg.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import com.tfg.dto.ReportDto;
import com.tfg.reports.JasperReport;
import net.sf.jasperreports.engine.JRException;

@Service
public class ReportService implements IReportService {

	@Autowired
	private JasperReport report;

	@Autowired
	private DataSource data;

	@Override
	public ReportDto getReport(Map<String, Object> params) throws JRException, IOException, SQLException {
		String nombreArchivo = "report";
		String extension = ".pdf";
		ReportDto dto = new ReportDto();
		dto.setNombreArchivo(nombreArchivo + extension);

		ByteArrayOutputStream stream = report.export(nombreArchivo, params,
				data.getConnection());

		byte[] bs = stream.toByteArray();
		dto.setStream(new ByteArrayInputStream(bs));
		dto.setLength(bs.length);
		
		return dto; 
	}

}
