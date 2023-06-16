package com.tfg.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.util.ArrayList;

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
	public void guardarPoblacionInicial(MultipartFile multipartFile, Long idPrediccion) throws IOException {

		try {
			InputStream inputStream = multipartFile.getInputStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));

			// Nos saltamos la primera linea de los headers
			reader.readLine();

			String datosPaciente;

			while ((datosPaciente = reader.readLine()) != null) {
				Pacientes paciente = new Pacientes();

				int firstCommaIndex = datosPaciente.indexOf(',');

				String variableObjetivo = datosPaciente.substring(0, firstCommaIndex).trim();
				String variablesClinicas = datosPaciente.substring(firstCommaIndex + 1).trim();

				paciente.setVariableObjetivo(variableObjetivo);

				paciente.setVariablesClinicas(variablesClinicas);

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

	@Override
	public void borrarPoblacion(Long idPrediccion) {

		List<Pacientes> pacientes = repos.findAllByPrediccionId(idPrediccion);

		for (int i = 0; i < pacientes.size(); i++) {

			repos.delete(pacientes.get(i));
		}

	}

	@Override
	public void addAlgoritmosPoblacion(InputStream file, Long idPrediccion) throws IOException {
		try {

			List<Pacientes> pacientes = repos.findAllByPrediccionId(idPrediccion);

			BufferedReader reader = new BufferedReader(new InputStreamReader(file));

			// Nos saltamos la primera linea de los headers
			reader.readLine();

			String datosPaciente;

			List<String> algoritmos = new ArrayList<>();

			int saltos = pacientes.get(0).getVariablesClinicas().split(",").length;

			while ((datosPaciente = reader.readLine()) != null) {
				StringBuilder builder = new StringBuilder();
				String[] strings = datosPaciente.split(",");

				for (int i = saltos + 1; i < strings.length; i++) {
					builder.append(strings[i].trim());
					if (i < strings.length - 1)
						builder.append(",");
					else {
						algoritmos.add(builder.toString());
					}

				}

			}

			int pos = 0;
			for (Pacientes paciente : pacientes) {
				paciente.setAlgoritmos(algoritmos.get(pos));
				pos++;

				repos.save(paciente);
			}

			reader.close();
		} catch (

		IOException e) {
			e.printStackTrace();
		}

	}
}
