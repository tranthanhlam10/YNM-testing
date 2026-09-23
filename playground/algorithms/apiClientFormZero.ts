import axios from "axios";

async function main() {

    console.log("Bắt đầu chạy..."); 
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  console.log(response.data);
}

main();