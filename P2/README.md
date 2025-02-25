# Práctica 2 - Autenticación con JWT

Esta practica implementa autenticación utilizando **JSON Web Tokens (JWT)** en un entorno **Node.js** con Express y una base de datos MySQL. Se emplean cookies HTTPOnly para el manejo seguro del token y se ha implementado una lógica de renovación automática si el token ha expirado dentro de un período de gracia.

## Tecnologías y Herramientas Utilizadas
### **Backend**
- **Node.js & Express**: Framework rápido y ligero para crear servidores en JavaScript.
  - **Ventajas:** Escalabilidad, facilidad de uso y compatibilidad con múltiples bases de datos.
  - **Desventajas:** No es ideal para aplicaciones con alta carga de CPU.
- **JWT (JSON Web Token)**: Para autenticación basada en tokens.
- **Bcrypt**: Para encriptar y comparar contraseñas de manera segura.
- **Cookie-Parser**: Manejo de cookies en Express.
- **Dotenv**: Manejo de variables de entorno.

### **Frontend**
- **React.js (con Vite)**: Framework de frontend moderno y rápido.
  - **Ventajas:** Reactividad, facilidad para crear SPA.
  - **Desventajas:** Curva de aprendizaje alta.

### **Base de Datos**
- **MySQL**: Base de datos relacional utilizada para gestionar usuarios.
  - **Ventajas:** Alta fiabilidad, transacciones ACID.
  - **Desventajas:** Menos escalable que bases de datos NoSQL.

## Explicación de Conceptos Clave
### **Cookies HTTPOnly y HTTPS Only**
Las **cookies HTTPOnly** son cookies que no pueden ser accedidas mediante JavaScript del lado del cliente, lo que reduce el riesgo de ataques **XSS (Cross-Site Scripting)**. Si además se marca como **Secure**, solo se transmitirá en conexiones HTTPS.

### **Algoritmo AES (Advanced Encryption Standard)**
AES es un algoritmo de cifrado simétrico utilizado para proteger datos. Opera con claves de **128, 192 o 256 bits**, asegurando alta seguridad contra ataques de fuerza bruta.

### **JWT y su Uso en Autenticación**
JWT (**JSON Web Token**) es un estándar que permite la autenticación segura sin necesidad de almacenar sesiones en el servidor. Contiene tres partes:
1. **Header:** Define el tipo de token y algoritmo de cifrado.
2. **Payload:** Contiene los datos del usuario.
3. **Signature:** Se usa para verificar que el token no ha sido alterado.

## Diagrama de Secuencia de Autenticación JWT

![Image](https://github.com/user-attachments/assets/a16915ad-4ea0-4e07-8983-7e3bb3aa31d7)

## Instrucciones de Instalación y Ejecución
### **1️. Clonar el Repositorio**
```sh
git clone https://github.com/joshi-debb/Practicas-SA-B-202006353.git
cd P2
```

### **2. Instalar Dependencias**

```sh
cd backend
npm install
```
```sh
cd frontend
npm install
```

### **3. Ejecutar script .sql en entorno preferido**

```sh
CREATE DATABASE IF NOT EXISTS practica2;

USE practica2;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user VARCHAR(255) NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL
);
```

### **4. Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del backend y agrega:
```env
JWT_SECRET=tu-clave-secreta-y-segura
JWT_EXPIRATION=1h
JWT_GRACE_PERIOD=10m
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=practica2
```

### **5. Ejecutar el Servidor**

```sh
cd backend
npm start
```

### **6. Ejecutar el fronted**

```sh
cd frontend
npm run dev
```

