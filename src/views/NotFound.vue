<template>
    <div>

        <section>

            <h1> 존재하지 않는 페이지입니다.<br>2초 뒤 첫 페이지로 자동으로 이동합니다.</h1>

            <H4>
                입력하신 페이지 주소를 다시 한번 확인해보시기 바랍니다.<br>
                관련 문의 사항이 있으시면 <a href="https://scrapmaster.co.kr" class="link_more">고객센터</a>로 문의해 주시기 바랍니다.
            </H4>
            <div>
                <a @click="goHome">
                    <span>←이전</span>
                </a>
            </div>
        </section>
        <footer>
            <!--footer-->

            <div class="footer_license">COPYRIGHT&copy; <a href="https://dahami.com/" class="link_dahami">DAHAMI
                COMMUNICATIONS</a>.ALL RIGHTS RESERVED.
            </div>

        </footer>

    </div>
</template>

<script>
    export default {
        name: "NotFound",
        async mounted() {
          setTimeout(() => this.goHome(), 1500);
        },
        methods: {
            goHome() {
                this.$router.push({path: '/'});
            }
        }
    }
</script>

<style scoped>

    section{
        text-align: center;
    }
    h1 {
        font-size: 50px;
        line-height: 50px;
        font-weight: 700;
        color: #252932;
        text-shadow: rgba(61, 61, 61, 0.3) 1px 1px, rgba(61, 61, 61, 0.2) 2px 2px, rgba(61, 61, 61, 0.3) 3px 3px;
    }

    footer {
        max-width: 610px;
        text-align: left;
        margin: 0;
        margin-right: auto;
        margin-left: auto;
        display: block;

        font-style: normal;
        font-weight: normal
    }

    .footer_license {
        text-align: center;
        width: auto;
        padding: 10px 0 10px;
        color: #919191;
        font-size: 11px;
        line-height: 13px;
        font-family: dotum, sans-serif;
    }

    .footer_license .link_dahami {
        color: #919191
    }


</style>