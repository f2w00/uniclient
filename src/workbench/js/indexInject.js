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
        viewPath: './components/pluginView.html',
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
function subviewLeftTabsF() {
    var tabList = subviewLeftTabsData
    return tabList
}
