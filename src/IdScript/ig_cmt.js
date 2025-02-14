async function getInstagramCommentCount(postId, accessToken) {
    const apiUrl = `https://graph.instagram.com/${postId}?fields=comments_count&access_token=${accessToken}`;
  
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.comments_count || 0;
    } catch (error) {
      console.error('Có lỗi khi lấy số lượng bình luận:', error);
      return null;
    }
  }
  
  // Sử dụng hàm
  const postId = '';
  const accessToken = 'YOUR_ACCESS_TOKEN';
  
  getInstagramCommentCount(postId, accessToken)
    .then(commentCount => {
      if (commentCount !== null) {
        console.log(`Số lượng bình luận: ${commentCount}`);
      }
    })
    .catch(error => {
      console.error('Lỗi:', error);
    });
  