cd website
NODE_ENV=production yarn build
cd ..
docker build -t gcr.io/firescar96/cosmo-website:current -f website-dockerfile website
docker push gcr.io/firescar96/cosmo-website:current
kubectl get pods | grep cosmo-website | awk '{print $1}' | xargs kubectl delete pod


cd datastore
NODE_ENV=production yarn build
cd ..
docker build -t gcr.io/firescar96/cosmo-datastore:current -f datastore-dockerfile datastore
docker push gcr.io/firescar96/cosmo-datastore:current
kubectl get pods | grep cosmo-datastore | awk '{print $1}' | xargs kubectl delete pod