import requests
url = "https://wiki.younetco.com/rest/api/content/298058394"
headers = {"Authorization": "Bearer <YOUR_TOKEN_HERE>"}
response = requests.get(url, headers=headers)
print(response.status_code)
