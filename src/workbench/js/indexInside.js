/**
 * 使用span标签包裹内容，然后计算span的宽度 width： px
 * @param valArr
 */
function getTextWidth(str) {
    let width = 0
    const html = document.createElement('span')
    html.innerText = str
    html.className = 'getTextWidth'
    document.querySelector('body').appendChild(html)
    width = document.querySelector('.getTextWidth').offsetWidth
    document.querySelector('.getTextWidth').remove()
    return width
}

/**
 * 遍历列的所有内容，获取最宽一列的宽度
 * @param arr
 */
function getMaxLength(arr) {
    return arr.reduce((acc, item) => {
        if (item) {
            const calcLen = getTextWidth(item)
            if (acc < calcLen) {
                acc = calcLen
            }
        }
        return acc
    }, 0)
}

/* 初始化subviewItem为闭合状态 */
async function subviewItemInit(win, doc) {
    const optionsNode = await doc.getElementsByClassName("subviewItemoptions");
    for (var i = 0; i < optionsNode.length; i++) {
        var realHeight = parseInt(win.getComputedStyle(optionsNode[i]).height) > 250 ? win.getComputedStyle(optionsNode[i]).height : "700px";
        optionsNode[i].setAttribute("real-height", realHeight);
        optionsNode[i].style.height = "0px";
        optionsNode[i].previousElementSibling.setAttribute("unfold-" + i, 1);
        optionsNode[i].previousElementSibling.setAttribute("onclick", "subviewItemOperate(window,this)");
    }
}

/* 打开或关闭subviewItem */
function subviewItemOperate(win, btn) {
    const optionsNode = btn.nextElementSibling;
    const unfold = btn.attributes[1];
    const realHeight = optionsNode.getAttribute("real-height");
    // console.log(unfold.nodeValue, realHeight);
    if (unfold.nodeValue && unfold.nodeValue === "1") {
        optionsNode.style.height = realHeight;
    } else {
        optionsNode.style.height = "0px";
    }
    btn.setAttribute(unfold.nodeName, unfold.nodeValue === "0" ? "1" : "0");
}
/* 控制拖动到极限时不能再次拖动问题 */
var resizeObserve = new MutationObserver(function (mutationsList, observer) {
    var target = mutationsList[0] ? mutationsList[0].target : null
    if (!target) {
        return false
    }

    var parent = target.parentNode
    var classList = target.classList
    var isHorizontal = classList.value.indexOf('horizontal') !== -1

    if (isHorizontal) {
        var parentWidth = parent.clientWidth
        var diffWidth = target.clientWidth - parentWidth
        // console.log(parentWidth, target.clientWidth, diffWidth)
        if (diffWidth > -18 || parentWidth * -1 === diffWidth) {
            target.style.width = parentWidth + 'px'
        }
    } else {
        var offsetTop = target.offsetTop + 16
        var parentHeight = parent.clientHeight
        var maxHeight = parentHeight - offsetTop
        var diffHeight = target.clientHeight - maxHeight
        // console.log(parentHeight, target.clientHeight, maxHeight, diffHeight)
        if (diffHeight > 2) {
            target.style.height = maxHeight + 'px'
        }
    }
})
/* 实时监控表格高度 */
var tableheightObserve = new MutationObserver(function (mutationsList, observer) {
    var target = mutationsList[0] ? mutationsList[0].target : null
    if (!target) {
        return false
    }
    var parent = target.parentNode
    console.log(parent)
    var tableList = parent.querySelectorAll(".el-table")
    for (var i = 0; i < tableList.length; i++) {
        tableList[i].style.height = (parent.clientHeight - 35) + 'px'
    }
})
/* 将对象属性值作为string返回 */
function getObjValue(obj) {
    let str = ''
    for (let key in obj) {
        str = str + obj[key] + ','
    }
    str = str.substring(0, str.length - 1)
    return str
}
/* 拖动目标设置 */
function targetView(win, target) {
    var target = document.querySelectorAll(target)
    for (let i = 0; i < target.length; i++) {
        // console.log(target[i])
        target[i].ondragover = handle_over
        target[i].ondrop = handle_drop
    }

    function handle_over(e) {
        // 阻止浏览器默认行为
        e.preventDefault()
    }
    function handle_drop(e) {
        let node = JSON.parse(e.dataTransfer.getData('node'))
        var _event = new CustomEvent("main:dragBack", {
            detail: {
                data: {
                    nodeId: node.nodeId,
                    displayName: node.displayName.text,
                    nodeClass: node.nodeClass
                }
            }
        })
        e.target.dispatchEvent(_event)
        e.preventDefault()
    }
}
/* 获得元素属性值 */
function getStyle(element, attr) {
    if (element.currentStyle) {
        return element.currentStyle[attr];
    } else {
        return getComputedStyle(element, null).getPropertyValue(attr);
    }
}

function menuItemClick(that, item) {
    if (item.fn && typeof item.fn === 'function' && !item.disabled) {
        item.fn()
        that.showMenu = !that.showMenu
    }
}