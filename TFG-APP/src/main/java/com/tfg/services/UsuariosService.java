package com.tfg.services;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.repositories.RolesRepository;
import com.tfg.repositories.UsuariosRepository;

@Service
@Transactional
public class UsuariosService implements IUsuariosService {

	@Autowired
	private RolesRepository rolesRep;

	@Autowired
	private UsuariosRepository usuariosRep;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public UsuariosService(UsuariosRepository usuariosRep, RolesRepository rolesRep, PasswordEncoder passwordEncoder) {
		this.usuariosRep = usuariosRep;
		this.rolesRep = rolesRep;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	public void guardarMedico(UsuariosDto medicoDto) {
		// TODO Auto-generated method stub
		Usuarios medico = new Usuarios();
		medico.setNombre(medicoDto.getNombre());
		medico.setApellidos(medicoDto.getApellidos());
		medico.setDni(medicoDto.getDni());
		medico.setCorreo(medicoDto.getCorreo());
		medico.setPassword(passwordEncoder.encode(medicoDto.getPassword()));

		Roles rol = rolesRep.findByNombre("ROLE_MEDICO");
		if (rol == null) {
			rol = checkRolExist();
		}
		medico.setRoles(Arrays.asList(rol));

		usuariosRep.save(medico);

	}

	@Override
	public Usuarios findUsuariosByCorreo(String correo) {
		return usuariosRep.findByCorreo(correo);
	}

	@Override
	public Usuarios findUsuariosByDni(String dni) {
		return usuariosRep.findByDni(dni);
	}

	@Override
	public List<UsuariosDto> findAllMedicos() {
		Roles rolMedico = rolesRep.findByNombre("ROLE_MEDICO");
		List<Usuarios> medicos = usuariosRep.findByRoles(rolMedico);
		return medicos.stream().map((medico) -> mapToMedicosDto(medico)).collect(Collectors.toList());
	}

	private UsuariosDto mapToMedicosDto(Usuarios medico) {
		UsuariosDto medicoDto = new UsuariosDto();
		medicoDto.setNombre(medico.getNombre());
		medicoDto.setApellidos(medico.getApellidos());
		medicoDto.setCorreo(medico.getCorreo());
		medicoDto.setDni(medico.getDni());
		return medicoDto;
	}

	private Roles checkRolExist() {
		Roles rol = new Roles();
		rol.setNombre("ROLE_MEDICO");
		return rolesRep.save(rol);
	}

	@Override
	public Usuarios findUsuarioById(Long idUsuario) {
		return usuariosRep.findUsuarioById(idUsuario);
	}

	@Override
	public void updateDatoPerfilUsuario(Long idUsuario, String dato, String columnName) {

		Usuarios usuario = usuariosRep.findUsuarioById(idUsuario);

		if (usuario != null) {

			if (columnName.equals("nombre")) {
				usuario.setNombre(dato);
			}
			if (columnName.equals("apellidos")) {
				usuario.setApellidos(dato);
			}
			if (columnName.equals("correo")) {
				usuario.setCorreo(dato);
			}
			if (columnName.equals("dni")) {
				usuario.setDni(dato);
			}
			if (columnName.equals("password")) {
				usuario.setPassword(passwordEncoder.encode(dato));
			}
			
			usuariosRep.save(usuario);
		}
	}

}
