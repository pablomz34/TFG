package com.tfg.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.tfg.entities.Pacientes;
import com.tfg.repositories.PacientesRepository;
import com.tfg.repositories.PrediccionesRepository;

@Service
@Transactional
public class PacientesService implements IPacientesService {

	
	@Autowired 
	private PrediccionesRepository prediccionesRepo;
	
	@Autowired
	private PacientesRepository repos;

	@Override
	public void guardarPoblacion(MultipartFile multipartFile, Long idPrediccion) throws IOException {

		try {
            InputStream inputStream = multipartFile.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            
            String linea;
            while ((linea = reader.readLine()) != null) {
                Pacientes paciente = new Pacientes();
                
                paciente.setDataPaciente(linea);
                paciente.setPrediccion(prediccionesRepo.findPrediccionById(idPrediccion));
                
                repos.save(paciente);
            }
            
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
		

	}

	@Override
	public List<Pacientes> findPacientesByPrediccionId(Long idPrediccion) {
		// TODO Auto-generated method stub
		return repos.findAllByPrediccionId(idPrediccion);
	}
}
