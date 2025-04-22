# Documentación - Práctica 8

## Instalación y Configuración

--- 
### ELK Stack

Preparar el namespace logging:

```bash
kubectl create namespace logging
```

Añadir repositorio elastic desde Helm:

```bash
helm repo add elastic https://helm.elastic.co
helm repo update
```

> **NOTA:**
> Importante deshabilitar el servicio de loggin de GKE para evitar sobrecarga de logs.
> Una sobrecarga de logs causara un costo excesivo en la cuenta de GCP.

```bash
gcloud container clusters update sa-cluster-practica8 `
  --zone us-central1-b `
  --logging=SYSTEM `
  --monitoring=SYSTEM
```

```bash
gcloud container clusters describe sa-cluster-practica8 `
  --zone us-central1-b `
  --flatten=loggingConfig.componentConfig.enableComponents `
  --format="value(loggingConfig.componentConfig.enableComponents)"
```

Verificar que el logging de GKE está deshabilitado:

Observability > Logging > Logs Explorer

```bash
resource.type="k8s_container"
```

>**NOTA:**
> No debes ver losg de container, solo los de sistema.

Para excluir esos mismos logs y que no se ingesten nunca:

Observability > Logging > Logs Router > Exclusions

```yaml
resource.type="k8s_container"
```

Archivos de valores (.yaml):

```yaml
# elasticsearch-values.yaml
clusterName: "elasticsearch"
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

1. Desplegar Elasticsearch:

```bash
helm install elasticsearch elastic/elasticsearch -n logging -f .\k8s\logging\elasticsearch-values.yaml
```

2. Obtener la contraseña elastic

```bash
# read the base64‐encoded password from the k8s secret
$b64 = kubectl get secret elasticsearch-master-credentials -n logging -o jsonpath='{.data.password}'

# decode it
$ElasticPwd  = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))

# show it (you should see something like z0NTVfiJhfIT70FY)
Write-Output $ElasticPwd 
```

3. Comprobar que Elasticsearch está funcionando:
```bash
kubectl exec -it elasticsearch-master-0 -n logging -- `
  curl -u elastic:$ElasticPwd -k https://localhost:9200/_cat/indices?v
```

> **NOTA:**
> La contraseña de elasticsearch es la misma para Kibana y Logstash.

```yaml
# filebeat-values.yaml
daemonset:
  enabled: true

  # Esto aplica al Pod (no al container)
  podSecurityContext:
    runAsUser: 0
    runAsGroup: 0
    fsGroup: 0

  # Esto aplica al Container
  securityContext:
    runAsUser: 0
    runAsGroup: 0

  extraVolumes:
    - name: var-log-containers
      hostPath:
        path: /var/log/containers
    - name: var-log-pods
      hostPath:
        path: /var/log/pods
  extraVolumeMounts:
    - name: var-log-containers
      mountPath: /var/log/containers
      readOnly: true
    - name: var-log-pods
      mountPath: /var/log/pods
      readOnly: true

filebeatConfig:
  filebeat.yml: |
    filebeat.inputs:
      - type: log
        enabled: true
        paths:
          - /var/log/containers/*.log
          - /var/log/pods/*/*.log
        symlinks: true
        multiline:
          pattern: '^[[:space:]]'
          negate: false
          match: after
        processors:
          - add_kubernetes_metadata:
              in_cluster: true
              host: ${NODE_NAME}
              matchers:
                - logs_path:
                    logs_path: "/var/log/containers/"
              default_indexers.enabled: false
              default_matchers.enabled: false

          - dissect:
              tokenizer: '%{k8s.timestamp} %{+k8s.timestamp} %{k8s.stream} %{json_message}'
              field: "message"
              target_prefix: ""

          - decode_json_fields:
              fields: ["json_message"]
              target: ""
              overwrite_keys: true
              process_array: false
              max_depth: 1

    output.logstash:
      hosts: ["logstash-logstash.logging.svc.cluster.local:5044"]

resources:
  requests:
    cpu:    "250m"
    memory: "512Mi" 
  limits:
    cpu:    "500m"
    memory: "1Gi"
```

1. Desplegar Filebeat:

```bash
helm install filebeat elastic/filebeat -n logging -f .\k8s\logging\filebeat-values.yaml
```

```yaml
# logstash-values.yaml

config:
  ls.java.opts: "-Xmx512m -Xms512m"

replicas: 1

repository: docker.elastic.co/logstash/logstash
tag: "8.6.2"
pullPolicy: IfNotPresent

service:
  type: ClusterIP
  ports:
    - name: beats
      port: 5044
      targetPort: 5044
    - name: http
      port: 9600
      targetPort: http

logstashConfig:
  logstash.yml: |
    http.host: 0.0.0.0
    xpack.monitoring.enabled: false

logstashPipeline:
  logstash.conf: |
    input {
      beats {
        port => 5044
      }
    }
    filter {
      # Example: grok, mutate, etc.
    }
    output {
      stdout { codec => rubydebug }
      elasticsearch {
        hosts => ["https://elasticsearch-master:9200"]
        index => "logs-%{+YYYY.MM.dd}"
        user => "elastic"
        password => "${ELASTIC_PASSWORD}"
        ssl => true
        ssl_certificate_verification => false
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
    cpu:    "500m"
    memory: "2Gi"
  limits:
    cpu:    "1"
    memory: "4Gi"

extraEnvs:
  - name: ELASTIC_PASSWORD
    value: "8bPm9bSwTHk0JqbE"
  - name: LS_JAVA_OPTS
    value: "-Xmx512m -Xms512m"

updateStrategy: OnDelete
```
1. Desplegar Logstash:

```bash
helm install logstash elastic/logstash -n logging -f .\k8s\logging\logstash-values.yaml
```

2. Verificar que las env vars de Logstash están bien configuradas:

```bash
kubectl exec -it logstash-logstash-0 -n logging -- env | Select-String "ELASTIC_PASSWORD"
kubectl exec -it logstash-logstash-0 -n logging -- env | Select-String "LS_JAVA_OPTS"
```

3. Probar la conexión de Filebeat a Logstash:

```bash
kubectl exec -it filebeat-filebeat-977pc -n logging -- filebeat test output -e
```

4. Verificar que Logstash está recibiendo eventos:

```bash
kubectl logs -f statefulset/logstash-logstash -n logging
```

5. Comprobar los indices en Elasticsearch:

```bash
kubectl exec -it elasticsearch-master-0 -n logging -- `
  curl -u elastic:$ElasticPwd -k https://localhost:9200/_cat/indices?v
```

```yaml
# kibana-values.yaml
replicas: 1

repository: docker.elastic.co/kibana/kibana
tag: "8.6.2"
pullPolicy: IfNotPresent

elasticsearch:
  hosts: ["https://elasticsearch-master:9200"]
  username: "elastic"
  password: "8bPm9bSwTHk0JqbE"
  ssl:
    verificationMode: none # ignora certificado autofirmado

resources:
  requests:
    cpu:    "250m"
    memory: "1Gi"
  limits:
    cpu:    "500m"
    memory: "2Gi"

service:
  type: ClusterIP
  port: 5601
```

1. Desplegar Kibana:

```bash
helm install kibana elastic/kibana -n logging -f .\k8s\logging\kibana-values.yaml
```

2. Exponer Kibana localmente:

```bash
kubectl port-forward svc/kibana-kibana 5601:5601 -n logging
```

> En el navegador: http://localhost:5601
> Usuario: elastic
> Contraseña: 8bPm9bSwTHk0JqbE

> **NOTA:**
> La contraseña de elasticsearch es la misma para Kibana y Logstash.


---

## Prometheus y Grafana

Habilita MSP en tu clúster:

```bash
# Seleccionar el proyecto de GCP
gcloud config set project hallowed-key-458002

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

Crear el namespace `monitoring`:

```bash
kubectl create namespace monitoring
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
kubectl apply -f grafana.yaml -n monitoring
```

Revisar que el pod de Grafana esté en estado `Running`:

```bash
kubectl get pods -n monitoring
```

Agregar el pod monitoring a cada uno de los pods que se quieran monitorear:

```yaml
apiVersion: monitoring.googleapis.com/v1
kind: PodMonitoring
metadata:
  name: equipos
  namespace: monitoring
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
kubectl get svc -n monitoring
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

## Dashboard de Grafana:

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

## Dashboard de Kibana:
Kibana > Dashboard > Create new dashboard > Add new panel

> **NOTA:**
> Crear un índice en Kibana para poder visualizar los logs de Elasticsearch.
> Se deberia usar logs-*, pero se puede usar el nombre del índice que se desee.

## Visualizaciones

### A. Tráfico de Peticiones  
- **Tipo**: Line chart  
- **Eje X**: `@timestamp` (intervalos de 1 min)  
- **Eje Y**: Conteo de documentos  
- **Split series**: `service.keyword`

### B. Latencia (Percentiles)  
- **Tipo**: Percentile  
- **Campo**: `response_time_ms` (o tu métrica de latencia)  
- Percentiles: p50, p90, p99  
- **Eje X**: `@timestamp`

### C. Tasa de Errores  
- **Tipo**: Line chart  
- **Eje Y**: Conteo de documentos filtrados por `levelname: ERROR`
- **Split series**: `service.keyword`

### D. Distribución de Niveles de Log  
- **Tipo**: Pie chart  
- **Slice by**: `levelname.keyword`

### E. Top Endpoints Más Invocados  
- **Tipo**: Bar chart  
- **X-axis**: `url.keyword` (o ruta)  
- **Y-axis**: Conteo de documentos

### F. Tabla de Últimos Errores  
- **Tipo**: Data Table  
- **Rows**:  
- `message.keyword` (solo ERROR)  
- **Columns**:  
- `@timestamp`  
- `request_id`  

### G. Tabla de logs recientes
- **Tipo**: Data Table
- **Rows**:
- `@timestamp`
- `service`
- `levelname`
- `request_id`
- `message`
- **Columns**:
- `@timestamp` (ordenar por @timestamp descendente)

### H. Top 5 endpoints o mensajes más frecuentes
- **Tipo**: Bar chart
- **X-axis**: `message.keyword`
- **Metrics**: Conteo de documentos
- **Size**: 5

#### I. Distribución por nivel (INFO, ERROR, etc.)
- **Tipo**: Pie chart
- **Metrics**: Conteo de documentos
- **X-axis**: `levelname.keyword` 
- **Size**: 5


