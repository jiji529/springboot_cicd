# 프리미엄 서비스 (평가 / 통계 / 환경설정 )

## 서버 정보
```
CentOS : 6.9 (Final)
Apache : Apache/2.2.15 (Unix)
PHP : 5.3.3
MySQL : 5.1.73

NodeJS : 10.15.0
NPM : 6.5.0
```

## 프로젝트 설치
```
yarn install
```

## 프로젝트 환경 설정
```
.env file : Data API 정보를 통합 관리하는 곳
# 수정 -> 저장 후, npm으로 실행 중이라면 재시작을 해줘야 한다.

:: 운영서버를 바꾸지 않았다면, 수정이 따로 필요없음.
 VUE_APP_USE_PROXY  #운영서버의 API를 사용할 경우, 
 VUE_APP_SERVER_API #운영서버 경로

:: Java & Php 포트 설정
 VUE_APP_JPORT # 기본 AJP 사용 시 :80, 아니면 :8080 (개발에서도 8080)
 VUE_APP_PPORT # 기본 :80 포트
```

### 프로젝트 실행
```
yarn run serve
```

### 프로젝트 배포 (vue.js)
```
yarn run build
```

### 프로젝트 배포 (jenkins 사용 - php 통합)
```
%NODE_PATH% : 로컬(또는 빌드 환경)의 node.exe 절대경로
%VUEJS_WORKSPACE% : 로컬(또는 빌드 환경)의 vue.js workspace 절대경로

:: Build
  set "_node=%NODE_PATH%\node.exe" && cd "%VUEJS_WORKSPACE%" && bundle.cmd

:: Post-build Actions (Exec command)
  cd /home/tomcat/apache-tomcat-9.0.34/webapps_eval/ROOT
  cdt=$(date +"%Y%m%d_%H%M%S")
  mkdir -p ../b/$cdt && mv api css img js favicon.ico index.html ../b/$cdt
  cd dist && mv api css img js favicon.ico index.html ../
  cd .. && rm -r ./dist

Jenkins 프로젝트의 상기 두 곳 수정 확인 후 'Build with Parameters' 실행
```

### 폴더 구조 규칙
```
.
├─ README.md
├─ babel.config.js
├─ package.json
└─ public
│  ├─ favicon.ico
│  └─ index.html
└─ src
   ├─ main.js
   ├─ App.vue
   ├─ routes.js         라우터
   ├─ store.js          상태 관리
   ├─ components        컴포넌트
   │  ├─ common
   │  └─ ...
   ├─ views             라우터 페이지
   │  ├─ MainView.vue
   │  └─ ...
   ├─ api               api 함수
   ├─ utils             필터 등의 유틸리티 함수
   │  ├─ filters.js
   │  ├─ bus.js
   │  └─ ...
   ├─ mixins            믹스인
   │  ├─ index.js
   │  └─ ...
   ├─ plugins           플러그인
   │  ├─ ChartPlugin.js
   │  └─ ...
   ├─ translations      다국어
   │  ├─ index.js
   │  ├─ en.json
   │  └─ ...
   └─ assets            기타 자원
       ├─ images        이미지
       ├─ fonts         폰트
       └─ styles        css
```
