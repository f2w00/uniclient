const config = {
    productName: 'uniclient', // 应用程序名称
    appId: 'uniclient.github.f2w00', // 应用程序唯一标识
    publish: false, // 是否发布到 GitHub 上
    asar: false, // 是否将应用程序打包为asar文件
    files: ['src', 'node_modules'], // 将要打包的文件或目录
    directories: {
        output: 'release', // 打包输出目录
        buildResources: 'buildResources', // 构建资源目录
    },
    win: {
        icon: './workbench/assets/icon/icon.ico', // 可执行文件的图标
        target: 'nsis', // 打包的目标类型
        requestedExecutionLevel: 'requireAdministrator', // 请求管理员权限时用的系统口令
        verifyUpdateCodeSignature: false, // 是否验证更新时的签名，默认为false
        signingHashAlgorithms: [
            // 当签署时，使用的摘要算法列表，支持 sha256 和 sha1。默认使用 sha256。
            'sha256',
            'sha1',
        ],
        rfc3161TimeStampServer: 'http://timestamp.digicert.com', // 向 RFC 3161 时间戳服务器注册时使用的 URL。默认情况下，不占用服务。
    },
    nsis: {
        oneClick: false, // 是否一键安装
        language: '2052', // 安装向导语言
        perMachine: true, // 是否在每台机器上安装，需要管理员权限
        createDesktopShortcut: true, // 是否在桌面上创建快捷方式
        createStartMenuShortcut: true, // 是否在开始菜单上创建快捷方式
        guid: 'uniclient', // 安装程序的 GUID
        shortcutName: 'uniclient', // 创建快捷方式的名称
        artifactName: 'uniclient@${version}.${ext}', // 生成安装文件时的文件名
        allowToChangeInstallationDirectory: true,
    },
}

const builder = require('electron-builder')
builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: config,
})
