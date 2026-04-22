import { Worker } from 'worker_threads'
import path from 'path'

const resourcePath = GetResourcePath(GetCurrentResourceName())
const separator = path.sep
const currentResource = GetCurrentResourceName()
const resourcesIndex = resourcePath.lastIndexOf('/resources')
const root = resourcePath.slice(0, resourcesIndex) + '/resources'
const config: {
    START_IF_NOT_STARTED: boolean
} = JSON.parse(LoadResourceFile(currentResource, 'config.json'))

const worker = new Worker(path.join(resourcePath, '/server/worker.js'))

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type AsArgs<T> = T extends any[] ? T : [T]

function onWorkerEvent<T>(event: string, callback: (...args: AsArgs<T>) => any | Promise<any>) {
    worker.on('message', async (message: { action: string; id?: number; data: AsArgs<T> }) => {
        if (message.action !== event) return

        const result = await callback(...message.data)

        if (message.id !== undefined) {
            const id = message.id

            worker.postMessage({ action: 'response', id, data: result })
        }
    })
}

onWorkerEvent<any[]>('log', (...args) => {
    console.log('^6[Watchdog]^7', ...args)
})

onWorkerEvent<string>('restartResource', async (resourceName) => {
    StopResource(resourceName)

    await delay(250)

    StartResource(resourceName)
})

onWorkerEvent<string>('startResource', (resourceName) => {
    StartResource(resourceName)
})

onWorkerEvent<string>('stopResource', (resourceName) => {
    StopResource(resourceName)
})

onWorkerEvent('refreshResources', () => {
    ExecuteCommand('refresh')
})

onWorkerEvent<string>('getResourceState', (resourceName) => {
    return GetResourceState(resourceName)
})

onWorkerEvent('getStartedResources', () => {
    const numResources = GetNumResources()
    const resources: string[] = []

    for (let i = 0; i < numResources; i++) {
        const resourceName = GetResourceByFindIndex(i)

        if (resourceName && GetResourceState(resourceName) === 'started') {
            resources.push(resourceName)
        }
    }

    return resources
})

const SCRIPT_KEYS = ['client_script', 'server_script', 'shared_script'] as const

onWorkerEvent('getResourceScriptFiles', (resourceName: string) => {
    const scriptFiles = new Set<string>()

    for (const key of SCRIPT_KEYS) {
        for (let i = 0; i < GetNumResourceMetadata(resourceName, key); i++) {
            const path = GetResourceMetadata(resourceName, key, i)

            if (path.startsWith('@')) continue

            scriptFiles.add(path)
        }
    }

    return scriptFiles
})

onWorkerEvent('getResourceWatchConfig', (resourceName: string) => {
    const watch: string[] = []
    const ignore: string[] = []

    for (let i = 0; i < GetNumResourceMetadata(resourceName, 'loaf_watchdog_watch'); i++) {
        watch.push(GetResourceMetadata(resourceName, 'loaf_watchdog_watch', i))
    }

    for (let i = 0; i < GetNumResourceMetadata(resourceName, 'loaf_watchdog_ignore'); i++) {
        ignore.push(GetResourceMetadata(resourceName, 'loaf_watchdog_ignore', i))
    }

    return { watch, ignore }
})

worker.on('error', (error) => {
    console.error('Worker error:', error)
})

worker.postMessage({
    action: 'watch',
    data: {
        root,
        currentResource,
        separator,
        config
    }
})
