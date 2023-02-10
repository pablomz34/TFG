package com.tfg.services;

import java.util.Collection;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tfg.entities.Medicos;
import com.tfg.entities.Roles;
import com.tfg.repositories.MedicosRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private MedicosRepository medicosRep;

    public CustomUserDetailsService(MedicosRepository medicosRep) {
        this.medicosRep = medicosRep;
    }

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        Medicos medico = medicosRep.findByCorreo(correo);

        if (medico != null) {
            return new org.springframework.security.core.userdetails.User(medico.getCorreo(),
                    medico.getPassword(),
                    mapRolesToAuthorities(medico.getRoles()));
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
