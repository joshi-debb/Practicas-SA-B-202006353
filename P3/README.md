# Diagrama de la arquitectura

![Image](https://github.com/user-attachments/assets/3e1c7829-266d-4c70-9fd7-7d1f90fb9e7c)

---

# Diseño de microservicios


## 1. Microservicio de Autenticación Interna

### **Responsabilidades**
- Gestionar la autenticación y autorización interna, complementando el servicio OAuth externo.
- Administrar usuarios, roles y permisos.
- Emitir y validar tokens (por ejemplo, JWT) para asegurar la comunicación entre microservicios.

### **Funcionalidades y Endpoints**
- **Autenticación de Usuarios:** `POST /login`   
  Recibe credenciales (usuario y contraseña), las valida contra la base de datos interna y emite un token JWT.   

- **Validación de Tokens:** `GET /validate`   
  Valida el token JWT enviado en el header de autorización para garantizar el acceso a recursos protegidos.
  
- **Gestión de Usuarios y Roles (Opcional):** `POST /register`   
  Permite el registro de nuevos usuarios y la asignación de roles específicos.
  
- **Integración con Servicio OAuth Externo:**  
  Realiza solicitudes HTTP/REST para validar o sincronizar tokens con el servicio OAuth externo.

### **Tecnologías**
- **Lenguaje:** Node.js
- **Framework:** Express
- **Base de Datos:** AWS RDS (MySQL)
- **Librerías:** 
  - `jsonwebtoken` para el manejo de JWT.
  - `bcrypt` para encriptación de contraseñas.
  - `express-validator` para la validación de datos.
- **Servicios:**
  - AWS RDS para el almacenamiento de los datos de autenticación.
  - Integración a través de AWS API Gateway para exponer el servicio de forma segura.

## 2. Microservicio de Planillas

### Responsabilidades
- Procesar y validar planillas en formato CSV.
- Coordinar el flujo de aprobación en tres pasos.
- Publicar eventos (por ejemplo, "Planilla Aprobada") en el bus de eventos para activar acciones en otros microservicios.
- Integrarse con un servicio financiero externo para iniciar el cierre de planillas aprobadas.

### Funcionalidades y Endpoints
- **Carga y Validación de Planillas:** `POST /planillas/cargar`  
  Recibe un archivo CSV, lo valida y extrae la información necesaria.
  
- **Consulta de Planilla:** `GET /planillas/{id}`  
  Permite consultar el estado y detalles de una planilla específica.
  
- **Actualización de Estado / Aprobación:** `PUT /planillas/{id}/aprobar`    
  Actualiza el estado de la planilla durante el proceso de aprobación.
  
- **Publicación de Eventos:**    
  Una vez aprobada la planilla, se publica un evento en AWS MSK para que los microservicios de Notificaciones y Logs lo consuman.
  
- **Integración con Servicio de Finanzas Externo:**  
  Envía una solicitud HTTP/REST al servicio financiero para iniciar el cierre de la planilla.

### Tecnologías
- **Lenguaje:** Node.js
- **Framework:** Express
- **Base de Datos:** AWS RDS (MySQL)
- **Librerías:** 
  - `csv-parser` para el procesamiento de archivos CSV.
  - `multer` para la carga de archivos.
  - `axios` para llamadas HTTP a servicios externos.
- **Servicios:**
  - AWS API Gateway para exponer sus endpoints.
  - AWS MSK (Managed Streaming for Apache Kafka) para la publicación de eventos.
  - Integración con un servicio financiero externo mediante HTTP/REST.

## 3. Microservicio de Almacenamiento

### Responsabilidades
- Gestionar la subida, almacenamiento y descarga de archivos CSV.
- Garantizar el almacenamiento seguro y escalable de los archivos.

### Funcionalidades y Endpoints
- **Subida de Archivos:** `POST /archivos/subir`  
  Recibe un archivo CSV (multipart/form-data), lo almacena y devuelve un identificador o URL.
  
- **Descarga de Archivos:** `GET /archivos/{id}`   
  Permite recuperar el archivo almacenado mediante su identificador.

### Tecnologías
- **Lenguaje:** Node.js
- **Framework:** Express
- **Almacenamiento:** AWS S3 Bucket
- **Librerías:** 
  - `aws-sdk` para interactuar con AWS S3.
  - `multer-s3` para la carga de archivos directamente a S3.
- **Servicios:**
  - AWS API Gateway para exponer los endpoints.
  - AWS S3 para el almacenamiento de archivos.

## 4. Microservicio de Notificaciones

### Responsabilidades
- Enviar notificaciones (por ejemplo, correos electrónicos) a los usuarios cuando se aprueben planillas.
- Administrar plantillas y contenido dinámico para los mensajes de notificación.

### Funcionalidades y Endpoints
- **Envío de Notificaciones:** `POST /notificaciones/enviar`   
  Recibe un payload con destinatarios, asunto y mensaje; utiliza un servicio SMTP para enviar los correos.
  
- **Suscripción a Eventos:**  
  Se suscribe a eventos (como "Planilla Aprobada") en AWS MSK para activar el envío automático de notificaciones.

### Tecnologías
- **Lenguaje:** Node.js
- **Framework:** Express
- **Librerías:** 
  - `nodemailer` para el envío de correos.
  - `aws-sdk` para integración con AWS SES (si se opta por un servicio SMTP gestionado por AWS).
- **Servicios:**
  - AWS API Gateway para exponer los endpoints.
  - AWS MSK para la recepción de eventos.
  - AWS SES o un servidor SMTP para el envío de correos.

## 5. Microservicio de Logs

### Responsabilidades
- Registrar y almacenar de forma centralizada todos los eventos críticos y auditorías del sistema.
- Facilitar la consulta y análisis de logs para fines de seguridad y trazabilidad.

### Funcionalidades y Endpoints
- **Registro de Eventos:** `POST /logs/registrar`  
  Recibe eventos (por ejemplo, cambios de estado, errores) y los almacena.
  
- **Consulta de Logs:** `GET /logs`  
  Permite consultar y filtrar logs por fecha, usuario o tipo de evento.
  
- **Suscripción a Eventos:**  
  Se suscribe a eventos en AWS MSK para registrar automáticamente eventos relevantes.

### Tecnologías
- **Lenguaje:** Node.js
- **Framework:** Express
- **Base de Datos:** AWS DocumentDB (compatible con MongoDB)
- **Librerías:** 
  - `mongoose` para interactuar con DocumentDB.
  - `express-validator` para validación de datos.
- **Servicios:**
  - AWS API Gateway para exponer el servicio.
  - AWS MSK para recibir eventos.

## Servicios de Infraestructura en AWS

### API Gateway con AWS
- **Descripción:**  
  AWS API Gateway se utiliza para exponer los endpoints REST de los microservicios, proporcionando escalabilidad, seguridad y control centralizado de las APIs.
- **Funcionalidades:**
  - Autenticación y autorización de solicitudes.
  - Enrutamiento de tráfico a microservicios desplegados en AWS EKS.
  - Monitoreo y gestión de tráfico.

### AWS Elastic Kubernetes Service (EKS)
- **Descripción:**  
  AWS EKS es un servicio gestionado de Kubernetes que facilita el despliegue y la orquestación de contenedores.
- **Funcionalidades:**  
  - Despliegue y escalado de pods independientes para cada microservicio.
  - Alta disponibilidad y gestión automatizada de clúster.
  - Integración con otros servicios de AWS (IAM, CloudWatch, etc.).

### AWS Managed Streaming for Apache Kafka (MSK)
- **Descripción:**  
  AWS MSK es el servicio gestionado de Apache Kafka que facilita la transmisión y el procesamiento de eventos.
- **Funcionalidades:**
  - Publicación y suscripción de eventos de forma asíncrona.
  - Alta disponibilidad y escalabilidad para la gestión de flujos de eventos.
  
### AWS Relational Database Service (RDS)
- **Descripción:**  
  AWS RDS permite desplegar y administrar bases de datos relacionales (como MySQL) de forma gestionada.
- **Funcionalidades:**
  - Soporte para alta disponibilidad, backups automáticos y escalabilidad.
  - Utilizado para el almacenamiento de datos de los microservicios de Autenticación y Planillas.

### AWS DocumentDB para MongoDB (Logs)
- **Descripción:**  
  AWS DocumentDB es un servicio gestionado compatible con MongoDB, ideal para almacenar grandes volúmenes de datos no estructurados, como logs y auditorías.
- **Funcionalidades:**
  - Almacenamiento y consulta eficiente de logs.
  - Escalabilidad y alta disponibilidad para auditorías.

### AWS S3 Bucket (Almacenamiento)
- **Descripción:**  
  AWS S3 es un servicio de almacenamiento de objetos que ofrece alta durabilidad y escalabilidad para archivos.
- **Funcionalidades:**
  - Almacenamiento seguro de archivos CSV y otros documentos.
  - Integración mediante API para subir y descargar archivos.
  - Se utiliza en el microservicio de Almacenamiento para gestionar archivos.
  
---

# Descripción de la solución

La solución propuesta aborda los problemas del sistema monolítico actual (lento durante altas demandas y difícil de escalar) mediante la migración a una arquitectura basada en microservicios.

### Contexto Actual
El sistema de planillas actual es monolítico y presenta lentitud en épocas de alta demanda (quincenas, fin de mes, pago de aguinaldo) debido a la sobrecarga en un único proceso centralizado.

**Desafíos:**  
  - Dificultad para escalar y actualizar componentes de forma independiente.
  - Gestión compleja de las transacciones y del flujo de aprobación.
  - Riesgo de cuellos de botella y fallos en cascada.

### Objetivos de la Solución

- Permitir el escalado independiente de cada funcionalidad del sistema.
  
- Facilitar la actualización de componentes sin afectar al sistema completo.
  
- Asegurar que un fallo en un componente no afecte el funcionamiento global mediante la separación de responsabilidades.
  
- Registrar todos los eventos críticos para mejorar la seguridad y el seguimiento de procesos.

### Propuesta de Solución

La solución se compone de la implementación de múltiples microservicios especializados, cada uno con responsabilidades definidas, y la integración de servicios gestionados de AWS. Esto permite una combinación de comunicación síncrona (vía REST) y asíncrona (mediante eventos en AWS MSK) para lograr una operación ágil y robusta.

### Arquitectura y Componentes Clave

**API Gateway con AWS API Gateway:**  
- **Función:** Punto único de entrada que autentica, enruta y protege las solicitudes REST.
- **Beneficio:** Centraliza la seguridad y permite la gestión y monitoreo de las APIs.

**Microservicios Desplegados en AWS EKS:**  
- Cada microservicio (Autenticación, Planillas, Almacenamiento, Notificaciones, Logs) se despliega de forma independiente en contenedores gestionados a través de AWS EKS, lo que permite escalabilidad y actualización independiente.

**Comunicación Asíncrona con AWS MSK:**  
- Se utiliza AWS Managed Streaming for Apache Kafka (MSK) para la publicación y suscripción de eventos críticos, como la aprobación de planillas.
- **Beneficio:** Permite el procesamiento en segundo plano (por ejemplo, envío de notificaciones y registro de logs) sin afectar la respuesta inmediata a los usuarios.

**Almacenamiento de Archivos con AWS S3:**  
- Los archivos CSV se almacenan en AWS S3, garantizando alta durabilidad, disponibilidad y escalabilidad.

**Persistencia de Datos con AWS RDS y AWS DocumentDB:**  
- **AWS RDS (MySQL):** Utilizado por microservicios como Autenticación y Planillas para almacenar datos relacionales.
- **AWS DocumentDB:** Se emplea para el microservicio de Logs, aprovechando su compatibilidad con MongoDB para gestionar grandes volúmenes de datos no estructurados.

**Integración con Servicios Externos:**  
- **Servicio OAuth Externo:** Para la autenticación inicial y validación de tokens.
- **Servicio Financiero Externo:** Para el cierre y procesamiento financiero de las planillas aprobadas.

### Diagrama de caso de uso

![Image](https://github.com/user-attachments/assets/aae13055-520c-445a-bee6-196baceb4058)

### Beneficios de la Solución

- Los microservicios independientes permiten escalar solo aquellos componentes con alta demanda, optimizando recursos y costos.

- La separación de componentes y la comunicación asíncrona a través de AWS MSK minimizan el impacto de fallos aislados.

- La arquitectura modular permite realizar actualizaciones o cambios en un microservicio sin afectar a todo el sistema.

- La utilización de tokens JWT y la centralización de logs en AWS DocumentDB aseguran un sistema seguro y fácilmente auditable.

---

# Digramas ER (Entidad Relacion)

### Base de Datos Microservicio Autenticacion

Script .sql para la base de datos:

    CREATE DATABASE IF NOT EXISTS AuthDB;
    USE AuthDB;

    CREATE TABLE Usuario (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      passwordHash VARCHAR(255) NOT NULL,
      estado VARCHAR(20) NOT NULL
    );

    CREATE TABLE Rol (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(50) NOT NULL,
      descripcion VARCHAR(255)
    );

    CREATE TABLE UsuarioRol (
      usuarioId INT NOT NULL,
      rolId INT NOT NULL,
      PRIMARY KEY (usuarioId, rolId),
      CONSTRAINT fk_usuario FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE CASCADE,
      CONSTRAINT fk_rol FOREIGN KEY (rolId) REFERENCES Rol(id) ON DELETE CASCADE
    );

Diagrama Entidad Relacion:

![Image](https://github.com/user-attachments/assets/ab741ca9-58bd-447b-9453-dc997845d788)

### Base de Datos Microservicio Planillas

Script .sql para la base de datos:

    CREATE DATABASE IF NOT EXISTS PlanillasDB;
    USE PlanillasDB;

    CREATE TABLE Planilla (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombreArchivo VARCHAR(255) NOT NULL,
      rutaArchivo VARCHAR(255) NOT NULL,
      estadoAprobacion VARCHAR(20) NOT NULL,
      fechaCreacion DATE NOT NULL,
      fechaAprobacion DATE,
      idUsuarioCreador INT NOT NULL
    );

    CREATE TABLE DetallePlanilla (
      id INT AUTO_INCREMENT PRIMARY KEY,
      planillaId INT NOT NULL,
      campo1 VARCHAR(255),
      campo2 VARCHAR(255),
      -- Otros campos adicionales según la estructura del CSV se pueden agregar aquí
      CONSTRAINT fk_planilla FOREIGN KEY (planillaId) REFERENCES Planilla(id) ON DELETE CASCADE
    );

Diagrama Entidad Relacion:

![Image](https://github.com/user-attachments/assets/b7bd7e7c-47d8-4319-bac6-9d0e2e0b89f8)

### Base de Datos Microservicio Logs

Colección: LogEventos

    _id: ObjectId (Primary Key)
    fechaEvento: Date
    tipoEvento: String
    idUsuario: ObjectId o Number
    descripcion: String

Diagrama de la Coleccion:

![Image](https://github.com/user-attachments/assets/dc0056d0-5814-49a3-9396-daa1d5d17b99)
