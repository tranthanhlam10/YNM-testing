# Task refactor Proxy token source cũ của Giang


## Vấn đề


## Scope



## Cách chạy 

1. k8s



fbgraph-auto-deploy-ynmpdp-6024-testing


crawler-fb-testing-update-engagement-fb-post-social-trend






kubectl get pods -n crawler-testing | grep fbgraph-auto-deploy-ynmpdp-6024-testing
99906
kubectl config use-context lamtt-k8s-local




Deployment: https://k8s.ynm.local/#/deployment/crawler-testing/fbgraph-auto-deploy-ynmpdp-6024-testing?namespace=crawler-testing

 

name: CRAWLER_TYPE
   value: 'FB_GRAPHQL_API'
name: COUNTRY
   value: 'VN'





   - name: FB_API_ENDPOINT
              value: http://fbgraph-auto-deploy-ynmpdp-6024-testing.ynm.local
            - name: FB_API_KEY
              value: LamTT-socialift


2. Câu SQL cần query ở mySQL


crawler_type LIKE "%FB%" AND status = "ACTIVE" AND  country = "VN"

(Câu này dành cho cả proxy và token)



3. Tài liệu mô tả

https://wiki.younetco.com/pages/viewpage.action?pageId=278180061


## Những deployments cần lưu ý



ynm-cl-fb-graph-engagement-by-crisis-imgs-testing

crawler-fb-testing-update-engagement-page-fb-post-socialift

crawler-fb-testing-update-engagement-group-fb-post-socialift

crawler-fb-testing-update-engagement-user-fb-post-socialift

crawler-fb-testing-update-engagement-fb-post-social-trend

crawler-fb-testing-update-engagement-fb-post



