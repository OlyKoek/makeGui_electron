// Node.jsのすべてのAPIがプリロード処理で利用可能です。
// Chromeの拡張機能と同じサンドボックスを持っています。
const {remote,contextBridge,ipcRenderer} =  require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})

contextBridge.exposeInMainWorld('myApi', {
    setup: ()=>{
        /*
        document.querySelector('#open').addEventListener('click', async () => {
            console.debug(`openをclickした！`)
            const { canceled, data } = await ipcRenderer.invoke('open')
            if (canceled) { return }
            document.querySelector('#text').value = data[0] || ''
        })
        document.querySelector('#save').addEventListener('click', async () => {
            const data =  document.querySelector('#text').value
            await ipcRenderer.invoke('save', data)
        })
        */
        document.querySelector('#run').addEventListener('click', async () => {
            const result = await ipcRenderer.invoke('shell', document.getElementById('command').value)
            document.getElementById('result').value = result.stdout;
        })
    },
})