package com.tfg.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;
import com.tfg.repositories.PrediccionesRepository;
import com.tfg.repositories.ProfilesRepository;

@Service
@Transactional
public class ProfilesService implements IProfilesService {

	@Autowired 
	private PrediccionesRepository prediccionesRepo;
	
	@Autowired
	private ProfilesRepository repos;

	@Override
	public void guardarProfile(Integer numCluster, String features, Long idPrediccion) {
		
		Predicciones prediccion = prediccionesRepo.findPrediccionById(idPrediccion);
		
		Profiles profile = repos.findByNumClusterAndPrediccion(numCluster, prediccion);
		
		if(profile == null) {
			Profiles profileNuevo = new Profiles();
			profileNuevo.setFeatures(features);
			profileNuevo.setNumCluster(numCluster);
			profileNuevo.setPrediccion(prediccion);
			repos.save(profileNuevo);
		}
		else {
			profile.setFeatures(features);
			repos.save(profile);
		}
		
	}

	@Override
	public Profiles findClusterProfile(Integer numCluster, Long idPrediccion) {
		
		Predicciones prediccion = prediccionesRepo.findPrediccionById(idPrediccion);
		
		return repos.findByNumClusterAndPrediccion(numCluster, prediccion);
	}
		
	public String findFeaturesAllClusters(Long idPrediccion){
		
		Predicciones prediccion = prediccionesRepo.findPrediccionById(idPrediccion);
		
		Profiles profile = repos.findByNumClusterAndPrediccion(-1, prediccion);
		
		if(profile == null) return "";
		
		return profile.getFeatures();
	}

}
