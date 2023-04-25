package com.tfg.services;

import org.springframework.stereotype.Service;

import com.tfg.entities.Profiles;

@Service
public interface IProfilesService {
	
	public void guardarProfile(String features, int max_clusters);
	
	public Profiles findProfile();
}
