<template>
    <div class="cont_wrap">
        <iframe id="oldEmailSetting" :src="oldLink"
                style="width: 100%; height: 100%; border: none"></iframe>
    </div>
</template>

<script>
    import {mapGetters} from 'vuex';
    export default {
        name: 'Mail'
        ,computed: {
            ...mapGetters({
                pid: 'getPremiumID'
            })
            ,oldLink ()  {
                return 'https://premium.scrapmaster.co.kr/server/vm_premium/mailBook_v2.php?nonTopMenu=webEval&userinfo='+this.pid;
            }
        }
    };
</script>
<style scoped>
</style>