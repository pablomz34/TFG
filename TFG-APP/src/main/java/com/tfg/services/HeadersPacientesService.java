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

import com.tfg.entities.HeadersPacientes;
import com.tfg.entities.Pacientes;
import com.tfg.repositories.HeadersPacientesRepository;
import com.tfg.repositories.PacientesRepository;
import com.tfg.repositories.PrediccionesRepository;

@Service
@Transactional
public class HeadersPacientesService implements IHeadersPacientesService {

	@Autowired
	private PrediccionesRepository prediccionesRepo;

	@Autowired
	private HeadersPacientesRepository repos;

	@Override
	public void guardarHeadersPoblacion(MultipartFile multipartFile, Long idPrediccion) throws IOException {

		try {
			InputStream inputStream = multipartFile.getInputStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));

			String headersString = reader.readLine();

			HeadersPacientes headersPaciente = new HeadersPacientes();

			int firstCommaIndex = headersString.indexOf(',');

			String headersVariableObjetivo = headersString.substring(0, firstCommaIndex).trim();
			String headersVariablesClinicas = headersString.substring(firstCommaIndex + 1).trim();

			headersPaciente.setHeadersVariableObjetivo(headersVariableObjetivo);

			headersPaciente.setHeadersVariablesClinicas(headersVariablesClinicas);

			headersPaciente.setPrediccion(prediccionesRepo.findPrediccionById(idPrediccion));

			repos.save(headersPaciente);

			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

	@Override
	public HeadersPacientes findHeadersPacientesByPrediccionId(Long idPrediccion) {
		return repos.findByPrediccionId(idPrediccion);
	}

	@Override
	public void borrarHeadersPoblacion(Long idPrediccion) {
		HeadersPacientes headersPacientes = repos.findByPrediccionId(idPrediccion);

		repos.delete(headersPacientes);
	}

	@Override
	public void addAlgoritmosHeadersPoblacion(InputStream file, Long idPrediccion) throws IOException {
		try {
			HeadersPacientes headersPaciente = repos.findByPrediccionId(idPrediccion);

			BufferedReader reader = new BufferedReader(new InputStreamReader(file));

			String[] headersString = reader.readLine().split(",");

			int saltos = headersPaciente.getHeadersVariablesClinicas().split(",").length;

			StringBuilder builder = new StringBuilder();

			for (int i = saltos + 1; i < headersString.length; i++) {
				builder.append(headersString[i].trim());
				if (i < headersString.length - 1)
					builder.append(",");
			}

			headersPaciente.setHeadersAlgoritmos(builder.toString());

			repos.save(headersPaciente);

			reader.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

	}

}
