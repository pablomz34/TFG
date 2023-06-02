package com.tfg.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.tfg.dto.UsuariosDto;
import com.tfg.entities.Predicciones;
import com.tfg.services.IPrediccionesService;
import com.tfg.services.IUsuariosService;

@Controller
@RequestMapping("/tablas")
public class TablasController {
	
	@Value("${spring.datasource.url}")
	private String bbddConnectionUrl;
	
	@Value("${spring.datasource.username}")
	private String bbddUser;
	
	@Value("${spring.datasource.password}")
	private String bbddPassword;
		
	@GetMapping("/exportarTabla")
    public ResponseEntity<byte[]> exportarTabla(@RequestParam String tabla) throws IOException {
        // Conexión a la base de datos
        //String url = "jdbc:mysql://localhost:3306/tfg";
        //String usuario = "root";
        //String contraseña = "root";

        try (Connection con = DriverManager.getConnection(this.bbddConnectionUrl, this.bbddUser, this.bbddPassword);
             Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT * FROM " + tabla)) {

            // Crear el contenido CSV a partir de los datos de la tabla
            StringBuilder contenidoCSV = new StringBuilder();
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            for (int i = 1; i <= columnCount; i++) {
                contenidoCSV.append(metaData.getColumnName(i));
                if (i < columnCount) {
                    contenidoCSV.append(",");
                }
            }
            contenidoCSV.append("\n");

            while (rs.next()) {
                for (int i = 1; i <= columnCount; i++) {
                    contenidoCSV.append(rs.getString(i));
                    if (i < columnCount) {
                        contenidoCSV.append(",");
                    }
                }
                contenidoCSV.append("\n");
            }

            // Convertir el contenido CSV a bytes
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            baos.write(contenidoCSV.toString().getBytes());

            // Configurar las cabeceras de la respuesta HTTP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", tabla + ".csv");

            return ResponseEntity.ok().headers(headers).body(baos.toByteArray());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

	
}
