<template>
    <div class="alert-component">
        <section class="image">
            <div alt=""></div>
        </section>
        <section class="message">
            <main>{{kind}}</main>
            <span>{{message}}</span>
        </section>
    </div>
</template>

<script>
export default {
    nmae: 'Alert',
    props: ['kind', 'message'],
    watch: {
        kind(value) {
            return value;
        },
        message(value) {
            return value;
        }
    }
}
</script>

<style scoped>
    .alert-component {
        position: fixed;
        display: flex;
        flex-direction: row;
        width: 570px;
        height: 85px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fef8eb;
        border: 5px solid #f5e0b7;
        border-radius: 10px;
    }
    .alert-component > section.image { width: 20%; }
    .alert-component > section.message { width: 80%; }
    .alert-component > section.message > main {
        color: black;
        font-size: 18px;
        font-weight: 900;
        padding: 9px 0;
    }
    .alert-component > section.message > span {
        display: inline-block;
        width: 100%;
        font-size: 14px;
        font-weight: 700;
        color: #545454;
    }
    .alert-component > section.image > div {
        display: inline-block;
        width: 60px;
        height: 60px;
        background-image: url('../assets/images/exclamation-mark.png');
        background-repeat: no-repeat;
        background-size: cover;
        transform: translate(17px, 6px);
    }
</style>