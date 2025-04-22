# Documentación - Práctica 8

## Instalación y Configuración

--- 
### ELK Stack

Preparar el namespace `sa-p8`:

```bash
kubectl create namespace sa-p8
```

Añadir repositorio de Helm:

```bash
helm repo add elastic https://helm.elastic.co
helm repo update
```

Archivos de valores (.yaml):

```yaml
# elasticsearch-values.yaml
clusterName: "elasticsearch"
nodeGroup: "master" 
replicas: 1
minimumMasterNodes: 1

resources:
  requests:
    cpu:    "250m"
    memory: "2Gi"
  limits:
    cpu:    "500m"
    memory: "4Gi"

volumeClaimTemplate:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 20Gi

persistence:
  enabled: true

testFramework:
  enabled: false

updateStrategy: OnDelete
```

```yaml
# filebeat-values.yaml
filebeatConfig:
  filebeat.yml: |
    filebeat.inputs:
      - type: container
        paths:
          - /var/log/containers/*.log
        processors:
          - add_kubernetes_metadata:
              in_cluster: true

    output.logstash:
      hosts: ["logstash-logstash:5044"]

daemonset:
  enabled: true
  securityContext:
    runAsUser: 0

resources:
  requests:
    cpu:    "250m"
    memory: "512Mi"
  limits:
    cpu:    "500m"
    memory: "1Gi"
```

```yaml
# logstash-values.yaml
replicas: 1

image: "docker.elastic.co/logstash/logstash"
imageTag: "8.6.2"
imagePullPolicy: "IfNotPresent"

service:
  type: ClusterIP
  ports:
    - name: beats
      port: 5044
      protocol: TCP
      targetPort: 5044
    - name: http
      port: 9600
      protocol: TCP
      targetPort: http

httpPort: 9600

extraPorts:
  - name: beats
    containerPort: 5044

logstashConfig:
  logstash.yml: |
    http.host: 0.0.0.0
    xpack.sa-p8.enabled: false

logstashPipeline:
  logstash.conf: |
    input {
      beats {
        port => 5044
      }
    }
    filter {
      # tus filtros aquí
    }
    output {
      elasticsearch {
        hosts => ["http://elasticsearch-master:9200"]
        index => "logs-%{+YYYY.MM.dd}"
      }
    }

persistence:
  enabled: true

volumeClaimTemplate:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 20Gi

resources:
  requests:
    cpu:    "250m"
    memory: "512Mi"
  limits:
    cpu:    "500m"
    memory: "1Gi"

updateStrategy: OnDelete
```

Generar los manifiestos finales con Helm y desplegar con kubectl:

```bash
helm template elasticsearch elastic/elasticsearch -n sa-p8 -f elk/elasticsearch-values.yaml  > elk/elasticsearch.yaml
helm template logstash elastic/logstash -n sa-p8 -f elk/logstash-values.yaml > elk/logstash.yaml
helm template filebeat elastic/filebeat -n sa-p8 -f elk/filebeat-values.yaml > elk/filebeat.yaml

kubectl apply -n sa-p8 -f elk/elasticsearch.yaml
kubectl apply -n sa-p8 -f elk/logstash.yaml
kubectl apply -n sa-p8 -f elk/filebeat.yaml
```

#### Para Kibana se debe crear a mano el manifiesto de despliegue:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kibana
  namespace: sa-p8
  labels:
    app: kibana
spec:
  replicas: 1
  selector:
    matchLabels:
      app: kibana
  template:
    metadata:
      labels:
        app: kibana
    spec:
      containers:
        - name: kibana
          image: docker.elastic.co/kibana/kibana:8.5.1
          resources:
            requests:
              cpu:    "250m"
              memory: "1Gi"
            limits:
              cpu:    "500m"
              memory: "2Gi"
          env:
            - name: ELASTICSEARCH_HOSTS
              value: "http://elasticsearch-master:9200"
            - name: ELASTICSEARCH_SERVICEACCOUNT_TOKEN
              valueFrom:
                secretKeyRef:
                  name: kibana-system-token
                  key: token
          ports:
            - containerPort: 5601

---
apiVersion: v1
kind: Service
metadata:
  name: kibana
  namespace: sa-p8
spec:
  type: ClusterIP
  selector:
    app: kibana
  ports:
    - port: 5601
      targetPort: 5601
      protocol: TCP
      name: http
```

Aplicar el manifiesto de Kibana:

```bash
kubectl apply -n sa-p8 -f elk/kibana.yaml
```

> **NOTA:**
> Para Kibana se debe crear un `secret` con las credenciales de acceso a Elasticsearch.



Generar el token dentro del pod de ES

```bash
kubectl exec -it elasticsearch-master-0 -n sa-p8 -- bash

cd /usr/share/elasticsearch

bin/elasticsearch-service-tokens create elastic/kibana k8s-token
```

Utilizar el SERVICE TOKEN generado para crear el `secret`:
    
```bash
kubectl -n sa-p8 create secret generic kibana-system-token --from-literal=token="AAEAAWVsYXN0aWMva2liYW5hL2s4cy10b2tlbjplMTRqalR6Q1JkQzlkTmgyendUVV93"
```

Forzar el reinicio de Kibana para que tome el nuevo token:

```bash
kubectl rollout restart deployment kibana -n sa-p8
```

Revisar que el pod esta en estado READY:
```bash
kubectl get pods -n sa-p8
```

---

## Prometheus y Grafana

Habilita MSP en tu clúster:

```bash
# Seleccionar el proyecto de GCP
gcloud config set project forward-fuze-456010-c2

# Clúster zonal
gcloud container clusters update sa-cluster-practica8 --zone us-central1-b --enable-managed-prometheus

# (o) clúster regional
gcloud container clusters update <CLUSTER_NAME> --region <REGION> --enable-managed-prometheus
```

> **NOTA:** 
> GKE 1.27+ lo trae habilitado por defecto; el comando lo activa si está apagado.

Revisar que el MSP está habilitado:

```bash
kubectl get pods -n gmp-system
```

Habilitar el collector-service en el namespace `gmp-system`:

```yaml
# collector-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: prometheus-operated
  namespace: gmp-system
spec:
  selector:
    app.kubernetes.io/name: collector
  ports:
  - name: web
    port: 9090           # Grafana usará este puerto “standard”
    targetPort: 19090    # mapea al puerto real del contenedor
```

```bash
kubectl apply -f collector-service.yaml -n gmp-system
```

Revisar que el servicio está funcionando:

```bash
kubectl -n gmp-system port-forward svc/prometheus-operated 9090:9090 --address 0.0.0.0
Invoke-WebRequest http://localhost:9090/metrics -UseBasicParsing | Select-Object -First 5
```

Despliegue de Grafana

> **NOTA:**
> El despliegue de Grafana es mejor hacerlo segun la documentacion oficial.
> https://grafana.com/docs/grafana/latest/setup-grafana/installation/kubernetes/

Crear el namespace `grafana`:

```bash
kubectl create namespace sa-p8
```

Crear el archivo de despliegue `grafana.yaml`:

```yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: grafana-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: grafana
  name: grafana
spec:
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      securityContext:
        fsGroup: 472
        supplementalGroups:
          - 0
      containers:
        - name: grafana
          image: grafana/grafana:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
              name: http-grafana
              protocol: TCP
          env:
          - name: GF_SMTP_ENABLED
            value: "true"
          - name: GF_SMTP_HOST
            value: "smtp.gmail.com:587"
          - name: GF_SMTP_USER
            value: "mym.jayjay@gmail.com"
          - name: GF_SMTP_PASSWORD
            value: "qgdpioekliemtxbd"
          - name: GF_SMTP_FROM_ADDRESS
            value: "mym.jayjay@gmail.com"
          - name: GF_SMTP_FROM_NAME
            value: "Grafana Alerts"
          - name: GF_SMTP_SKIP_VERIFY
            value: "false" 
          readinessProbe:
            failureThreshold: 3
            httpGet:
              path: /robots.txt
              port: 3000
              scheme: HTTP
            initialDelaySeconds: 10
            periodSeconds: 30
            successThreshold: 1
            timeoutSeconds: 2
          livenessProbe:
            failureThreshold: 3
            initialDelaySeconds: 30
            periodSeconds: 10
            successThreshold: 1
            tcpSocket:
              port: 3000
            timeoutSeconds: 1
          resources:
            requests:
              cpu: 250m
              memory: 750Mi
          volumeMounts:
            - mountPath: /var/lib/grafana
              name: grafana-pv
      volumes:
        - name: grafana-pv
          persistentVolumeClaim:
            claimName: grafana-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: grafana
spec:
  ports:
    - port: 3000
      protocol: TCP
      targetPort: http-grafana
  selector:
    app: grafana
  sessionAffinity: None
  type: LoadBalancer
```

> **NOTA:**
> Tomar en cuenta que grafana necesito variables de entorno para poder usar el SMTP de Gmail y enviar alertas por correo.

> Se recomienda crear un usuario de Gmail exclusivo para el envío de alertas y no usar el correo personal.

> Se recomienda usar una contraseña de aplicación para el envío de alertas y no la contraseña del correo personal.

```bash
env:
- name: GF_SMTP_ENABLED
value: "true"
- name: GF_SMTP_HOST
value: "smtp.gmail.com:587"
- name: GF_SMTP_USER
value: "tu_correo@gmail.com"
- name: GF_SMTP_PASSWORD
value: "tu_contraseña_de_aplicacion"
- name: GF_SMTP_FROM_ADDRESS
value: "tu_correo@gmail.com"
- name: GF_SMTP_FROM_NAME
value: "Grafana Alerts"
- name: GF_SMTP_SKIP_VERIFY
value: "false"
```

Aplicar el manifiesto de Grafana:

```bash
kubectl apply -f grafana.yaml -n sa-p8
```

Revisar que el pod de Grafana esté en estado `Running`:

```bash
kubectl get pods -n sa-p8
```

Agregar el podsa-p8 a cada uno de los pods que se quieran monitorear:

```yaml
apiVersion: sa-p8.googleapis.com/v1
kind: Podsa-p8
metadata:
  name: equipos
  namespace: sa-p8
spec:
  selector:
    matchLabels:
      app: equipos
  endpoints:
  - port: metrics
    path: /metrics
    interval: 15s
```

Consultar la IP externa de Grafana:
```bash
kubectl get svc -n sa-p8
```

Acceder a Grafana en el navegador:
```bash
http://<EXTERNAL_IP>:3000
```

Iniciar sesión con las credenciales por defecto:
```bash
admin/admin
```
Agregar la fuente de datos de Prometheus:

Grafana > Configuration > Data Sources > Add data source > Prometheus
```yaml
http://prometheus-operated.gmp-system.svc.cluster.local:9090
```
---

## Agregar visualizaciones y paneles:

Grafana > Dashboards > New Dashboard > Add new panel

>**NOTA:**
> Se recomienda usar consultas PromQL para obtener métricas de los pods. Usar la opción de "Add Query" para agregar consultas y visualizar las métricas.

1. CPU % (promedio)

```yaml
sum by (app)(
  rate(container_cpu_usage_seconds_total{namespace="sa-p8",container!="POD"}[5m])
) * 100
```

2. Memoria % (promedio)

```yaml
sum by (app)(
  container_memory_working_set_bytes{namespace="sa-p8",container!="POD"}
) / 1024 / 1024
```

3. CPU % por microservicio

```yaml
sum by (app) (
  label_replace(
    rate(
      container_cpu_usage_seconds_total{
        namespace="sa-p8",
        container!="POD",
        pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*"
      }[5m]
    ),
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
) * 100
```

4. Memoria (MiB) por microservicio

```yaml
sum by (app) (
  label_replace(
    container_memory_working_set_bytes{
      namespace="sa-p8",
      container!="POD",
      pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*"
    } / 1024 / 1024,
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
)
```

5. Network RX (KiB/s) por microservicio

```yaml
sum by (app) (
  label_replace(
    rate(
      container_network_receive_bytes_total{
        namespace="sa-p8",
        pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*",
        interface!="lo"
      }[5m]
    ) / 1024,
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
)
```

6. Network TX (KiB/s) por microservicio

```yaml
sum by (app) (
  label_replace(
    rate(
      container_network_transmit_bytes_total{
        namespace="sa-p8",
        pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*",
        interface!="lo"
      }[5m]
    ) / 1024,
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
)
```

7. Disk reads (ops/s) por microservicio

```yaml
sum by (app) (
  label_replace(
    rate(
      container_fs_reads_total{
        namespace="sa-p8",
        container!="POD",
        pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*"
      }[5m]
    ),
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
)
```

8. Disk writes (ops/s) por microservicio

```yaml
sum by (app) (
  label_replace(
    rate(
      container_fs_writes_total{
        namespace="sa-p8",
        container!="POD",
        pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*"
      }[5m]
    ),
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
)
```

9. Número de pods vivos por microservicio

```yaml
count by (app) (
  label_replace(
    up{namespace="sa-p8"}, 
    "app", 
    "$1", 
    "pod", 
    "^([^-]+)-.*$"
    )
  )
```

---

## Agregar alertas en Grafana:

>**NOTA:**
> Contact point debe ser configurado para enviar alertas por correo electrónico. (grafana-default-email) Utilizara el SMTP de Gmail configurado en el despliegue de Grafana.

Grafana > Alerting > Contact points > Edit default contact point
  
  ```yaml
  Name: grafana-default-email
  Type: Email
  Email addresses: mym.demo@gmail.com
  ```

Grafana > Alerting > Alert rules > New alert rule

Rule Name: `HighPodCPU`

Consulta PromQL:
```yaml
sum by (app) (
  label_replace(
    rate(
      container_cpu_usage_seconds_total{
        namespace="sa-p8",
        container!="POD",
        pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*"
      }[5m]
    ),
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
) * 100
```
WHEN QUERY `IS ABOVE` 60 (60%) -- For `1 MINUTES`


Rule Name: `HighPodMemory`

Consulta PromQL:
```yaml
sum by (app) (
  label_replace(
    container_memory_working_set_bytes{
      namespace="sa-p8",
      container!="POD",
      pod=~"(equipos|mantenimiento|reportes|ubicaciones)-.*"
    } / 1024 / 1024,
    "app", "$1", "pod", "^(equipos|mantenimiento|reportes|ubicaciones)-.*$"
  )
)
```
WHEN QUERY  `IS ABOVE` 110 (MiB) -- For `1 MINUTES`

> **NOTA:**
> Para probar las alertas, se puede usar el siguiente comando para aumentar la carga de CPU y memoria de los pods.

```bash
kubectl -n sa-p8 exec deploy/equipos -- sh -c "yes > /dev/null & sleep 240"
```
> **NOTA:**
> Para detener el uso de CPU y memoria, se puede usar el siguiente comando:

```bash
kubectl -n sa-p8 exec deploy/equipos -- pkill yes
```

> **NOTA:**
> Para asegurar un reinicio limpio del pod es mejor un reinicio del mismo.

```bash
kubectl -n sa-p8 rollout restart deployment equipos
```

> **NOTA:**
> Escalado manual rapido para no esperar el HPA automatico.

```bash
kubectl -n sa-p8 scale deployment equipos --replicas=1
```
---

## Logging