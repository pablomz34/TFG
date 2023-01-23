package com.tfg.services;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.dto.MedicosDto;

import com.tfg.entities.Medicos;
import com.tfg.entities.Rol;

import com.tfg.repositories.MedicosRepository;
import com.tfg.repositories.RolRepository;

@Service
@Transactional
public class MedicosService implements IMedicosService {

	@Autowired
	private RolRepository rolRepos;
	
	@Autowired
	private MedicosRepository medRepos;

	@Override
	public List<MedicosDto> findAll() {
		/*
		 * List<Medicos> list = repos.findAll(); List<Medicos> listDto = new
		 * ArrayList<>(); for(Medicos a : list) { MedicosDto dto = new
		 * AdministradoresDto();
		 * 
		 * 
		 * listDto.add(dto); } return listDto;
		 */
		return null;
	}

	@Override
	public Medicos guardar(MedicosDto medicoDto) {
		Medicos medico = new Medicos();
		medico.setDni(medicoDto.getDni());
		medico.setNombre(medicoDto.getNombre());
		medico.setApellidos(medicoDto.getApellidos());
		medico.setPassword(medicoDto.getPassword());
		medico.setDadoAlta(false);
		Rol rol = rolRepos.findFirstByNombre("ROLE_MEDICO");
//		if(rol == null) {
//			Rol rolNuevo=new Rol();
//			rolNuevo.setNombre("ROLE_ADMIN");
//			rolRepos.save(rolNuevo);
//		}
		medico.setRol(rol);

		return medRepos.save(medico);

	}
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Medicos medico = medRepos.findByDni(username);
		if(medico == null) {
			throw new UsernameNotFoundException("Usuario o contraseña inválidos");
		}
		GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(medico.getRol().getNombre());
		Collection<GrantedAuthority> granList = new ArrayList<>();
		granList.add(grantedAuthority);	
		return new User(medico.getDni(),medico.getPassword(),granList);
	}
	

	// @Override
	// public MedicosDto findByDni(String dni) {
	/*
	 * Administradores admin = repos.findByDni(dni); return new
	 * AdministradoresDto(admin.getNombre(), admin.getApellidos(), admin.getDni(),
	 * admin.getPassword());
	 */
	// return null;
	// }

}
