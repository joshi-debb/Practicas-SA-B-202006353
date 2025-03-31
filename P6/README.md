# Documentación - Práctica 6

## Solucion Arquitectónica multi-cloud
He dicido implementar una solución arquitectónica multi-cloud utilizando Google Cloud Platform (GCP) y Amazon Web Services (AWS). La arquitectura se basa en la implementación de un clúster de Kubernetes en GCP y el despliegue de los 4 microservicios de aplicación en contenedores. Cada aplicacion se conecta a una base de datos alojada en AWS, lo que permite aprovechar las capacidades de ambas plataformas.

He elegido Google Cloud Platform (GCP) como principal plataforma de nube para orquestar mis contenedores con Google Kubernetes Engine (GKE). GCP ofrece un entorno altamente escalable, con integraciones nativas (como Artifact Registry para las imágenes de contenedor).

AWS se utiliza para alojar las bases de datos, aprovechando su robustez y confiabilidad en el manejo de datos. La comunicación entre los microservicios y las bases de datos se realiza a través de conexiones seguras, garantizando la integridad y confidencialidad de los datos.

### Servicios Utilizados en la Solución

#### Google Kubernetes Engine (GKE)
Servicio de orquestación de contenedores que permite desplegar aplicaciones en un clúster administrado de Kubernetes.
- Función: Ejecutar los pods con nuestras aplicaciones (equipos, ubicaciones, reportes, mantenimiento).
- Ventajas: Manejo automático de actualización de nodos, alta disponibilidad, y escalado sencillo.

#### Amazon RDS
Servicio de bases de datos relacionales en AWS.
- Función: Alojar la base de datos (MySQL, PostgreSQL, etc.) con la que se conecta la aplicación.
- Ventajas: Escalado de capacidad, respaldo automático, y alta disponibilidad.

#### Artifact Registry (GCP)
Registro privado para almacenar imágenes de contenedor (Docker u OCI).
- Función: Almacenar y versionar nuestras imágenes Docker de forma segura.
- Ventajas: Integración nativa con GKE, control de acceso mediante IAM.

#### Kubernetes (en GKE)
Recursos utilizados:
- Deployments: Administran los pods y sus actualizaciones.
- Services: Exponen los puertos internos o externos.
- Ingress (con NGINX): Gestiona rutas HTTP/HTTPS entrantes.
- HPA: Escalado horizontal de pods según métricas de carga.

--- 

### Instalar el cliente gcloud CLI

    (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
    & $env:Temp\GoogleCloudSDKInstaller.exe

### Habilitar el API de Kubernetes Engine
    
    gcloud services enable container.googleapis.com

### Instalar kubectl y configurar el acceso al cluster

    gcloud components install kubectl

    gcloud init
    gcloud auth login
    gcloud config set project <project-id> # <project-id> es el ID del proyecto de GCP
    gcloud config set compute/zone us-central1-b
    gcloud config set compute/region us-central1
    
    gcloud container clusters get-credentials my-frist-cluster --zone us-central1
    kubectl config set-context --current --namespace=sa-p6

### Habilitar Artifact Registry

    gcloud services enable artifactregistry.googleapis.com

    - Crear un repositorio de Docker
        gcloud artifacts repositories create sa-p6 --repository-format=docker --location=us-central1 --description="sa-p6 repository"

    - Autenticar la máquina local con Artifact Registry
        gcloud auth configure-docker us-central1-docker.pkg.dev

    - Construir y subir la imagen de Docker
        docker build -t us-central1-docker.pkg.dev/awesome-icon-454901-t8/sa-p6/equipo:latest .
        docker push us-central1-docker.pkg.dev/awesome-icon-454901-t8/sa-p6/equipo:latest

    - Verificar las imágenes subidas
        gcloud artifacts docker images list us-central1-docker.pkg.dev/awesome-icon-454901-t8/sa-p6

    - Elimina una imagen con un tag específico:
        gcloud artifacts docker images delete us-central1-docker.pkg.dev/awesome-icon-454901-t8/sa-p6/equipo:latest --force-delete-tags --quiet
    
### Habilitar/Instalar Ingress via YAML (estático)

    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.7.1/deploy/static/provider/cloud/deploy.yaml

---

## Diagrama de Arquitectura (Multi-Cloud Architecture)

![Image](https://github.com/user-attachments/assets/4a807c69-08df-4a88-9250-ecaef9ba6678)


---

## Comandos Utilizados

- Aplicar configuracion de un archivo *.yaml*
    ```
    kubectl apply -f k8s/namespace.yaml -n sa-p6
    ```

- Aplicar configuracion de todos los archivos *.yaml*
    ```
    kubectl apply -f k8s/. -n sa-p6
    ```

- Mostrar toda la informacion del namespace
    ```
    kubectl get all -n sa-p6
    ```

- Mostrar los pods del namespace
    ```
    kubectl get pods -n sa-p6
    ```
- Mostrar los servicios del namespace
    ```
    kubectl get services -n sa-p6
    ```

- Mostrar los deployments del namespace
    ```
    kubectl get deployments -n sa-p6
    ```
    
- Ejecutar un pod
    ```
    kubectl exec -n sa-p6 -it equipos-65fb7b457f-swhf9 -- sh
    ```
- Obtener logs de un pod
    ```
    kubectl logs -n sa-p6 job/registro-cronjob-29056370
    ```

- Obtener informacion del estado de un pod
    ```
    kubectl describe pod equipos-65fb7b457f-swhf9 -n sa-p6
    ```

- Reiniciar un deployment
    ```
    kubectl rollout restart deployment equipos -n pa-p6
    ```

- Eliminar toda la informacion del namespace
    ```
    kubectl delete all -n sa-p6
    ```

- Eliminar un pod del namespace
    ```
    kubectl delete pod/equipos-86cfb596fd-5xbss -n sa-p6
    ```

- Eliminar un servicio del namespace
    ```
    kubectl delete service/equipos -n sa-p6
    ```

- Eliminar un deployment del namespace
    ```
    kubectl delete deployment.apps/equipos -n sa-p6
    ```

## Listado de Configuración YAML

    k8s/...





