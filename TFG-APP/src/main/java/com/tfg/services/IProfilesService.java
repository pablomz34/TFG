package com.tfg.services;

import org.springframework.stereotype.Service;

import com.tfg.entities.Profiles;

@Service
public interface IProfilesService {
	
	public void guardarProfile(int numCluster, String features, Long idPrediccion);
	
	public Profiles findProfile(int numCluster, Long idPrediccion);
}
