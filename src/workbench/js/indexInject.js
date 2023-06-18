let menuList = [
    {
        label: '日志',
        tips: 'Log',
        fn: (that) => {
            console.log("Log")
        }
    },
    {
        label: '服务',
        tips: 'Server',
        fn: (that) => {
            console.log("Server")
            that.handleAddserver()
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
        title: 'Tab 2',
        name: '2',
        content: '资源管理器',
        iconSrc: './assets/icon/space.svg',
        itemList: [
            {
                title: 'Project-2',
                name: '1',
                content: 'Project-2',
                items: [],
            },
            {
                title: 'Address-2',
                name: '2',
                content: 'Address-2',
                items: [],
            },
        ],
    },
    {
        title: 'Tab 3',
        name: '3',
        content: '资源管理器',
        iconSrc: './assets/icon/plugin.svg',
        itemList: [
            {
                title: 'Project-3',
                name: '1',
                content: 'Project-3',
                items: [],
            },
            {
                title: 'Address-3',
                name: '2',
                content: 'Address-3',
                items: [],
            },
        ],
    },
    {
        title: 'Tab 3',
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
        name: 'uaclient',
        content: 'opcua',
        iconSrc: './assets/icon/project.svg',
        viewPath: '../../src/plugins/ua.client/ua.render/opcua/address.html',
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
            } /* {
        title: 'References',
        name: '2',
        content: 'References',
        items: []
    } */,
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
