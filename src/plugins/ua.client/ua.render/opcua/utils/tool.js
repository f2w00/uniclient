/* 初始化subviewItem为闭合状态 */
async function subviewItemInit(win, doc) {
    const optionsNode = await doc.getElementsByClassName("subviewItemoptions");
    for (var i = 0; i < optionsNode.length; i++) {
        optionsNode[i].style.height = "0px";
        optionsNode[i].previousElementSibling.setAttribute("unfold-" + i, 1);
        optionsNode[i].previousElementSibling.setAttribute("onclick", "subviewItemOperate(window,document,this)");
    }
}
/* 打开或关闭subviewItem */
function subviewItemOperate(win, doc, btn) {
    var subviewHeight = btn.parentElement.parentElement.clientHeight;
    const optionsNode = btn.nextElementSibling;
    const unfold = btn.attributes[1];
    // const realHeight = optionsNode.getAttribute("real-height");
    const realHeight = subviewHeight - 40;
    if (unfold.nodeValue && unfold.nodeValue === "1") {
        optionsNode.style.height = realHeight;
    } else {
        optionsNode.style.height = "0px";
    }
    btn.setAttribute(unfold.nodeName, unfold.nodeValue === "0" ? "1" : "0");
}
/* 拖动目标设置 */
function targetView(win, target) {
    var target = document.querySelector(target)
    target.ondragover = handle_over
    target.ondrop = handle_drop

    function handle_over(e) {
        // 阻止浏览器默认行为
        e.preventDefault()
    }
    function handle_drop(e) {
        e.stopPropagation();
        e.preventDefault()
        // console.log(e.dataTransfer.getData('node'))
        let node = JSON.parse(e.dataTransfer.getData('node'))
        win.parent.uniclient.windowEvent.emit(`opcua:subscript.dragback`, {
            detail: {
                data: {
                    nodeId: node.nodeId,
                    displayName: node.displayName.text,
                    nodeClass: node.nodeClass
                }
            }
        })
    }
}
/* 将对象属性值作为string返回 */
function getObjValue(obj) {
    let str = ''
    for (let key in obj) {
        str = str + obj[key] + ','
    }
    str = str.substring(0, str.length - 1)
    return str
}