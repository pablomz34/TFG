# TFG
Actualmente el servidor de la API Rest externa está fuera de uso, por tanto la herramienta WireMock está simulando el comportamiento de sus endpoints. Está configurada para que ocupe el puerto 8090 y se inicia automáticamente al lanzar la aplicación Spring Boot.

Además, para el correcto funcionamiento, es necesario tener creada una base de datos en MySql llamada "db" y que los parámetros del application properties "spring.datasource.username" y "spring.datasource.password" deben revisarse en caso de que fueran distintos a indicados.
