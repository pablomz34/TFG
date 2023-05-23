package com.tfg.reports;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;

@Component
public class JasperReport {

	private static final String REPORT_FOLDER = "static/reports";

	private static final String JASPER = ".jasper";

	public ByteArrayOutputStream export(String fileName, Map<String, Object> params)
			throws JRException, IOException {

		ByteArrayOutputStream stream = new ByteArrayOutputStream();
		ClassPathResource resource = new ClassPathResource(REPORT_FOLDER + File.separator + fileName + JASPER);

		InputStream inputStream = resource.getInputStream();
		JasperPrint jasperPrint = JasperFillManager.fillReport(inputStream, params, new JREmptyDataSource());

		JasperExportManager.exportReportToPdfStream(jasperPrint, stream);

		return stream;
	}

}