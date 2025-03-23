Mostrar toda la informacion del namespace
kubectl get all -n sa-p5

Ejecutar un pod
kubectl exec -it <pod> -n pa-p5 -- sh
mysql -u root -p

Reiniciar un deployment
kubectl rollout restart deployment <deployment> -n pa-p5

Exponer un servicio
minikube service <svc> -n sa-p5 --url

Obtener logs de un pod
kubectl logs <pod> -n sa-p5

Obtener informacion del estado de un pod
kubectl describe pod <pod> -n sa-p5