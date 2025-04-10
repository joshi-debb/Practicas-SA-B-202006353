# Guía de configuración del clúster utilizando kops
Este documento proporciona una guía paso a paso para configurar un clúster de Kubernetes utilizando kops. Kops es una herramienta que facilita la creación, configuración y gestión de clústeres de Kubernetes en la nube.

## 1. Requisitos previos
- Tener instalado AWS CLI y configurado con las credenciales de acceso.
    - Para instalar AWS CLI, puedes seguir la [guía oficial de instalación](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
    - Para configurar AWS CLI, utiliza el siguiente comando:
      ```bash
      aws configure
      ```
      Proporciona tu Access Key ID, Secret Access Key, región y formato de salida preferido.


- Tener instalado kops.
    - Para instalar kops, puedes seguir la [guía oficial de instalación](https://kops.sigs.k8s.io/getting_started/install/).
    
    - Para windows debes descargar el kops-windows-amd64 y renombrarlo a kops.exe y moverlo a la carpeta de binarios de tu sistema.

    - Para verificar la versión instalada, utiliza el siguiente comando:
      ```bash
      kops version
      ```

- Tener instalado kubectl.
    - Para instalar kubectl, puedes seguir la [guía oficial de instalación](https://kubernetes.io/docs/tasks/tools/install-kubectl/).
    
    - Para verificar la versión instalada, utiliza el siguiente comando:
      ```bash
      kubectl version --client
      ```

## 2. Crear un Usuario IAM
- Accede a la consola de AWS y navega a IAM (Identity and Access Management).
- Crea un nuevo usuario IAM con acceso programático.
- Asigna permisos al usuario. Puedes usar la política administrada `AdministratorAccess` para otorgar acceso completo a AWS, o crear una política personalizada con los permisos necesarios para kops.
- Descarga las credenciales del usuario (Access Key ID y Secret Access Key) y guárdalas en un lugar seguro.
- Configura las credenciales de AWS CLI utilizando el comando `aws configure` y proporciona las credenciales del nuevo usuario IAM.
- Verifica que las credenciales estén configuradas correctamente ejecutando el siguiente comando:
  ```bash
  aws sts get-caller-identity
  ```
  Esto debería mostrarte la información del usuario IAM que acabas de crear.

## 3. Crear un Bucket de S3
- Crea un bucket de S3 para almacenar la configuración del clúster y los archivos de estado.
- Puedes crear el bucket utilizando la consola de AWS o el siguiente comando de AWS CLI:
  ```bash
  aws s3api create-bucket --bucket sa-practica7-kops-state --region us-east-1
  ```
## 4. Configurar el Bucket de S3
- Configura el bucket de S3 como el backend para kops. Esto se hace estableciendo la variable de entorno `KOPS_STATE_STORE` con la URL del bucket de S3.

    ```bash
    $env:KOPS_STATE_STORE = "s3://sa-practica7-kops-state"
    ```

- Verifica que la variable de entorno esté configurada correctamente ejecutando el siguiente comando:
    ```bash
    echo $KOPS_STATE_STORE
    ```
    Esto debería mostrar la URL del bucket de S3 que acabas de crear.

## 5. Crear un Clúster de Kubernetes
- Asegúrate de que tienes acceso a la región de AWS donde deseas crear el clúster.
   ```bash
   aws events list-rules --region us-east-1
    ```

- Debes llamar la variable de entorno `KOPS_STATE_STORE` antes de crear el clúster. Puedes hacerlo ejecutando el siguiente comando:
    ```bash
    $env:KOPS_STATE_STORE = "s3://sa-practica7-kops-state"
    ```


- Crea un clúster de Kubernetes utilizando kops. Puedes hacerlo utilizando el siguiente comando:
    ```bash
    kops create cluster `
        --cloud=aws `
        --zones=us-east-1a `
        --name=sa-practica7.k8s.local `
        --dns=none `
        --master-size=t3.small `
        --node-size=t3.small `
        --node-count=1 `
        --yes
    ```

    nota: espera al menos 10 minutos para que el clúster se cree correctamente.

- Verifica que el clúster se haya creado correctamente ejecutando el siguiente comando:
    ```bash
    kops validate cluster --wait 10m
    ```
    Esto debería mostrarte información sobre el clúster y su estado.

- Verifica que kubectl esté configurado correctamente para interactuar con el clúster ejecutando el siguiente comando:
    ```bash
    kubectl get nodes
    ```
    Esto debería mostrarte la lista de nodos en el clúster.

## 6. Despliegue del Clúster

- Desde kubectl selecciona el cluster de kops
    ```bash
    kubectl config use-context sa-practica7.k8s.local
    ```

- Crear el namespace desde el archivo yaml
    ```bash
    kubectl apply -f k8s/namespace.yaml
    ```
- Crear el deployment desde el archivo yaml
    ```bash
    kubectl apply -f k8s/micro-servicios/. -n sa-p7
    ```
- Agregar el ingress
    ```bash
    kubectl apply -f k8s/ingress.yaml -n sa-p7
    ```
- Habilitar/Instalar Ingress via YAML (estático)
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.7.1/deploy/static/provider/cloud/deploy.yaml
    ```
- Verifica que el ingress esté funcionando correctamente ejecutando el siguiente comando:
    ```bash
    kubectl get ingress -n sa-p7
    ```
    Esto deberia mostrar un servicio de aws

---

# Archivos YAML para el despliegue de los microservicios en Kubernetes

- La carpeta `k8s/namespace.yaml` contiene la definición del namespace `sa-p7` donde se desplegarán los microservicios. Asegúrate de que el namespace esté creado antes de aplicar los demás archivos.

- La carpeta `k8s/ingress.yaml` contiene la definición del ingress para el clúster. Asegúrate de que el ingress esté configurado correctamente antes de aplicarlo al clúster.

- La carpeta `k8s/micro-servicios` contiene los archivos YAML necesarios para el despliegue de los microservicios en Kubernetes. Asegúrate de que los archivos estén configurados correctamente antes de aplicarlos al clúster.

---

# Configuración del pipeline CI/CD

El archivo Jenkinsfile contiene la definición del pipeline CI/CD para el proyecto. Asegúrate de que el archivo esté configurado correctamente antes de ejecutarlo.

- Crear un Personal Access Token en GitHub con permisos de `repo` y `workflow` para permitir que Jenkins acceda al repositorio y ejecute el pipeline.

    - Agregar el Personal Access Token a Jenkins como una credencial de tipo user y password guardando el token en el password y con el ID `github-credentials`.

- Crear una cuenta de servicio en GCP para el Artifact Registry y descargar la clave JSON. Agregar la clave JSON a Jenkins como una credencial de tipo "Secret file" con el ID `gcp-access-token`.
    - Se debe crear un repositorio de Artifact Registry en GCP para almacenar las imágenes de Docker. Puedes crear el repositorio utilizando la consola de GCP o el siguiente comando de gcloud:
    ```bash
    gcloud artifacts repositories create sa-p7 --repository-format=docker --location=us-central1 --description="sa-p7 repository"
    ```
    - Configura el acceso a Artifact Registry utilizando el siguiente comando:
    ```bash
    gcloud auth configure-docker us-central1-docker.pkg.dev
    ```

- Agregar la configuracion de kubeconfig-kops a Jenkins como una credencial de tipo "Secret file" con el ID `kubeconfig-kops`.

    - Para obtener el kubeconfig-kops, puedes ejecutar el siguiente comando:
    ```bash
    kops export kubecfg --name sa-practica7.k8s.local
    ```

    - Ubicación del archivo kubeconfig-kops:
    ```bash
    ~/.kube/config      #windows 'C:\Users\why96\.kube\config'
    ```

---

# Descripción de cómo funciona el pipeline

- Referencia a [./Jenkinsfile](./Jenkinsfile) 

### 1. Declaración y Configuración Inicial

Se define `agent any`, lo que permite que el pipeline se ejecute en cualquier nodo disponible dentro del entorno de Jenkins.

Se configuran variables esenciales que se utilizan a lo largo del proceso:
  - `DOCKER_REGISTRY`: URL del registro de Docker en Google Cloud.
  - `K8S_NAMESPACE`: Namespace en Kubernetes para los despliegues.
  - `REGISTRY_URL`: URL base del registro.


### 2. Etapa "Checkout"

Realizar la extracción del código fuente desde el repositorio configurado en el job, utilizando el comando `checkout scm`.


### 3. Etapa "Login to Artifact Registry"
Usa las credenciales (`gcp-access-token`) para obtener el token de acceso y ejecuta los comandos `gcloud` para:
- Activar la cuenta de servicio.
- Configurar la cuenta y el proyecto en Google Cloud.
- Configurar el acceso a Docker mediante `gcloud auth configure-docker`.


### 4. Etapa "Build Images"

Se define una lista de microservicios: `equipos`, `mantenimiento`, `reportes` y `ubicaciones` y para cada servicio:
- Se determina la ruta del servicio y de su correspondiente `Dockerfile`.
- Se construye la imagen con el comando `docker.build`, etiquetándola como `latest`.

### 5. Etapa "Test Images"
Ejecutar pruebas sobre las imágenes construidas para verificar su correcto funcionamiento.
- Para los servicios basados en Node.js (como `mantenimiento` y `reportes`), se ejecuta `npm test`.
- Para los servicios en Python (como `equipos` y `ubicaciones`), se ejecuta `python3 -m unittest discover`.

### 6. Etapa "Push Images"
Publicar las imágenes Docker creadas y probadas en el Artifact Registry de Google Cloud.
- Se itera nuevamente sobre la lista de microservicios.
- Se ejecuta el comando `docker push` para enviar cada imagen al registro, utilizando la etiqueta `latest`.


### 7. Etapa "Deploy to KOPS cluster"

Realiza el despliegue de los microservicios en el clúster de Kubernetes gestionado mediante KOPS. Usa las credenciales (`kubeconfig-kops`) para acceder al clúster Kubernetes.
- Se actualiza la imagen del deployment usando `kubectl set image`.
- Se monitorea el despliegue con `kubectl rollout status` para asegurarse de que la actualización se haya realizado exitosamente.

### 8. Sección Post

  Se utiliza `cleanWs()` para limpiar el workspace, evitando residuos que puedan afectar futuras ejecuciones.
