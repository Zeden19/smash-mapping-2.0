<script>
    export let tooltip = false
    export let marginRight;

</script>

<div data-tooltip={tooltip} style="--marginR: {marginRight}" class="circle">?</div>

<style>
    .circle {
        display: flex;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #999;
        cursor: pointer;
        justify-content: center;
        align-items: center;
        float: right;
        margin-right: var(--marginR);
    }

    .circle:hover {
        background-color: #777;
    }

    [data-tooltip] {
        position: relative;
        z-index: 2;
        display: flex;
    }

    [data-tooltip]:before,
    [data-tooltip]:after {
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
        transition: .2s ease-out;
        transform: translate(-50%, 5px)
    }

    [data-tooltip]:before {
        position: absolute;
        bottom: 100%;
        left: 50%;
        margin-bottom: 5px;
        padding: 7px;
        width: 15em;
        height: fit-content(100%);
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
        background-color: #000;
        background-color: hsla(0, 0%, 20%, 0.9);
        color: #fff;
        content: attr(data-tooltip);
        text-align: center;
        font-size: 14px;
        line-height: 1.2;
        transition: .2s ease-out;
        white-space: break-spaces;
        overflow: visible;
    }

    [data-tooltip]:after {
        position: absolute;
        bottom: 100%;
        left: 50%;
        width: 0;
        border-top: 5px solid #000;
        border-top: 5px solid hsla(0, 0%, 20%, 0.9);
        border-right: 5px solid transparent;
        border-left: 5px solid transparent;
        content: " ";
        font-size: 0;
        line-height: 0;
    }

    [data-tooltip]:hover:before,
    [data-tooltip]:hover:after {
        visibility: visible;
        opacity: 1;
        transform: translate(-50%, 0)
    }

    [data-tooltip=false]:hover:before,
    [data-tooltip=false]:hover:after {
        visibility: hidden;
        opacity: 0;
    }


</style>