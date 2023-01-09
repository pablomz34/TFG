package com.tfg.services;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import com.tfg.entities.Administradores;

public interface IAdministradoresService {
	public List<Administradores> getAdmins();
}
