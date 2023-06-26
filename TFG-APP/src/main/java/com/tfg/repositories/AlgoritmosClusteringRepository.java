package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tfg.entities.AlgoritmosClustering;
import com.tfg.entities.HeadersPacientes;

public interface AlgoritmosClusteringRepository extends JpaRepository<AlgoritmosClustering, Long>{

	public AlgoritmosClustering findAlgoritmoById(Long idAlgoritmo);
	
	public AlgoritmosClustering findByNombreAlgoritmo(String nombreAlgoritmo);
	
	public List<AlgoritmosClustering> findByNombreAlgoritmoContaining(String nombreAlgoritmo);
}
