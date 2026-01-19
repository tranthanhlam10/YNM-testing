# Task sửa chỗ resolver của Huy luồng identity graph QL


## Scope

Nội dung điều chỉnh:
+ Điều chỉnh lại logic xử lý mapping identity: Nếu mapping identity đã tồn tại trong hệ thống thì sẽ publish cho Source Updater xử lý, ngược lại thì publish cho Data Pusher xử lý.
+ Gán giá trị created_date của identity được load lên từ collection identity vào finished source và mapping identity, mục đích là đồng nhất created_date.




## Cách chạy



identity_graph|cl.identities_finished_sources|identities_2_solr



ynmpdp-5782-testing-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep ynmpdp-5782-testing-ynm-crawler-empty
kubectl exec -it  yynmpdp-5782-testing-ynm-crawler-empty-86599498c-7hkx6 -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local

