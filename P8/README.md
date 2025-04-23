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

# show it (you should see something like DkJbVhZkImsw2403)
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
    log.level: warn

logstashPipeline:
  logstash.conf: |
    input {
      beats {
        port => 5044
      }
    }
    filter {
      if [event][dataset] == "elasticsearch.server" or
        [json_message] =~ /\[logstash\.outputs\.elasticsearch\]/ {
        drop { }
      }
    }
    output {
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
    value: "rJyBig13zgaAaxtH"
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

2. Probar la conexión de Filebeat a Logstash:

```bash
kubectl exec -it filebeat-filebeat-977pc -n logging -- filebeat test output -e
```

3. Verificar que Logstash está recibiendo eventos:

```bash
kubectl logs -f statefulset/logstash-logstash -n logging
```

> **NOTA:**
> Generar trafico de logs con `curl` o `Postman`
> Revisar los logs de los microservicios para ver si se están enviando correctamente a Logstash.

4. Comprobar los indices en Elasticsearch:

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
  password: "rJyBig13zgaAaxtH"
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
  type: LoadBalancer
  port: 5601
```

1. Desplegar Kibana:

```bash
helm install kibana elastic/kibana -n logging -f .\k8s\logging\kibana-values.yaml
```


2. Acceder a Kibana en el navegador:
```bash
http://<EXTERNAL-IP>:5601
```
> Usuario: elastic
> Contraseña: 8bPm9bSwTHk0JqbE

> **NOTA:**
> La contraseña de elasticsearch es la misma para Kibana y Logstash.

Revisar el flujo de logs en Kibana:

confirmar que estan pasando por filebeat y logstash:
```bash
kubectl logs -f statefulset/logstash-logstash -n logging
```

Revisar los indices en Kibana:

Crear un index pattern en Kibana para los logs:
```yaml
logs-*    # logs-2023.10.01
```

Kibana > Discover

buscar logs por servicio:
```yaml
service.keyword: "equipos" | service.keyword: "mantenimiento" | service.keyword: "reportes" | service.keyword: "ubicaciones"
```

---

## Prometheus y Grafana

Agregar repositorio de Helm de Prometheus:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Crear el namespace `monitoring`:

```bash
kubectl create namespace monitoring
```

Crear el archivo de despliegue `prometheus-values.yaml`:

```yaml
# prometheus-values.yaml
# prometheus-values.yaml
prometheus:
  prometheusSpec:
    serviceMonitorSelectorNilUsesHelmValues: false
    podMonitorSelectorNilUsesHelmValues: false
    serviceMonitorNamespaceSelector:
      matchNames:
        - sa-p8
    podMonitorNamespaceSelector:
      matchNames:
        - sa-p8

    # Retención de métricas y almacenamiento en disco
    retention: 7d
    storageSpec:
      volumeClaimTemplate:
        spec:
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 5Gi
```

Instalación de Prometheus:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack `
  -n monitoring `
  -f k8s/monitoring/prometheus-values.yaml
```

Revisar que el pod de Prometheus esté en estado `Running`:

```bash
kubectl get pods -n monitoring
```

Agregar el service monitoring a cada uno de los pods que se quieran monitorear:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: equipos-servicemonitor
  namespace: sa-p8
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: equipos
  namespaceSelector:
    matchNames:
      - sa-p8
  endpoints:
    - port: metrics
      path: /metrics
      interval: 15s
```

Exponer Grafana como LoadBalancer:

```bash
kubectl patch svc prometheus-grafana `
  -n monitoring `
  -p '{"spec":{"type":"LoadBalancer"}}'
```

Acceder a Grafana en el navegador:
```bash
http://<EXTERNAL-IP>:80
```

> **NOTA:**
> Las credenciales por defecto son admin/prom-operator

Iniciar sesión con las credenciales por defecto:
```bash
admin/prom-operator
```

> **NOTA:**
> Si no funciona, puedes obtener la contraseña de admin desde el pod de Grafana:

Usuario:
```bash
kubectl get secret prometheus-grafana -n monitoring -o jsonpath='{.data.admin-user}' `
  | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

Contraseña:
```bash
kubectl get secret prometheus-grafana -n monitoring -o jsonpath='{.data.admin-password}' `
  | % { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

Agregar la fuente de datos de Prometheus:

Grafana > Configuration > Data Sources > Add data source > Prometheus

```yaml
http://prometheus-kube-prometheus-prometheus.monitoring:9090/
```
> **NOTA:**
> Esta URL es la URL interna del servicio de Prometheus en el namespace `monitoring`.
> Save & Test para verificar que la conexión es correcta.

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
count by (pod) (
  kube_pod_status_ready{namespace="sa-p8", condition="true"}
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
