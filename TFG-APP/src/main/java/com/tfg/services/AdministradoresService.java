package com.tfg.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.entities.Administradores;
import com.tfg.repositories.AdministradoresRepository;

@Service
@Transactional
public class AdministradoresService implements IAdministradoresService{
	
	@Autowired
	AdministradoresRepository repos;
	
	@Override
	public List<Administradores> getAdmins() {
		return repos.findAll();
	}
	
}
