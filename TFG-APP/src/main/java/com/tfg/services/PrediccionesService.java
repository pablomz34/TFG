package com.tfg.services;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.HeadersPacientes;
import com.tfg.entities.Imagenes;
import com.tfg.entities.Pacientes;
import com.tfg.entities.Predicciones;
import com.tfg.entities.Profiles;
import com.tfg.repositories.HeadersPacientesRepository;
import com.tfg.repositories.ImagenesRepository;
import com.tfg.repositories.PacientesRepository;
import com.tfg.repositories.PrediccionesRepository;
import com.tfg.repositories.ProfilesRepository;

@Service
@Transactional
public class PrediccionesService implements IPrediccionesService {

	@Autowired
	private PrediccionesRepository repos;
	
	@Autowired 
	private ImagenesRepository repoImagenes;
	
	@Autowired 
	private ProfilesRepository repoProfiles;
	
	@Autowired 
	private HeadersPacientesRepository repoHeadersPacientes;
	
	@Autowired 
	private PacientesRepository repoPacientes;
	

	@Value("${myapp.imagenesClusters.ruta}")
	private String rutaImagenesClusters;

	@Override
	public Predicciones findPrediccionByDescripcion(String descripcion) {
		return repos.findByDescripcion(descripcion);
	}

	@Override
	public Predicciones guardarPrediccion(String descripcion) {

		Predicciones prediccion = new Predicciones();
		prediccion.setDescripcion(descripcion);
		repos.save(prediccion);

		return prediccion;
	}

	@Override
	public List<String> getDescripciones() {
		List<Predicciones> predicciones = repos.findAll();
		List<String> descripciones = new ArrayList<>();
		if (predicciones != null) {
			for (Predicciones prediccion : predicciones) {
				descripciones.add(prediccion.getDescripcion());
			}
		}

		return descripciones;
	}

	@Override
	public Predicciones findPrediccionById(Long id) {
		return repos.findPrediccionById(id);
	}

	@Override
	public void guardarMaxClusters(Integer maxClusters, Long id) {

		Predicciones prediccion = repos.findPrediccionById(id);

		if (prediccion != null) {
			prediccion.setMaxClusters(maxClusters);
			repos.save(prediccion);
		}

	}

	@Override
	public List<Predicciones> getAll() {
		// TODO Auto-generated method stub
		return repos.findAll();
	}

	@Override
	public boolean borrarPrediccion(Long id) {
		// TODO Auto-generated method stub

		Predicciones prediccion = repos.findPrediccionById(id);

		List<Imagenes> listaImg = repoImagenes.findAllByPrediccionId(id);

		for (int i = 0; i < listaImg.size(); i++) {
			repoImagenes.delete(listaImg.get(i));	
		}

		List<Profiles> listaProfiles = repoProfiles.findAllByPrediccionId(id);

		for (int i = 0; i < listaProfiles.size(); i++) {
			repoProfiles.delete(listaProfiles.get(i));
		}
		
		HeadersPacientes headersPacientes = repoHeadersPacientes.findByPrediccionId(id);
		
		if(headersPacientes != null) {
			repoHeadersPacientes.delete(headersPacientes);
		}
		
		List<Pacientes> listaPacientes = repoPacientes.findAllByPrediccionId(id);

		for (int i = 0; i < listaPacientes.size(); i++) {
			repoPacientes.delete(listaPacientes.get(i));	
		}
		
		String rutaPrediccion = rutaImagenesClusters + File.separator + "prediccion" + prediccion.getId();

		File directorioPrediccion = new File(rutaPrediccion);

		if (directorioPrediccion.exists()) {
			borrarDirectorio(directorioPrediccion);
			System.out.println("Directorio borrado exitosamente.");
		} else {
			System.out.println("El directorio no existe.");
		}
		
		repos.delete(prediccion);

		return true;
	}

	private void borrarDirectorio(File directorioPrediccion) {
		File[] archivos = directorioPrediccion.listFiles();

		if (archivos != null) {
			for (File archivo : archivos) {
				if (archivo.isDirectory()) {
					borrarDirectorio(archivo);
				} else {
					archivo.delete();
				}
			}
		}

		directorioPrediccion.delete();

	}

	@Override
	public List<Predicciones> buscarPrediccionesCoincidentes(String substring) {
		return repos.findByDescripcionContaining(substring);
	}

}
