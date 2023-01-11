package com.tfg.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.dto.AdministradoresDto;
import com.tfg.dto.MedicosDto;
import com.tfg.entities.Administradores;
import com.tfg.entities.Medicos;
import com.tfg.repositories.AdministradoresRepository;
import com.tfg.repositories.MedicosRepository;

@Service
@Transactional
public class MedicosService implements IMedicosService{
	
	@Autowired
	MedicosRepository repos;
	
	@Override
	public List<MedicosDto> findAll() {
		 /*List<Medicos> list = repos.findAll();
		 List<Medicos> listDto = new ArrayList<>();
		 for(Medicos a : list) {
			 MedicosDto dto = new AdministradoresDto();
			 
			 
			 listDto.add(dto);
		 }
		 return listDto;*/
		 return null;
	} 
	
	//@Override
	//public MedicosDto findByDni(String dni) {
		/*Administradores admin = repos.findByDni(dni);
		return new AdministradoresDto(admin.getNombre(), admin.getApellidos(), admin.getDni(), admin.getPassword());*/
		//return null;
	//}
	
}
