package com.tfg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagenesDto {
	private Long id;
	
	private String dni;
	
	private Integer nCluster;
	
}
