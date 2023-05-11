package com.tfg.dto;

import java.io.ByteArrayInputStream;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDto {
	private String nombreArchivo;
	private ByteArrayInputStream stream;
	private int length;
	
}
