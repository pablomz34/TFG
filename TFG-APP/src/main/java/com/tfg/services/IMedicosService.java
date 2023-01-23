package com.tfg.services;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;

@Service
public interface IMedicosService extends UserDetailsService{
	
	public Medicos guardar(MedicosDto medico);
	
	public List<MedicosDto> findAll();
}
