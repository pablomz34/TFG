package com.tfg.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.mvc.support.RedirectAttributesModelMap;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class AccessInterceptor implements HandlerInterceptor {
	
	private List<String> rutasSecuenciales = new ArrayList<String>();
	
	public AccessInterceptor() {
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/seleccionarPrediccionAndPoblacion");
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/seleccionarVariablesClinicas");
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase1");
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase2");
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase3");
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase4");
		
		this.rutasSecuenciales.add("/admin/procesamientoSecuencial/fase5");
		
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
        	
        	Boolean sessionPreviousPathHasPassed = (Boolean) session.getAttribute(previousPath + "_passed");
        	
    		if(sessionPreviousPathHasPassed == null || !sessionPreviousPathHasPassed) {
        		response.sendRedirect(previousPath);
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
