# Vue.js SSL(https) 적용방법(개발환경에서 구동시 동작)
 - hosts 파일에 local.scrapmaster.co.kr 을 127.0.0.1로 세팅하고 localhost 대신 사용
 - *.scrapmaster.co.kr 인증서이기 때문에 경고 없이 사용 가능

## 세팅 방법

 - 아파치의 SSLCertificateFile / SSLCertificateKeyFile / SSLCACertificateFile 에 해당하는 인증서 파일 필요
 - vue.config.js에 아래 내용 추가 필요

	const fs = require('fs')
	module.exports = {
		devServer: {
			host: 'local.scrapmaster.co.kr'
			, https: {
				key: fs.readFileSync('ssl/star_scrapmaster_co_kr.key'),
				cert: fs.readFileSync('ssl/star_scrapmaster_co_kr.crt'),
				ca: fs.readFileSync('ssl/star_scrapmaster_co_kr.ca_root'),
			}
		}
	}

## 참고사항

 - 다하미 아파치 설정참고

	SSLCertificateFile /etc/httpd/ssl/star_scrapmaster_co_kr.crt
	SSLCertificateKeyFile /etc/httpd/ssl/star_scrapmaster_co_kr.key
	SSLCertificateChainFile /etc/httpd/ssl/star_scrapmaster_co_kr.ca
	SSLCACertificateFile /etc/httpd/ssl/star_scrapmaster_co_kr.ca_root

 - 일반적인 아파치 설정 예시

	SSLCertificateFile    /etc/apache2/ssl/ssl.crt
	SSLCertificateKeyFile /etc/apache2/ssl/ssl.key
	SSLCertificateChainFile /etc/apache2/ssl/sub.class1.server.ca.pem
	SSLCACertificateFile /etc/apache2/ssl/ca.pem
