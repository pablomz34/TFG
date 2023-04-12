package com.tfg.services;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.tfg.dto.MedicosDto;
import com.tfg.entities.Medicos;

@Service
public interface IMedicosService {
	
	public void guardarMedico(MedicosDto medico);
	
	public Medicos findMedicosByCorreo(String correo);
	
	public Medicos findMedicosByDni(String dni);
	
	public List<MedicosDto> findAllMedicos();
}
