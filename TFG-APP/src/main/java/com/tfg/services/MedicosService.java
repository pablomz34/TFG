package com.tfg.services;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.dto.MedicosDto;

import com.tfg.entities.Medicos;
import com.tfg.entities.Roles;
import com.tfg.repositories.MedicosRepository;
import com.tfg.repositories.RolesRepository;

import jakarta.persistence.PersistenceException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

@Service
@Transactional
public class MedicosService implements IMedicosService {

	@Autowired
	private RolesRepository rolesRep;

	@Autowired
	private MedicosRepository medicosRep;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public MedicosService(MedicosRepository medicosRep, RolesRepository rolesRep, PasswordEncoder passwordEncoder) {
		this.medicosRep = medicosRep;
		this.rolesRep = rolesRep;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void guardarMedico(MedicosDto medicoDto) {
		// TODO Auto-generated method stub
		Medicos medico = new Medicos();
		medico.setNombre(medicoDto.getNombre());
		medico.setApellidos(medicoDto.getApellidos());
		medico.setDni(medicoDto.getDni());
		medico.setCorreo(medicoDto.getCorreo());
		medico.setPassword(passwordEncoder.encode(medicoDto.getPassword()));

		Roles rol = rolesRep.findByNombre("ROLE_ADMIN");
		if (rol == null) {
			rol = checkRolExist();
		}
		medico.setRoles(Arrays.asList(rol));

		
		medicosRep.save(medico);

	}

	@Override
	public Medicos findMedicosByCorreo(String correo) {
		return medicosRep.findByCorreo(correo);
	}
	

	@Override
	public Medicos findMedicosByDni(String dni) {
		return  medicosRep.findByDni(dni);
	}

	@Override
	public List<MedicosDto> findAllMedicos() {
		List<Medicos> medicos = medicosRep.findAll();
		return medicos.stream().map((medico) -> mapToMedicosDto(medico)).collect(Collectors.toList());
	}

	private MedicosDto mapToMedicosDto(Medicos medico) {
		MedicosDto medicoDto = new MedicosDto();
		medicoDto.setNombre(medico.getNombre());
		medicoDto.setApellidos(medico.getApellidos());
		medicoDto.setCorreo(medico.getCorreo());
		medicoDto.setDni(medico.getDni());
		return medicoDto;
	}

	private Roles checkRolExist() {
		Roles rol = new Roles();
		rol.setNombre("ROLE_ADMIN");
		return rolesRep.save(rol);
	}



}
