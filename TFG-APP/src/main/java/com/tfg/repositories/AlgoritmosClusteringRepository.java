package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.HeadersPacientes;

public interface AlgoritmosClusteringRepository extends JpaRepository<AlgoritmosClustering, Long>{

	public AlgoritmosClustering findAlgoritmoById(Long idAlgoritmo);
	
	public AlgoritmosClustering findByNombreAlgoritmo(String nombreAlgoritmo);
	
	public List<AlgoritmosClustering> findByNombreAlgoritmoContaining(String nombreAlgoritmo);

//	@Query("SELECT aC FROM AlgoritmosClustering aC WHERE aC.nombreAlgoritmo NOT IN (:algoritmo1, :algoritmo2)")
//    public List<AlgoritmosClustering> findAlgoritmosExcludingAgglomerativeAndKmodes(String algoritmo1, String algoritmo2);

}
