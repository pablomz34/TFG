# TFG
Actualmente el servidor de la API Rest externa está fuera de uso, por tanto la herramienta WireMock está simulando el comportamiento de sus endpoints. Está configurada para que ocupe el puerto 8090 y se inicia automáticamente al lanzar la aplicación Spring Boot. Hay que asegurarse de cerrar ambos puertos, tanto el servidor de Spring como el de Wiremock una vez acabado.

Además, para el correcto funcionamiento, es necesario tener creada una base de datos en MySql llamada "db" y que los parámetros del application properties "spring.datasource.username" y "spring.datasource.password" deben revisarse en caso de que fueran distintos a indicados.

Para hacer login como administrador fijarse en la propiedades spring.security.user.name y spring.security.user.password, líneas 16 y 17 del archivo application.properties 
