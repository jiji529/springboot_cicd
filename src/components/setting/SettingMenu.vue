<template>
  <div class="pre_top" :class="[$route.name === 'setting-eval-auto' ? 'setting' : 'sch']">
    <ul class="stat">
      <li :class="{ 'on': $route.name === 'setting-eval-item' }"><router-link to="/setting/eval-item">수동 평가 설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-eval-auto' }"><router-link to="/setting/eval-auto">자동 평가 설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-eval-media' }"><router-link to="/setting/eval-media">적용 단가 설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-eval-value' }"><router-link to="/setting/eval-value">가치 계산  설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-media-category' }"><router-link to="/setting/media-category">매체 분류 설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-layout' }"><router-link to="/setting/layout">평가 화면 설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-stat-config' }"><router-link to="/setting/stat-config">통계 구성 설정</router-link></li>
      <li :class="{ 'on': $route.name === 'setting-email' }"><router-link to="/setting/email">메일 설정</router-link></li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'stat-menu'
  };
</script>

<style scoped>
</style>
