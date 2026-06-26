# Task dynamic của Huy


ynmshgysg-5996-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmshgysg-5996-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-5996-testing-ynm-crawler-empty-dcfd4c45c-jmpq6  -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



## Danh sách các queue cần check


rnd.socialheat.llm.summary_input|rnd.socialheat.llm.summary_output|cl.summary_mentions_finished_sources|cl.tt.post_transcripts_crawling_sources


## Câu lệnh chạy

export HTTP_PORT=9999

export COMMON_CONFIG_CRAWLING_SOURCE_QUEUE="cl.tt.post_transcripts_crawling_sources"
export COMMON_CONFIG_CRAWLED_SOURCE_QUEUE="rnd.socialheat.llm.summary_input"
export COMMON_CONFIG_RESOLVED_SOURCE_EXCHANGE="rnd.socialheat.llm.summary_output"
export COMMON_CONFIG_MAX_RETRIES=10
export COMMON_CONFIG_PROXY_CRAWLER_TYPE="TT_POST_TRANSCRIPT_CRAWLER"

export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true

export LOG_LEVEL=debug

yarn start --scope=@ynm/cl-tt-post-transcript-crawler-service

## Message mẫu

{
  "id_classification_request": "1",
  "mentions": [
    {
      "id": "f485070e-877d-59cd-a54b-c2b91d551fb1",
      "link": "tiktok.com/@MS4wLjABAAAAWuL0RsJ6KcaB1gdrDaFazyFtOLbANiX4696KbGG4sxRtdCAOrgEWIpeQrjuH8XYt/video/7548652337800203527",
      "platform": 9,
      "mention_type": 1,
      "id_social": "7548652337800203527",
      "search_text": [
        "",
        "Toàn cảnh full màn Cầu Hôn lãng mạn của anh Linh chị Viên Vibi . Đi xem Online mấy bà ơi 🤣 #cauhon #Vienvibi"
      ],
      "created_date": "2025-09-11T02:26:29Z",
      "transcript": "hôm nay là một ngày cực kỳ đặc biệt\nngày mà anh Linh sẽ cầu hôn với chị viên VB\nchưa bao giờ mình được mời\nlàm khách mời của một buổi cầu hôn cả\nCho nên ngày hôm nay sẽ Theo chân mình xem buổi cầu hôn này\nsẽ diễn Ra như thế nào nhá\nở khách sạn năm SAO luôn nha mọi người nha\ntrời ơi lãng mạn quá à nhìn xúc động luôn á trời\nnăm nay cũng là kỷ niệm 15 yêu nhau của\nanh chị nha mọi người\noh my god Xin chào\nXin chào thế mà bảo là\nthế mà bảo là một một bữa tiệc kiểu private\nbao giờ trưa khi bà Vy lên\nanh a thuê diễn viên rồi có một bà chửa\ncá mang bầu đến đây đẻ ngay tại chỗ\ntrời ơi cái gì dữ vậy anh anh Linh mới Lao vào giúp\nsau khi mà anh Linh\nanh giúp xong thì là anh Linh đi giúp bà đẻ\ný là ý là nhân hậu và đẻ Ra cái nhẫn a\ntrời ơi trời ơi trời ơi mở Ra cơ hội\nthú vị kế hoạch thú vị ha tổng duyệt nào\ngiả vờ đây là chị viên\nthật á hồi nãy mới nói chữ là cảm ơn em là cái gì đó\nthôi là đã rơm rớm rồi\nnãy em rep Cho mọi người thôi mà đã dậy rồi đó\nnè hôm qua anh phải anh còn ngồi em viết lại ấy\nbà ấy lấy lý do gì để bà đến đây\nà từ từ giải thích lại Cho Long tức là anh đã nhờ Lucy\ngiả bộ gọi điện bụng viên là ngày hôm nay đi quay teaser ừm\nvà đã bọn anh đã phải nhờ làm một cái kịch bản\nnhư một cái kịch bản diễn bình thường để gửi Cho viên\nrồi VIP về trang phục các thứ\nsân khấu điện ảnh thiếu anh\nSAO anh cảm giác hôm nay của anh như thế nào\ncảm giác hả vâng cảm giác Tao cũng như mọi người thôi vui\nvui thiệt hả mạnh linh\nủa ừ tụi em hồi hộp trên ti VI à vậy hả\nthôi SAO anh hồi hộp giùm anh linh ta\nhôm hồi hộp cùng anh Linh hợp lý hơn nhá\nmình hồi hộp Cho bà Vy không ạ hông tôi tôi lại hợp Cho\nAI\nAI mà làm là người chuẩn bị thì người đó phải hồi hộp chứ\nmà mày hồi hộp Cho AI\nthế chị viên\nnhưng mà Tao hồi hộp Cho ông Linh mà\nmở đi mở đi\ntrời ơi trời ơi\nUI sáng dữ vậy trời mà bự nha\nbây giờ á BA chị Vy a\ncầu hôn xong á chị Vy nói chuyện tụi mình\ná chị Vy cứ vậy nè\nha ha ha ủa Will you Marry me\ntrời đất ơi bao giờ mới đến lượt mình ha\nbây giờ chúng mình sẽ phải re hot show\nnha tổng đạo diễn đang chỉ đạo\ntổng đạo diễn Lucy Nguyễn\nhiện nay là đang chỉ đạo là Cho nó vào khuôn khổ đây\nbây giờ đi 2 hàng đây để đợi a gọi là nhân vật chính đi qua\nquay từ bên góc bên Kia qua đó\nanh camera ơi anh quay vô đây thấy tụi em đẹp chưa\nlà 2 người đứng 2 hàng nè\nđúng hông cũng đang thi nét tóc bộ đồ luôn đó trời\nrất là Chan tê\nChan tê lên\nhông phải anh vắt ly luôn để coi cái đường dây nó khô kìa\nrồi đây học bài đó học bài đó\nđang học bài đó\nnào nào bây giờ chị gọi đi\nem ơi em đâu rồi\nem đang sắp tới rồi chị tại tiệc xe quá\ntrời ơi trễ lắm luôn rồi á bé ơi\ndạ dạ\ntại vì công ty nó kêu là bên chị kêu là 15 phút nữa mới đi\nnên em đâu có biết đâu\nvậy á hả đứa nào vậy ta\nưm tiên nó nói là bên chị giận em\ntrời mấy đứa này thiệt tình á chứ\ndạ nãy chị Trang vắng em\ná chị nên là em bây giờ em mới đặt xe đi nè\nem Ra tới làm việc phải nghỉ rồi SAO\ncon trang này nó bị gì vậy ta\ntrời ơi chớ để em em dám mở Ra chị trang thử nha\nem ơi có cách nào đi nhanh hơn giúp\nchị xíu được hông dạ em sắp tới rồi chắc cỡ ơ\nmấy phút luôn anh này ráng giùm chị nha không là\ndạ mệt mỏi lắm ở đây\nđể chị về chị nói với trang coi SAO dạ khó chịu thiệt á chứ\nSAO ác dữ vậy má SAO ác dữ vậy má\nSAO chị\ncăng vậy trời\nMel\ncảm ơn em vì đã bao dung\nđã luôn ở cạnh để giúp anh hiểu Ra như thế nào là tình yêu\nhaha\nnếu hông đồng ý anh thì đồng ý AI giờ anh quỳ xuống lại\n예 오\n예\nㅎㅎ 오 오\nem\ncó chuẩn bị một cái món quà nhỏ nhỏ\nmột cái bài hát mới chỉ có bên em mà thôi\ncái lúc Cho nhau vui hông vui hông\nSAO\nchị khóc dữ\nvậy\ncô ấy đồng ý rồi\n4 tỷ rưỡi"
    }
  ]
}





{
  "id_classification_request": "1",
  "transcriptTrackingId": "1",
  "id_topic": "120306",
  "from_task": "TAG_CLASSIFICATION",
  "type": "LAmTT",
  "mentions": [
    {
      "id": "f485070e-877d-59cd-a54b-c2b91d551fb1",
      "link": "tiktok.com/@MS4wLjABAAAAWuL0RsJ6KcaB1gdrDaFazyFtOLbANiX4696KbGG4sxRtdCAOrgEWIpeQrjuH8XYt/video/7548652337800203527",
      "platform": 9,
      "mention_type": 1,
      "id_social": "7548652337800203527",
      "search_text": [
        "",
        "Toàn cảnh full màn Cầu Hôn lãng mạn của anh Linh chị Viên Vibi . Đi xem Online mấy bà ơi 🤣 #cauhon #Vienvibi"
      ],
      "created_date": "2025-09-11T02:26:29Z",
      "transcript": "hôm nay là một ngày cực kỳ đặc biệt\nngày mà anh Linh sẽ cầu hôn với chị viên VB\nchưa bao giờ mình được mời\nlàm khách mời của một buổi cầu hôn cả\nCho nên ngày hôm nay sẽ Theo chân mình xem buổi cầu hôn này\nsẽ diễn Ra như thế nào nhá\nở khách sạn năm SAO luôn nha mọi người nha\ntrời ơi lãng mạn quá à nhìn xúc động luôn á trời\nnăm nay cũng là kỷ niệm 15 yêu nhau của\nanh chị nha mọi người\noh my god Xin chào\nXin chào thế mà bảo là\nthế mà bảo là một một bữa tiệc kiểu private\nbao giờ trưa khi bà Vy lên\nanh a thuê diễn viên rồi có một bà chửa\ncá mang bầu đến đây đẻ ngay tại chỗ\ntrời ơi cái gì dữ vậy anh anh Linh mới Lao vào giúp\nsau khi mà anh Linh\nanh giúp xong thì là anh Linh đi giúp bà đẻ\ný là ý là nhân hậu và đẻ Ra cái nhẫn a\ntrời ơi trời ơi trời ơi mở Ra cơ hội\nthú vị kế hoạch thú vị ha tổng duyệt nào\ngiả vờ đây là chị viên\nthật á hồi nãy mới nói chữ là cảm ơn em là cái gì đó\nthôi là đã rơm rớm rồi\nnãy em rep Cho mọi người thôi mà đã dậy rồi đó\nnè hôm qua anh phải anh còn ngồi em viết lại ấy\nbà ấy lấy lý do gì để bà đến đây\nà từ từ giải thích lại Cho Long tức là anh đã nhờ Lucy\ngiả bộ gọi điện bụng viên là ngày hôm nay đi quay teaser ừm\nvà đã bọn anh đã phải nhờ làm một cái kịch bản\nnhư một cái kịch bản diễn bình thường để gửi Cho viên\nrồi VIP về trang phục các thứ\nsân khấu điện ảnh thiếu anh\nSAO anh cảm giác hôm nay của anh như thế nào\ncảm giác hả vâng cảm giác Tao cũng như mọi người thôi vui\nvui thiệt hả mạnh linh\nủa ừ tụi em hồi hộp trên ti VI à vậy hả\nthôi SAO anh hồi hộp giùm anh linh ta\nhôm hồi hộp cùng anh Linh hợp lý hơn nhá\nmình hồi hộp Cho bà Vy không ạ hông tôi tôi lại hợp Cho\nAI\nAI mà làm là người chuẩn bị thì người đó phải hồi hộp chứ\nmà mày hồi hộp Cho AI\nthế chị viên\nnhưng mà Tao hồi hộp Cho ông Linh mà\nmở đi mở đi\ntrời ơi trời ơi\nUI sáng dữ vậy trời mà bự nha\nbây giờ á BA chị Vy a\ncầu hôn xong á chị Vy nói chuyện tụi mình\ná chị Vy cứ vậy nè\nha ha ha ủa Will you Marry me\ntrời đất ơi bao giờ mới đến lượt mình ha\nbây giờ chúng mình sẽ phải re hot show\nnha tổng đạo diễn đang chỉ đạo\ntổng đạo diễn Lucy Nguyễn\nhiện nay là đang chỉ đạo là Cho nó vào khuôn khổ đây\nbây giờ đi 2 hàng đây để đợi a gọi là nhân vật chính đi qua\nquay từ bên góc bên Kia qua đó\nanh camera ơi anh quay vô đây thấy tụi em đẹp chưa\nlà 2 người đứng 2 hàng nè\nđúng hông cũng đang thi nét tóc bộ đồ luôn đó trời\nrất là Chan tê\nChan tê lên\nhông phải anh vắt ly luôn để coi cái đường dây nó khô kìa\nrồi đây học bài đó học bài đó\nđang học bài đó\nnào nào bây giờ chị gọi đi\nem ơi em đâu rồi\nem đang sắp tới rồi chị tại tiệc xe quá\ntrời ơi trễ lắm luôn rồi á bé ơi\ndạ dạ\ntại vì công ty nó kêu là bên chị kêu là 15 phút nữa mới đi\nnên em đâu có biết đâu\nvậy á hả đứa nào vậy ta\nưm tiên nó nói là bên chị giận em\ntrời mấy đứa này thiệt tình á chứ\ndạ nãy chị Trang vắng em\ná chị nên là em bây giờ em mới đặt xe đi nè\nem Ra tới làm việc phải nghỉ rồi SAO\ncon trang này nó bị gì vậy ta\ntrời ơi chớ để em em dám mở Ra chị trang thử nha\nem ơi có cách nào đi nhanh hơn giúp\nchị xíu được hông dạ em sắp tới rồi chắc cỡ ơ\nmấy phút luôn anh này ráng giùm chị nha không là\ndạ mệt mỏi lắm ở đây\nđể chị về chị nói với trang coi SAO dạ khó chịu thiệt á chứ\nSAO ác dữ vậy má SAO ác dữ vậy má\nSAO chị\ncăng vậy trời\nMel\ncảm ơn em vì đã bao dung\nđã luôn ở cạnh để giúp anh hiểu Ra như thế nào là tình yêu\nhaha\nnếu hông đồng ý anh thì đồng ý AI giờ anh quỳ xuống lại\n예 오\n예\nㅎㅎ 오 오\nem\ncó chuẩn bị một cái món quà nhỏ nhỏ\nmột cái bài hát mới chỉ có bên em mà thôi\ncái lúc Cho nhau vui hông vui hông\nSAO\nchị khóc dữ\nvậy\ncô ấy đồng ý rồi\n4 tỷ rưỡi"
    }
  ]
}