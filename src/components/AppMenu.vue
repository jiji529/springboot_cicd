<template>
  <nav >
    <ul v-if="old">
      <li>
        <router-link to="/old/eval" tabindex="-1">평가</router-link>
      </li>
      <li>
        <router-link to="/old/stat" tabindex="-1">통계</router-link>
      </li>
      <li>
        <router-link to="/old/search" tabindex="-1">검색</router-link>
      </li>
      <li>
        <router-link to="/old/setting" tabindex="-1">환경설정</router-link>
      </li>
      <li>
        <router-link to="/old/preview" tabindex="-1">뷰어 미리보기</router-link>
      </li>
      <li>
        <router-link to="/old/email" tabindex="-1">이메일 발송</router-link>
      </li>
    </ul>
    <ul v-else>
      <li>
        <router-link to="/eval" tabindex="-1">평가 / 검색</router-link>
      </li>
      <li>
        <router-link to="/stat" tabindex="-1">통계</router-link>
      </li>
      <li>
        <router-link to="/setting" tabindex="-1">환경설정</router-link>
      </li>
      <li>
        <router-link to="/preview" tabindex="-1">뷰어 관리</router-link>
      </li>
      <li>
        <router-link to="/email" tabindex="-1">이메일 발송</router-link>
      </li>

    </ul>
  </nav>
</template>

<script>
  export default {
    name: 'app-menu',
    props :['old']
  };

</script>

<style scoped>


</style>
