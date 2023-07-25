package com.tfg.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tfg.entities.AlgoritmosClustering;

import jakarta.annotation.Nullable;

public interface AlgoritmosClusteringRepository extends JpaRepository<AlgoritmosClustering, Long>{

	public AlgoritmosClustering findAlgoritmoById(Long idAlgoritmo);
	
	public AlgoritmosClustering findByNombreAlgoritmo(String nombreAlgoritmo);
	
	public List<AlgoritmosClustering> findByNombreAlgoritmoContaining(String nombreAlgoritmo);

	@Query("SELECT aC FROM AlgoritmosClustering aC WHERE aC.nombreAlgoritmo IN (:agglomerative, :kmodes)")
    public List<AlgoritmosClustering> findAlgoritmosAgglomerativeAndKmodes(String agglomerative, String kmodes);

	/*@Query("SELECT aC FROM AlgoritmosClustering aC WHERE aC IN "
	        + "(SELECT a FROM AlgoritmosClustering a WHERE a.nombreAlgoritmo LIKE %:nombreAlgoritmo% "
	        + "AND a.nombreAlgoritmo NOT IN (:algoritmosSeleccionados)) "
	        + "AND aC.nombreAlgoritmo LIKE %:nombreAlgoritmo% "
	        + "AND aC.nombreAlgoritmo NOT IN "
	        + "(SELECT b.nombreAlgoritmo FROM AlgoritmosClustering b WHERE b.nombreAlgoritmo LIKE %:nombreAlgoritmo% "
	        + "AND b.nombreAlgoritmo IN (:algoritmosPreSeleccionados))")*/
	@Query("SELECT a FROM AlgoritmosClustering a WHERE a.nombreAlgoritmo LIKE %:nombreAlgoritmo% "
	        + "AND a.nombreAlgoritmo NOT IN (:algoritmosSeleccionados) "
	        + "AND a.nombreAlgoritmo NOT IN "
	        + "(SELECT b.nombreAlgoritmo FROM AlgoritmosClustering b WHERE b.nombreAlgoritmo LIKE %:nombreAlgoritmo% "
	        + "AND b.nombreAlgoritmo IN (:algoritmosPreSeleccionados))")
    public List<AlgoritmosClustering> findAlgoritmosCoincidentesAndNoSelected(
    		@Param("nombreAlgoritmo") String nombreAlgoritmo, 
    		@Param("algoritmosSeleccionados") List<String> algoritmosSeleccionados, 
    		@Param("algoritmosPreSeleccionados") @Nullable List<String> algoritmosPreSeleccionados);

	
}
