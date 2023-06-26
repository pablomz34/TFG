package com.tfg.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.AlgoritmosClustering;
import com.tfg.repositories.AlgoritmosClusteringRepository;

@Service
@Transactional
public class AlgoritmosClusteringService implements IAlgoritmosClusteringService {

	@Autowired
	private AlgoritmosClusteringRepository repos;

	@Override
	public void crearAlgoritmosIniciales() {
		
		
		if(repos.findByNombreAlgoritmo("agglomerative") == null) {
			AlgoritmosClustering agglomerative = new AlgoritmosClustering();

			agglomerative.setNombreAlgoritmo("agglomerative");
			
			repos.save(agglomerative);
		}

		if(repos.findByNombreAlgoritmo("kmodes") == null) {
			
			AlgoritmosClustering kModes = new AlgoritmosClustering();

			kModes.setNombreAlgoritmo("kmodes");
			
			repos.save(kModes);
		}
		
		if(repos.findByNombreAlgoritmo("kmeans_labels") == null) {
			
			AlgoritmosClustering kMeansLabels = new AlgoritmosClustering();

			kMeansLabels.setNombreAlgoritmo("kmeans_labels");
			
			repos.save(kMeansLabels);
		}
		
		if(repos.findByNombreAlgoritmo("mini_batch_labels") == null) {
			
			AlgoritmosClustering miniBatchLabels = new AlgoritmosClustering();

			miniBatchLabels.setNombreAlgoritmo("mini_batch_labels");
			
			repos.save(miniBatchLabels);
		}

	}
	
	@Override
	public AlgoritmosClustering findAlgoritmoByNombreAlgoritmo(String nombreAlgoritmo) {
		return repos.findByNombreAlgoritmo(nombreAlgoritmo);
	}

	@Override
	public void guardarAlgoritmo(String nombreAlgoritmo) {
		
		AlgoritmosClustering algoritmo = new AlgoritmosClustering();
		
		algoritmo.setNombreAlgoritmo(nombreAlgoritmo);
		
		repos.save(algoritmo);
		
	}

	@Override
	public List<AlgoritmosClustering> findAlgoritmosCoincidentes(String nombreAlgoritmo) {
		return repos.findByNombreAlgoritmoContaining(nombreAlgoritmo);
	}

	@Override
	public AlgoritmosClustering findAlgoritmoById(Long idAlgoritmo) {
		return repos.findAlgoritmoById(idAlgoritmo);
	}

	@Override
	public void borrarAlgoritmo(Long idAlgoritmo) {
		
		AlgoritmosClustering algoritmo = repos.findAlgoritmoById(idAlgoritmo);
		
		repos.delete(algoritmo);
		
	}

}
