package com.tfg.controllers;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.io.BufferedWriter;
import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.BufferedOutputStream;
import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
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
	
	
	@GetMapping("/getTablas")
    public ResponseEntity<?> getTablas(){
    	Connection connection = null;
		List<String> tablas = new ArrayList<>();
        try {
            // Establecer conexión con la base de datos
            connection = DriverManager.getConnection(this.bbddConnectionUrl, this.bbddUser, this.bbddPassword);

            // Obtener metadatos de la base de datos
            DatabaseMetaData metaData = connection.getMetaData();

            // Obtener el resultado de las tablas de la base de datos
            String[] tipos = {"TABLE"};
            ResultSet resultSet = metaData.getTables(connection.getCatalog(), null, null, tipos);
            
          
            // Recorrer los resultados e imprimir los nombres de las tablas
            while (resultSet.next()) {
                String tableName = resultSet.getString("TABLE_NAME");
                if(!tableName.equals("usuarios") && !tableName.equals("users_roles") && 
                		!tableName.equals("roles")) tablas.add(tableName);
            }

            resultSet.close();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // Cerrar la conexión
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
        return new ResponseEntity<>(tablas, HttpStatus.OK);
    }
		
	@GetMapping("/exportarTabla")
    public ResponseEntity<byte[]> exportarTabla(@RequestParam String tabla) throws IOException {

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
    
	@GetMapping("/exportarEstructuraBBDD")
    public ResponseEntity<String> exportarEstructuraBBDD() {
		String databaseName = null;
		try {
            URI uri = new URI(this.bbddConnectionUrl.substring(5));
            databaseName = uri.getPath().substring(1);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
		try (Connection connection = DriverManager.getConnection(this.bbddConnectionUrl, this.bbddUser, this.bbddPassword)) {


            StringBuilder dumpContent = new StringBuilder();

            // Export table structures
            DatabaseMetaData metaData = connection.getMetaData();
            ResultSet tables = metaData.getTables(connection.getCatalog(), null, null, new String[]{"TABLE"});

            dumpContent.append("SET FOREIGN_KEY_CHECKS=0;\n\n");

            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                String tableStructure = getTableStructure(connection, tableName);
                dumpContent.append(tableStructure).append(";\n\n");
            }

            dumpContent.append("SET FOREIGN_KEY_CHECKS=1;\n\n");

            String dumpContentString = dumpContent.toString();

            return ResponseEntity.ok().body(dumpContentString);
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

	/* Exportar solo estructura*/
	private String getTableStructure(Connection connection, String tableName) throws SQLException {
        StringBuilder tableStructure = new StringBuilder();

        String structureQuery = "SHOW CREATE TABLE " + tableName;
        try (Statement structureStatement = connection.createStatement();
             ResultSet structureResult = structureStatement.executeQuery(structureQuery)) {
            if (structureResult.next()) {
                String createTableStatement = structureResult.getString(2);
                tableStructure.append(createTableStatement);
            }
        }

        return tableStructure.toString();
    }
	
	
	
	/* --------------Exportar estructura y datos-------------------
    private String exportTable(Connection connection, String tableName) throws SQLException {
        StringBuilder tableDump = new StringBuilder();

        // Export table structure
        String structureQuery = "SHOW CREATE TABLE " + tableName;
        try (Statement structureStatement = connection.createStatement();
             ResultSet structureResult = structureStatement.executeQuery(structureQuery)) {
            if (structureResult.next()) {
                String createTableStatement = structureResult.getString(2);
                tableDump.append(createTableStatement).append(";\n\n");
            }
        }

        // Export table data
        String dataQuery = "SELECT * FROM " + tableName;
        try (Statement dataStatement = connection.createStatement();
             ResultSet dataResult = dataStatement.executeQuery(dataQuery)) {
            ResultSetMetaData metaData = dataResult.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (dataResult.next()) {
                tableDump.append("INSERT INTO ").append(tableName).append(" VALUES (");
                for (int i = 1; i <= columnCount; i++) {
                    Object value = dataResult.getObject(i);
                    if (value == null) {
                        tableDump.append("NULL");
                    } else if (value instanceof Number) {
                        tableDump.append(value);
                    } else {
                        tableDump.append("'").append(value).append("'");
                    }
                    if (i < columnCount) {
                        tableDump.append(", ");
                    }
                }
                tableDump.append(");\n");
            }
        }

        return tableDump.toString();
    }*/
	
}
