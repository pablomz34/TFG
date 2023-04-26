package com.tfg.services;

import org.springframework.stereotype.Service;

import com.tfg.entities.Profiles;

@Service
public interface IProfilesService {
	
	public void guardarProfile(Integer numCluster, String features, Long idPrediccion);
	
	public Profiles findProfile(Integer numCluster, Long idPrediccion);
}
