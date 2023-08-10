package com.tfg.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.mvc.support.RedirectAttributesModelMap;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;


@Component
public class AccessInterceptor implements HandlerInterceptor {
	
	@Value("${myapp.rutasSecuenciales}")
	private List<String> rutasSecuenciales;
	
	private List<String> erroresRutasSecuenciales = new ArrayList<String>();
	
	public AccessInterceptor() {

		this.erroresRutasSecuenciales.add("Es necesario seleccionar el procesamiento secuencial y automatizado");
		
		this.erroresRutasSecuenciales.add("Es necesario escoger una predicción y los datos de la población correspondientes");
		
		this.erroresRutasSecuenciales.add("Es necesario seleccionar las variables clínicas que desee utilizar");
		
		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Nº Óptimo de clusters");
		
		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Subpoblaciones");
		
		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Métricas de varianza");
		
		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Estadísticas de población");
	}
	
	@Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Aquí realizamos la lógica para verificar si el usuario ha accedido previamente a la ruta requerida.
        // Por ejemplo, podrías comprobar si existe una sesión o si el usuario ha realizado algún paso necesario.
        // Si la condición no se cumple, puedes redirigir al usuario a otra página o mostrar un mensaje de error.
			
		HttpSession session = request.getSession();
		
        String currentPath = request.getRequestURI();

        String previousPath = this.getPreviousPath(currentPath);
              
        if(previousPath != null) {
        	
        	if(this.rutasSecuenciales.indexOf(previousPath) > 2) {
        		
        		Boolean fasePreviaExecuted = (Boolean) session.getAttribute(previousPath + "_executed");
        		
        		if(fasePreviaExecuted == null) {
        			response.sendRedirect(previousPath);
        			session.setAttribute("accesoDenegadoMessage", this.erroresRutasSecuenciales.get(this.rutasSecuenciales.indexOf(previousPath)));		  			
        			return false;
        		}
        	}
        	
        	Boolean sessionPreviousPathHasPassed = (Boolean) session.getAttribute(previousPath + "_passed");
        	
    		if(sessionPreviousPathHasPassed == null) {
        		response.sendRedirect(previousPath);
        		session.setAttribute("accesoDenegadoMessage", this.erroresRutasSecuenciales.get(this.rutasSecuenciales.indexOf(previousPath)));		  			
    			return false;
        	}
        	else {
        		
        		return true;
        	}	   	
        }
        else {
        	
        	 return true;
        }     
    }
	
	private String getPreviousPath(String currentPath) {
		
		int indice = this.rutasSecuenciales.indexOf(currentPath);
		
		if(indice == -1 || indice == 0) {
			return null;
		}
		else {
					
			return this.rutasSecuenciales.get(indice-1);
	
		}
		
	}

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        // Este método se ejecuta después de que el controlador haya sido invocado.
        // Puedes realizar aquí cualquier acción adicional después de que se procese la solicitud.
    }
	
}
