# Documentación - Práctica 6

### Install the gcloud CLI

    (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
    & $env:Temp\GoogleCloudSDKInstaller.exe

### Habilitar el API de Kubernetes Engine
    
        gcloud services enable container.googleapis.com

### Install kubectl and configure cluster access

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
    kubectl exec -it mysql-576d9d6dd-lcvr9 -n pa-p6 -- sh
    mysql -u root -p

    kubectl exec -it mongodb-745f6f5448-jhvvs -n sa-p6 -- sh
    mongosh
    ```

- Obtener informacion del estado de un pod
    ```
    kubectl describe pod mysql-576d9d6dd-lcvr9 -n sa-p6
    ```

- Reiniciar un deployment
    ```
    kubectl rollout restart deployment equipos -n pa-p6
    ```

- Verificacion de Logs de un pod
    ```
    kubectl logs api-gateway-5bb97cbf57-t2bt2 -n sa-p6
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

- Listar ConfigMaps y Secrets en el namespace
    ```
    kubectl get configmaps -n sa-p6
    kubectl get secrets -n sa-p6
    ```

- Exponer una url del cluster
    ```
    minikube service api-gateway -n sa-p6 --url 
    ```

- Habilitar Ingress en Minikube
    ```
    minikube addons enable ingress

    Linux/Mac: /etc/hosts
    Windows: C:\Windows\System32\drivers\etc\hosts
    <ip> <dominio>
    ```
- Habilitar tunnel para Ingress
    ```
    Minikube Tunnel
    ```

## Listado de Configuración YAML

    k8s/...

## Diagrama de Arquitectura

![Image](https://github.com/user-attachments/assets/02073717-d4e6-4e88-93b6-d78c4d57625d)

## Kubernetes

Es un sistema de orquestación de contenedores que permite automatizar la implementación, escalabilidad y administración de aplicaciones en contenedores. Facilita la gestión de múltiples contenedores distribuidos en nodos, asegurando alta disponibilidad y recuperación automática ante fallos.

## Deployment

Es un objeto de Kubernetes que gestiona la implementación y actualización de aplicaciones en contenedores. Define cuántas réplicas de un Pod deben existir y maneja su ciclo de vida, asegurando disponibilidad y recuperación automática en caso de fallos.

Sus partes principales son:
- Pods: Unidades básicas que ejecutan los contenedores.
- ReplicaSet: Controla el número de réplicas de los Pods y asegura que siempre se mantenga la cantidad deseada.
- Strategy (Estrategia de despliegue): Define cómo se actualizan los Pods (rolling update, recreate, etc.).
- Selector: Define los Pods administrados por el Deployment.

Asegura que la aplicación esté disponible y pueda escalar cuando sea necesario.

## Service

Es un objeto que define una política de acceso a un conjunto de Pods. Permite la comunicación entre diferentes componentes dentro del clúster, proporcionando un punto de acceso estable a los Pods, aunque estos se reemplacen o escalen.

Tipos de Services:
- ClusterIP: Accesible solo dentro del clúster.
- NodePort: Expone el servicio a través de un puerto en cada nodo del clúster.
- LoadBalancer: Usa un balanceador de carga externo (en entornos en la nube).

## Cronjob
Es un objeto que permite ejecutar tareas programadas de forma automática en intervalos de tiempo definidos (como un cron en Linux). Se usa para tareas como copias de seguridad, envío de reportes y limpieza de registros.



