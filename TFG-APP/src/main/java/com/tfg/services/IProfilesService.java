package com.tfg.services;

import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Service;

import com.tfg.entities.Profiles;

@Service
public interface IProfilesService {
	
	public void guardarProfile(Integer numCluster, String features, Long idPrediccion);
	
	public Profiles findClusterProfile(Integer numCluster, Long idPrediccion);
	
	public String findPrediccionFeatures(String descripcionPrediccion);
}
