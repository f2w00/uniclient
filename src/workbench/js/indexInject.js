let mainTabsData = [{
    title: 'dataView',
    name: 'opcua',
    content: 'Tab 1 content',
    src: "./components/opcua/dataView.html"
}];
let subviewLeftTabsData = [{
    title: 'resourceManagement',
    name: '1',
    content: '资源管理器',
    iconSrc: "./assets/icon/space.svg",
    itemList: [{
        title: 'Project',
        name: '1',
        content: 'Project',
        items: []
    }, {
        title: 'Address',
        name: '2',
        content: 'Address',
        items: []
    }]
}, {
    title: 'Tab 2',
    name: '2',
    content: '资源管理器',
    iconSrc: "./assets/icon/project.svg",
    itemList: [{
        title: 'Project-2',
        name: '1',
        content: 'Project-2',
        items: []
    }, {
        title: 'Address-2',
        name: '2',
        content: 'Address-2',
        items: []
    }]
}, {
    title: 'Tab 3',
    name: '3',
    content: '资源管理器',
    iconSrc: "./assets/icon/plugin.svg",
    itemList: [{
        title: 'Project-3',
        name: '1',
        content: 'Project-3',
        items: []
    }, {
        title: 'Address-3',
        name: '2',
        content: 'Address-3',
        items: []
    }]
}];
let subviewRightTabsData = [{
    title: 'Tab 1',
    name: '1',
    content: '简略信息',
    iconSrc: "./assets/icon/attribute-management.svg",
    itemList: [{
        title: 'Attributes',
        name: '1',
        content: 'Attributes',
        items: []
    }, /* {
        title: 'References',
        name: '2',
        content: 'References',
        items: []
    } */]
}, {
    title: 'Tab 2',
    name: '2',
    content: 'Tab 2 content',
    iconSrc: "./assets/icon/reference-management.svg",
    itemList: [{
        title: 'Project',
        name: '1',
        content: 'Project',
        items: []
    }, {
        title: 'Address',
        name: '2',
        content: 'Address',
        items: []
    }]
}];
let logTableData = [];
let problemTableData = [{
    timestamp: '2016-05-02',
    source: '王小虎',
    information: '上海市普陀区'
}, {
    timestamp: '2016-05-02',
    source: '王小虎',
    information: '上海市普陀区金沙江路 1518 弄'
}, {
    timestamp: '2016-05-02',
    source: '王小虎',
    information: '上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄'
}, {
    timestamp: '2016-05-02',
    source: '王小虎',
    information: '上海市普陀区金沙江路 1518 弄'
}, {
    timestamp: '2016-05-02',
    source: '王小虎',
    information: '上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄上海市普陀区金沙江路 1518 弄'
}];
let attributeTableData = [];
let addressTreeData = [];
function getsubviewLeftFiledata(fileData, tabSign, itemSign) {
    for (var i = 0; i < subviewLeftTabsData.length; i++) {
        if (subviewLeftTabsData[i].itemList && subviewLeftTabsData[i].title === tabSign) {
            for (var j = 0; subviewLeftTabsData[i].itemList.length > j; j++) {
                if (subviewLeftTabsData[i].itemList[j].title === itemSign) {
                    fileData.forEach(element => {
                        subviewLeftTabsData[i].itemList[j].items.push(element)
                    });
                    break;
                }
            }
        } else {
            break;
        }
    }
}
function mainTabsF() {
    var tabList = mainTabsData
    return tabList;
}
function subviewLeftTabsF() {
    var tabList = subviewLeftTabsData
    return tabList;
}
function subviewRightTabsF() {
    var tabList = subviewRightTabsData
    return tabList;
}

function subviewRightTabsF() {
    var tabList = subviewRightTabsData
    return tabList;
}

function logTableF() {
    var tableData = logTableData
    return tableData;
}

function problemTableF() {
    var tableData = problemTableData
    return tableData;
}

function attributeTableF() {
    var tableData = attributeTableData
    return tableData;
}