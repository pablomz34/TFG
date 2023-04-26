package com.tfg.repositories;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;


@Repository
public interface ProfilesRepository extends JpaRepository<Profiles, Long> {
	
	public Profiles findByNumClusterAndPrediccion(int numCluster, Predicciones prediccion);
	
	public Profiles findByFeatures(String features);
	
	public List<Profiles> findAll();
}
