CREATE DATABASE `tfg` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `imagenes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `num_cluster` int NOT NULL,
  `ruta` varchar(255) NOT NULL,
  `prediccion_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cprqkohnt1f2ctnnd46o7buyb` (`ruta`),
  KEY `FKgrxs6gq37v9jkx5a2d03ve424` (`prediccion_id`),
  CONSTRAINT `FKgrxs6gq37v9jkx5a2d03ve424` FOREIGN KEY (`prediccion_id`) REFERENCES `predicciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `pacientes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_paciente` varchar(255) NOT NULL,
  `prediccion_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKpx01nkwonolsfciwas9kjadmm` (`prediccion_id`),
  CONSTRAINT `FKpx01nkwonolsfciwas9kjadmm` FOREIGN KEY (`prediccion_id`) REFERENCES `predicciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1511 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `predicciones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(255) NOT NULL,
  `max_clusters` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_i7kpk4dldfnbxm9cdhrap55ev` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `features` text NOT NULL,
  `num_cluster` int NOT NULL,
  `prediccion_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4ya8rk3v4yn1006ybtvg6gvfa` (`prediccion_id`),
  CONSTRAINT `FK4ya8rk3v4yn1006ybtvg6gvfa` FOREIGN KEY (`prediccion_id`) REFERENCES `predicciones` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_ldv0v52e0udsh2h1rs0r0gw1n` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  KEY `FKj6m8fwv7oqv74fcehir1a9ffy` (`role_id`),
  KEY `FKn041pceibmgxc7f9hcb95tm13` (`user_id`),
  CONSTRAINT `FKj6m8fwv7oqv74fcehir1a9ffy` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKn041pceibmgxc7f9hcb95tm13` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `apellidos` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `dni` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cdmw5hxlfj78uf4997i3qyyw5` (`correo`),
  UNIQUE KEY `UK_ggd9d47p8x7m0ajavk1ayuyqs` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS=1;

