package com.tfg.services;

import org.springframework.stereotype.Service;

import com.tfg.entities.Profiles;

@Service
public interface IProfilesService {
	
	public void guardarProfile(Integer numCluster, String features, Long idPrediccion);
	
	public Profiles findClusterProfile(Integer numCluster, Long idPrediccion);
	
	public String findFeaturesAllClusters(Long idPrediccion);
}
