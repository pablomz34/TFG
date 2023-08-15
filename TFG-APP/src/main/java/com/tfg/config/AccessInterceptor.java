package com.tfg.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
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

		this.erroresRutasSecuenciales
				.add("Es necesario escoger una predicción y los datos de la población correspondientes");

		this.erroresRutasSecuenciales.add("Es necesario seleccionar las variables clínicas que desee utilizar");

		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Nº Óptimo de clusters");

		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Subpoblaciones");

		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Métricas de varianza");

		this.erroresRutasSecuenciales.add("Es necesario ejecutar el endpoint Estadísticas de población");
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {

		HttpSession session = request.getSession();

		String currentPath = request.getRequestURI();

		String previousPath = this.getPreviousPath(currentPath);
				
		if (this.rutasSecuenciales.contains(currentPath)) {
			
			String lastValidSecuencialUrl = (String) session.getAttribute("lastValidSecuencialUrl");
			
			int lastValidSecuencialUrlIndex = -1;
					
			if(lastValidSecuencialUrl != null) {
				lastValidSecuencialUrlIndex = this.rutasSecuenciales.indexOf(lastValidSecuencialUrl);
			}

			if (previousPath != null) {

				if (this.rutasSecuenciales.indexOf(previousPath) > 2) {

					Boolean fasePreviaExecuted = (Boolean) session.getAttribute(previousPath + "_executed");

					if (fasePreviaExecuted == null) {
						response.sendRedirect(previousPath);
						session.setAttribute("accesoDenegadoMessage",
								this.erroresRutasSecuenciales.get(this.rutasSecuenciales.indexOf(previousPath)));
						return false;
					}
				}

				Boolean sessionPreviousPathHasPassed = (Boolean) session.getAttribute(previousPath + "_passed");

				if (sessionPreviousPathHasPassed == null) {
					response.sendRedirect(previousPath);
					session.setAttribute("accesoDenegadoMessage",
							this.erroresRutasSecuenciales.get(this.rutasSecuenciales.indexOf(previousPath)));
					return false;
				} else {
					
					int currentPathIndex = this.rutasSecuenciales.indexOf(currentPath);
					
					if(lastValidSecuencialUrlIndex != -1 && lastValidSecuencialUrlIndex > currentPathIndex) {
						this.borrarVariablesSesion(request.getSession(), currentPathIndex, lastValidSecuencialUrlIndex, this.getAtributosExtra(currentPathIndex, lastValidSecuencialUrlIndex));
					}
				
					session.setAttribute("lastValidSecuencialUrl", currentPath);
					
					return true;
				}
			} else {
								
				if(lastValidSecuencialUrlIndex != -1 && lastValidSecuencialUrlIndex > 0) {
					this.borrarVariablesSesion(request.getSession(), 0, lastValidSecuencialUrlIndex, this.getAtributosExtra(0, lastValidSecuencialUrlIndex));				
				}			
				
				session.setAttribute("lastValidSecuencialUrl", currentPath);
				
				return true;
			}
		} else {
			return true;
		}
	}

	private String getPreviousPath(String currentPath) {

		int indice = this.rutasSecuenciales.indexOf(currentPath);

		if (indice == -1 || indice == 0) {
			return null;
		} else {

			return this.rutasSecuenciales.get(indice - 1);

		}

	}

	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {

		HttpSession session = request.getSession();
		
		String currentPath = request.getRequestURI();
			
		String lastValidSecuencialUrl = (String) session.getAttribute("lastValidSecuencialUrl");
		
		if (!this.rutasSecuenciales.contains(currentPath) && lastValidSecuencialUrl != null && modelAndView != null) {

			int lastValidSecuencialUrlIndex = this.rutasSecuenciales.indexOf(lastValidSecuencialUrl);
			
			this.borrarVariablesSesion(session, 0, lastValidSecuencialUrlIndex, this.getAtributosExtra(0, lastValidSecuencialUrlIndex));
			
			session.removeAttribute("lastValidSecuencialUrl");

		}
		
		if(!currentPath.equals("/admin/procesamientos/noSecuencial/fases") && modelAndView != null) {
			
			if(session.getAttribute(this.rutasSecuenciales.get(0) + "noSecuencial_passed") != null) {
				session.removeAttribute(this.rutasSecuenciales.get(0) + "noSecuencial_passed");
			}
			
		}
		
	}

	private List<String> getAtributosExtra(int firstIndexValidUrl, int lastIndexValidUrl) {

		List<String> atributosExtra = new ArrayList<String>();

		if (firstIndexValidUrl < 2 && lastIndexValidUrl >= 2) {
			atributosExtra.add("idPrediccionProcesamientoSecuencial");
		}

		if (firstIndexValidUrl < 3 && lastIndexValidUrl >= 3) {
			atributosExtra.add("indicesVariablesSeleccionadas");
		}

		if (firstIndexValidUrl < 6 && lastIndexValidUrl >=6) {
			atributosExtra.add("algoritmoOptimo");
		}

		return atributosExtra;
	}

	private void borrarVariablesSesion(HttpSession session, int currentIndexUrl, int lastIndexValidUrl, List<String> atributosExtra) {

		
		for (int i = 0; i < atributosExtra.size(); i++) {

			String nombreAtributo = atributosExtra.get(i);

			if (session.getAttribute(nombreAtributo) != null) {
				session.removeAttribute(nombreAtributo);
			}

		}

		for (int i = currentIndexUrl; i <= lastIndexValidUrl; i++) {

			String rutaSecuencial = this.rutasSecuenciales.get(i);

			if (i >= 3) {
				if (session.getAttribute(rutaSecuencial + "_executed") != null) {
					session.removeAttribute(rutaSecuencial + "_executed");
				}
			}

			if (session.getAttribute(rutaSecuencial + "_passed") != null) {
				session.removeAttribute(rutaSecuencial + "_passed");
			}

		}
		
	}

}
