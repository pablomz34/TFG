package com.tfg.services;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.tfg.dto.ReportDto;

import net.sf.jasperreports.engine.JRException;

@Service
public interface IReportService {

	ReportDto getReport(Map<String, Object> params) throws JRException, IOException, SQLException;
}
