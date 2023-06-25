let menuList = [
    {
        label: '日志',
        tips: 'Log',
        fn: (that) => {
            console.log("Log")
        }
    },
    {
        label: '文档',
        tips: 'Document',
        fn: (that) => {
            console.log("Document")
        }
    },
    {
        label: '设置',
        tips: 'Settings',
        fn: (that) => {
            console.log("Settings")
        },
        disabled: () => true
    },
    {
        line: true
    },
    {
        label: 'OPCUA',
        tips: '',
        children: [
            {
                label: '服务',
                tips: 'Server',
                fn: (that) => {
                    console.log("Server", "addServerView")
                    that.handleAddserver({ viewPath: '../../src/plugins/ua.client/ua.render/opcua/addServerView.html' })
                }
            },
            {
                label: '打开',
                tips: 'Open',
                fn: (that) => {
                    console.log("OPCUA", "打开")
                }
            },
            {
                label: '编辑',
                tips: 'Edit',
                disabled: () => true,
                fn: (that) => {
                    console.log("OPCUA", "编辑")
                }
            },
            {
                label: '删除',
                tips: 'Delete',
                fn: (that) => {
                    console.log("OPCUA", "删除")
                }
            }
        ]
    }
]

let subviewLeftTabsData = [
    { title: 'mainMenu', name: 'mainMenu', iconSrc: './assets/icon/icon.svg', disabled: true },
    {
        title: 'space',
        name: 'space',
        content: '项目',
        iconSrc: './assets/icon/space.svg',
        viewPath: './components/projectView.html',
    },
    {
        title: 'plugin',
        name: 'plugin',
        content: '插件',
        iconSrc: './assets/icon/plugin.svg',
        viewPath: './components/welcome.html',
    },
    {
        title: 'tutorial',
        name: 'tutorial',
        content: '用户手册',
        iconSrc: './assets/icon/tutorial.svg',
        viewPath: './components/tutorial/tutorial.html',
        clickSendToWindow: [
            {
                event: 'leftBar:click.tutorial',
                params: [
                    {
                        title: 'tutorial',
                        name: 'tutorial',
                        content: 'Tab 1 content',
                        src: './components/tutorial/uniclient.html',
                    },
                    {
                        title: 'uaclient',
                        name: 'uaclient',
                        content: 'uaclient',
                        src: './components/tutorial/uniclient.html',
                    },
                    {
                        title: 'ok',
                        name: 'ok',
                        content: 'ok',
                        src: './components/tutorial/uniclient.html',
                    },
                ],
            },
        ],
    },
    {
        title: 'opcua',
        name: 'opcua',
        content: 'opcua',
        iconSrc: '../../src/plugins/ua.client/ua.render/opcua/assets/project.svg',
        viewPath: '../../src/plugins/ua.client/ua.render/opcua/address.html',
        clickSendToWindow: [],
        clickCreateTab: [
            {
                event: 'leftBar:created.opcua',
                params: [
                    {
                        title: 'dataView',
                        name: 'dataView',
                        content: 'dataView',
                        position: 'main',
                        src: '../../src/plugins/ua.client/ua.render/opcua/dataView.html',
                    },
                    {
                        title: 'attributes',
                        name: 'attributes',
                        content: 'attributes',
                        iconSrc: './assets/icon/attribute-management.svg',
                        position: 'right',
                        src: '../../src/plugins/ua.client/ua.render/opcua/attributes.html',
                    },
                ]
            }
        ]
    },
    {
        title: 'easy-report',
        name: 'easy-report',
        content: 'easy-report',
        iconSrc: '../../src/plugins/easy-report/assets/report.svg',
        viewPath: '../../src/plugins/easy-report/index.html',
        clickSendToWindow: [],
        clickCreateTab: [
            {
                event: 'leftBar:created.easy-report',
                params: [
                    {
                        title: 'easy-report',
                        name: 'easy-report',
                        content: 'easy-report',
                        position: 'main',
                        src: '../../src/plugins/easy-report/dist/index.html',
                    }
                ]
            }
        ]
    },
]
let subviewRightTabsData = [
    {
        title: 'Tab 1',
        name: '1',
        content: '简略信息',
        iconSrc: './assets/icon/attribute-management.svg',
        viewPath: '../../src/plugins/ua.client/ua.render/attributes.html',
        itemList: [
            {
                title: 'Attributes',
                name: '1',
                content: 'Attributes',
                items: [],
            }
        ],
    },
    {
        title: 'Tab 2',
        name: '2',
        content: 'Tab 2 content',
        iconSrc: './assets/icon/reference-management.svg',
        itemList: [
            {
                title: 'Project',
                name: '1',
                content: 'Project',
                items: [],
            },
            {
                title: 'Address',
                name: '2',
                content: 'Address',
                items: [],
            },
        ],
    },
]
let logTableData = []
let problemTableData = []
let attributeTableData = []
let addressTreeData = []
function getsubviewLeftFiledata(fileData, tabSign, itemSign) {
    for (var i = 0; i < subviewLeftTabsData.length; i++) {
        if (subviewLeftTabsData[i].itemList && subviewLeftTabsData[i].title === tabSign) {
            for (var j = 0; subviewLeftTabsData[i].itemList.length > j; j++) {
                if (subviewLeftTabsData[i].itemList[j].title === itemSign) {
                    fileData.forEach((element) => {
                        subviewLeftTabsData[i].itemList[j].items.push(element)
                    })
                    break
                }
            }
        } else {
            break
        }
    }
}
function mainTabsF() {
    var tabList = mainTabsData
    return tabList
}
function menuListF() {
    var list = menuList
    return list
}
function subviewLeftTabsF() {
    var tabList = subviewLeftTabsData
    return tabList
}
function subviewRightTabsF() {
    var tabList = subviewRightTabsData
    return tabList
}

function subviewRightTabsF() {
    var tabList = subviewRightTabsData
    return tabList
}

function logTableF() {
    var tableData = logTableData
    return tableData
}

function problemTableF() {
    var tableData = problemTableData
    return tableData
}

function attributeTableF() {
    var tableData = attributeTableData
    return tableData
}
