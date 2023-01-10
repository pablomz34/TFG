package com.tfg.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.dto.AdministradoresDto;
import com.tfg.entities.Administradores;
import com.tfg.repositories.AdministradoresRepository;

@Service
@Transactional
public class AdministradoresService implements IAdministradoresService{
	
	@Autowired
	AdministradoresRepository repos;
	
	@Override
	public List<AdministradoresDto> findAll() {
		 List<Administradores> list = repos.findAll();
		 List<AdministradoresDto> listDto = new ArrayList<>();
		 for(Administradores a : list) {
			 AdministradoresDto dto = new AdministradoresDto();
			 dto.setNombre(a.getNombre());
			 dto.setApellidos(a.getApellidos());
			 dto.setDni(a.getDni());
			 dto.setPassword(a.getPassword());
			 
			 listDto.add(dto);
		 }
		 return listDto;
	}
	
	@Override
	public AdministradoresDto findByDni(String dni) {
		Administradores admin = repos.findByDni(dni);
		return new AdministradoresDto(admin.getNombre(), admin.getApellidos(), admin.getDni(), admin.getPassword());
	}
	
}
