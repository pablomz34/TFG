package com.tfg.services;

import java.util.List;

import com.tfg.dto.AdministradoresDto;
import com.tfg.entities.Administradores;

public interface IAdministradoresService {
	public List<AdministradoresDto> findAll();
	
	public AdministradoresDto findByDni(String dni);

}
