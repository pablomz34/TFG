package com.tfg.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import com.tfg.services.IAlgoritmosClusteringService;

import jakarta.annotation.PostConstruct;

@Configuration
public class AlgoritmosClusteringInitializerConfig {
	
    @Autowired
    private IAlgoritmosClusteringService algoritmosClusteringService;
    
    @PostConstruct
    public void initTableAlgoritmos() {
    	algoritmosClusteringService.crearAlgoritmosIniciales();
    }

}
