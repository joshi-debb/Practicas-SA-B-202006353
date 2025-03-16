# Inventario de Equipos de Oficina
Sistema para administrar el inventario de computadoras, impresoras y otros equipos en una oficina.

### Microservicios:
1. Equipos: Registrar y actualizar equipos.
2. Ubicaciones: Monitorear en qué oficina o persona está cada equipo.
3. Mantenimiento: Gestionar mantenimientos preventivos/correctivos (GraphQL).
4. Reportes: Generar informes de disponibilidad y estado de equipos (GraphQL).

# Diagrama de Arquitectura

![Image](https://github.com/user-attachments/assets/1c387e16-814b-46c8-b1d6-c23ec4dc223c)

# Contratos de los Microservicios

https://documenter.getpostman.com/view/38342161/2sAYkBt1iq

# Dockerfile de cada microservicio.

### Equipos

```Dockerfile
FROM python:3.10-alpine

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8081

CMD ["python", "src/server.py"]
```

Ejecución:

```bash
docker build -t equipos .
docker run --name equipos-app --network my-network -p 8081:8081 equipos
```

### Ubicaciones

```Dockerfile
FROM python:3.10-alpine

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8082

CMD ["python", "src/server.py"]
```

Ejecución:

```bash
docker build -t ubicaciones .
docker run --name ubicaciones-app --network my-network -p 8082:8082 ubicaciones
```

### Mantenimiento

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 8083

CMD [ "node", "src/server.js" ]
```

Ejecución:

```bash
docker build -t mantenimiento .
docker run --name mantenimiento-app --network my-network -p 8083:8083 mantenimiento
```

### Reportes

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

EXPOSE 8084

CMD [ "node", "src/server.js" ]
```

Ejecución:

```bash
docker build -t reportes .
docker run --name reportes-app --network my-network -p 8084:8084 reportes
```

# Docker Engine

```bash
docker network create my-network

docker run --name mysql-container --network my-network -e MYSQL_ROOT_PASSWORD=1234 -p 3307:3306 -d mysql:latest

mysql -u root -p    
    execute ./db.sql
```

# Diagrama ER de las bases de datos utilizadas

### Equipos

![Image](https://github.com/user-attachments/assets/b60b6dfe-acfd-4fdd-80ec-70151483caa2)

### Ubicaciones

![Image](https://github.com/user-attachments/assets/8298d2ae-d902-447b-8960-840b1395fc54)

### Mantenimiento

![Image](https://github.com/user-attachments/assets/14037220-a0f7-44ab-90a0-6aaf5ee1dfdc)

### Reportes

![Image](https://github.com/user-attachments/assets/730bbb7f-e4de-4c58-b470-420714eb9102)