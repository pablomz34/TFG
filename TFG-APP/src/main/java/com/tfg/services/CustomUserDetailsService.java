package com.tfg.services;

import java.util.Collection;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.repositories.UsuariosRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private UsuariosRepository usuariosRep;

    public CustomUserDetailsService(UsuariosRepository usuariosRep) {
        this.usuariosRep = usuariosRep;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Usuarios usuario = usuariosRep.findByCorreo(correo);

        if (usuario != null) {
            return new org.springframework.security.core.userdetails.User(usuario.getCorreo(),
            		usuario.getPassword(),
                    mapRolesToAuthorities(usuario.getRoles()));
        }else{
            throw new UsernameNotFoundException("Invalid username or password.");
        }
    }

    private Collection < ? extends GrantedAuthority> mapRolesToAuthorities(Collection <Roles> roles) {
        Collection < ? extends GrantedAuthority> mapRoles = roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getNombre()))
                .collect(Collectors.toList());
        return mapRoles;
    }
}
