package com.tfg.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.Profiles;
import com.tfg.repositories.ProfilesRepository;

@Service
@Transactional
public class ProfilesService implements IProfilesService {

	@Autowired
	private ProfilesRepository repos;

	@Override
	public void guardarProfile(String features, int maxClusters) {
		
		List<Profiles> profiles = repos.findAll();
		
		if(profiles.size() == 0) {
			Profiles profileNuevo = new Profiles();
			profileNuevo.setFeatures(features);
			profileNuevo.setMaxClusters(maxClusters);
			repos.save(profileNuevo);
		}
		else {
			profiles.get(0).setFeatures(features);
			profiles.get(0).setMaxClusters(maxClusters);
			repos.save(profiles.get(0));
		}
		
	}

	@Override
	public Profiles findProfile() {
		return repos.findAll().get(0);
	}
		
	

}
