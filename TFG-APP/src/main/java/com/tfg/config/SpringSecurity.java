package com.tfg.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.tfg.entities.Roles;
import com.tfg.entities.Usuarios;
import com.tfg.handlers.LoginSuccessHandler;
import com.tfg.repositories.UsuariosRepository;

@Configuration
@EnableWebSecurity
public class SpringSecurity implements CommandLineRunner, WebMvcConfigurer {

    @Autowired
    private UserDetailsService userDetailsService;
 
    @Value("${spring.security.user.name}")
    private String adminEmail;

    @Value("${spring.security.user.password}")
    private String adminPassword;

    @Autowired
    private AccessInterceptor accessInterceptor;
    
    @Autowired
    private UsuariosRepository userRep;
    
    @Autowired
	private LoginSuccessHandler loginSuccessHandler;
    
    @Bean
    public static PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this.accessInterceptor)
                .addPathPatterns("/admin/seleccionarModoDeProcesamiento",
                		"/admin/procesamientoSecuencial/seleccionarPrediccionAndPoblacion",
                		"/admin/procesamientoSecuencial/seleccionarVariablesClinicas",
                		"/admin/procesamientoSecuencial/fase1",
                		"/admin/procesamientoSecuencial/fase2",
                		"/admin/procesamientoSecuencial/fase3",
                		"/admin/procesamientoSecuencial/fase4",
                		"/admin/procesamientoSecuencial/fase5");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
     
    	http
    	.csrf().disable()
    	.authorizeHttpRequests((authorize) ->
                        authorize.requestMatchers("/images/**", "/js/**", "/css/**", "/node_modules/**", "/sass/**").permitAll()
                                .requestMatchers("/registro/**", "/login/**", "/", "/index", "/comprobarDNIUnico", "/comprobarCorreoUnico", "/report/**").permitAll()
                                .requestMatchers("/admin/**", "/exportarBBDD/**").hasRole("ADMIN")
                                .requestMatchers("/medico/**", "/clustersImages/**", "/perfilUsuario/**", "/obtenerDatosPerfilUsuario/**",
                                		"/cambiarDatoPerfilUsuario/**").hasAnyRole("ADMIN", "MEDICO")
                                .anyRequest().authenticated()
                ).formLogin(
                        form -> form
                                .loginPage("/login")
                                .loginProcessingUrl("/login")
                                .permitAll()
                                .successHandler(loginSuccessHandler)
                ).logout(
                        logout -> logout
                                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                                .permitAll()
                );
    		
        return http.build();
    }
    
    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
    	
    	auth
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder())
                ;
    }
    

	@Override
	public void run(String... args) throws Exception {
		if(userRep.findByCorreo(adminEmail)==null) {
    		Usuarios administrador = new Usuarios();
            administrador.setCorreo(adminEmail);
            administrador.setPassword(passwordEncoder().encode(adminPassword));
            administrador.setNombre("admin");
            administrador.setApellidos("");
            administrador.setDni("");
            ArrayList<Roles> roles = new ArrayList<>();
            
            Roles rol = new Roles();
            rol.setNombre("ROLE_ADMIN");
            
            roles.add(rol);
            administrador.setRoles(roles);
            userRep.save(administrador);
    	}
		
	}   
   
}
