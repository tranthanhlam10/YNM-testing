// 1. Dán toàn bộ list NID của m vào giữa 2 dấu backtick (`) này
const rawTokens = `csrftoken=4O6knXWTwCgpdhtLkqNjexNdgQOu5t8T;mid=akVudgALAAG_qpsyNnpTjrOYSZJZ;datr=dm5FapO51xa0IzmkSC3FeNaR;ig_did=4BBEE4A8-9C57-45E6-AF58-980EE667EA12;rur=NCG,46344315287,1814859789:01ff19ab2046d0b35e6b431cfb2d100887dee36c2ea3768678c555e18bbebe63ffebe897;ds_user_id=46344315287;sessionid=46344315287%3AO4FY779GPGst3g%3A23%3AAYjI_gAqbZ0s8TOUsroaUP4Of8kaesiFEJKJ1e830g
csrftoken=XrQtvdpXcO7T1qNaGTDFC3sIfilU9BX8;mid=akVubQALAAHxcgkAn2FDNrS233iK;datr=bW5FakF8R481ZPfNdYLwYBZ-;ig_did=8066141D-9A3E-443B-AFFD-F40D983F09D1;rur=LDC,44167602602,1814859785:01ff556a6c199a6acb783418e6c4bc7fb1adff9a9b10b2ade32b8b2058a79d5660cf2a60;ds_user_id=44167602602;sessionid=44167602602%3AKZCnyyoPDFpZ91%3A2%3AAYjiNxZV4mECIjbcIal4Ez5FdlUZiAFUYGQ4odUq3A
csrftoken=JQfOXXAq60cjK813vYQZoMrRw2ZzarDD;mid=akVubQALAAEnCh7wKh3B14jJElIy;datr=bW5FapF_Wf77cdpOUWBrh4oN;ig_did=FFD676FC-3C0E-4818-B598-FB11510067D4;rur=LLA,12572934336,1814859797:01ffbb5c2235cb3f8f8584c3d3a0f1564837132d8d14f03d52a8603fac6b59587e6ae8c7;ds_user_id=12572934336;sessionid=12572934336%3AvMou2rGrxK9tEm%3A2%3AAYiPCxDwIA-VAujKeuNPoiMqvkX1wMWWpeGXIDjhYg
csrftoken=pT3QMnKuadqzdhKrWbem4jUWeNydfgd3;mid=akVueAALAAEBfiIEUMi1IX3Elmj9;datr=eG5Fahs8cf_-wug-mkWi1rDt;ig_did=D8CC15EB-3DEE-44A9-8D86-5F11B09A8638;rur=MAZ,43680356844,1814859802:01ff626687ef7f98f96a8674806ea4d05302fd58e243b2a3d5ecf67b22b88fdbc1db8571;ds_user_id=43680356844;sessionid=43680356844%3AlJFQ2vRAlvSifR%3A5%3AAYiSQIZPQ6XSTJdSFuBUkX8Y9gWxj_4mAtH90iA21w
csrftoken=w0vHAe59lUsMTlALSqChZiWEs25fb0Yn;mid=akVuegALAAE5XvJmFMzFHw88gxzQ;datr=em5FajN4Wzdgqhei17Rv5J5c;ig_did=35B77A19-5777-4C9D-B2FE-7A1DD3DC1BBB;rur=PRN,18188272342,1814859790:01fffdea3b9a636ffd84d276eabf1dfe244f80ccbd9d05d880f45b4b4bcc64e90c30d09a;ds_user_id=18188272342;sessionid=18188272342%3AuRpAclxBvyttnj%3A1%3AAYhDSJ9N_L0IG3U5OTHfId7cqEygs6UZxz6fC8q4lA
csrftoken=K1ycdSG0q7VgCJZcpLsFlftyzojdpKZG;mid=akVubAALAAERgquOwgky7lvA93Ji;datr=bG5FaoKt3vApsrkoTkFVajaR;ig_did=535BFAD2-C853-4C5B-A7B4-5BBD881BA284;rur=CLN,19396555854,1814859794:01ff7b8459c8e04d51fa9862ee55c7277c6fb11239c0b548b115b914ddd40cb63a1bd8f4;ds_user_id=19396555854;sessionid=19396555854%3ASlxFNCZD3IffTd%3A21%3AAYjayjY8YDR7THunJDn2q3yPLQ9GltVLvAW_DsmcTg
csrftoken=bJgcG6kuVfgJUY5dEOcA30XENyu8Py5n;mid=akVudwALAAEsANql2ZW5tZQEXqdE;datr=d25FauPlcQZkklO8VZex4Oju;ig_did=73B2C192-7F5B-4B00-B193-C66F7B266984;rur=LLA,17458384486,1814859785:01ff4504a90fe64694346198d17cd523c507e9347019e57247554ed01ef8165067dcfe5f;ds_user_id=17458384486;sessionid=17458384486%3ACYhVCQxV28Hh9T%3A14%3AAYiZVf14U330QIh3Ewutt-e3ORsHNC0A2aPeH7MCcg
csrftoken=mBmjyQBX91Vtdesf0BGgqrSsVljixpbh;mid=akVubQALAAFJ6BFguW5vWrC03V6w;datr=bW5Fav_DIrY7KMRmxwWw_cpM;ig_did=DFB1F51A-B988-4D4F-A5EF-B316428FAFFD;rur=VLL,15006385002,1814859809:01ffb494486cb46913f22f6ab8cd46d046e0f2eec46833f3afab08b1adf3f8b0caf7a6a3;ds_user_id=15006385002;sessionid=15006385002%3A7Cj0podIwctc5M%3A21%3AAYhDe9g7ViZ5vWmbvXpZSZDKdwaO3B97cf6nuqUVRw
csrftoken=e65dorFctPmhW69KGJ6knDuuKL0on4Rc;mid=akVubQALAAFFqTIddy-vLo8FUFgQ;datr=bW5FakySQKD_uP1lupp_f5Y2;ig_did=DBF2EB72-42C6-41C9-8E3C-95DB63B8448B;rur=NCG,48049706549,1814859782:01ff4a312ac042ffbe6c298cd0686287bd159839ae65384aaaa3c27004390a708214e648;ds_user_id=48049706549;sessionid=48049706549%3AE4IFZ7yyc5JNcq%3A7%3AAYjkjnZJ73HZic2YH9e2baKPB8J4i5V6PuDNLz9AQg
csrftoken=bbGMFS8OfRcGZtx3GhXznxGewu2Aq54N;mid=akVudgALAAEjdS-SfBifGob6pn_y;datr=dm5FaqbXL1KoGaVWHjK_lhzs;ig_did=B5A194B9-6181-4855-8F29-48C27654D7EB;rur=SNB,15503869622,1814859783:01ffe65440cdb04c7c6c638854ab7e086b36a3128be44033017754f451d2516704f05d68;ds_user_id=15503869622;sessionid=15503869622%3AxihWyqurml01vv%3A12%3AAYhun6Zv3t1y7wPNRAic8Uh640L507OyUnP0vM0WEg`;
// 2. Hàm lấy thời gian hiện tại chuẩn format YYYY-MM-DD HH:mm:ss
const getLocalTime = () => {
    const d = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// 3. Tự động xử lý format ra câu SQL
const sqlRows = rawTokens.split('\n')
  .map(t => t.trim())
  .filter(t => t !== '')
  .map(token => {
    const id = crypto.randomUUID(); 
    const date = getLocalTime();
    
    // Đổ data vào đúng thứ tự cột của bảng ynm_tokens.tokens
    return `\t('${id}', 'instagram', '${token}', 'IG_HASHTAG_POST_CRISIS_CRAWLER', 'ACTIVE', '${date}', NULL, '${date}', NULL, NULL, 'VN', NULL, NULL, NULL, NULL)`;
  });

// 4. In ra câu lệnh SQL để copy
console.log(`INSERT INTO ynm_tokens.tokens (id,platform,token,crawler_type,status,created_at,updated_at,last_used,error_message,error_code,country,blockedAt,urlQueryString,cookie,agent) VALUES\n${sqlRows.join(',\n')};`);