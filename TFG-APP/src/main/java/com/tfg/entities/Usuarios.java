package com.tfg.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuarios")
public class Usuarios {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(name = "dni", nullable = false, unique=true)
	private String dni;
	
	@Column(name = "nombre", nullable = false)
	private String nombre;
	
	@Column(name = "apellidos", nullable = false)
	private String apellidos;
	
	/*@Column(name = "telefono", nullable = false, length = 9)
	private String telefono; */
	
	@Column(name  = "correo", nullable = false, unique=true)
	private String correo; 
	
	@Column(name = "password", nullable = false)
	private String password;
	
	/* @Column(name = "contador_errores_password", nullable = false, columnDefinition="Int default '0'")
	private Integer contadorErroresPassword;
	
	@Column(name = "bloqueado", nullable = false)
	private Boolean bloqueado;
	
	@Column(name = "hospital")
	private String hospital;
	
	@Column(name = "cargo")
	private String cargo;
	
	@Column(name = "departamento")
	private String departamento;*/
	
	@Column(name = "dado_alta")
	private Boolean dadoAlta;
	
	@ManyToMany(fetch = FetchType.EAGER, cascade=CascadeType.ALL)
    @JoinTable(
            name="users_roles",
            joinColumns={@JoinColumn(name="USER_ID", referencedColumnName="ID")},
            inverseJoinColumns={@JoinColumn(name="ROLE_ID", referencedColumnName="ID")})
    private List<Roles> roles = new ArrayList<>();
}
