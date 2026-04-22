# Watchdog

A FiveM script that automatically restarts resources when a `.lua` or `.js` file is saved, created, or deleted, speeding up development.

## Features

- Automatically restarts resources when a `.lua` or `.js` file is changed, created, or deleted
- Automatically refreshes resources when `fxmanifest.lua` is changed or created, or when files are created
- Delete entities when resources are stopped
    - Can be disabled in `config.json` by changing `DELETE_ENTITIES`
- Only files in `client_script`, `shared_script`, or `server_script` in the `fxmanifest.lua` are watched
    - You can also set `loaf_watchdog_watch` and `loaf_watchdog_ignore` to watch or ignore specific files

## Installation

1. Download the latest release from the [releases page](https://github.com/loaf-scripts/loaf_watchdog/releases/latest/download/loaf_watchdog.zip)
2. Add the script to your `resources` folder
3. Add `add_ace resource.loaf_watchdog command.refresh allow` to your `server.cfg`
4. Add `add_unsafe_worker_permission loaf_watchdog` to your `server.cfg`
5. Add `start loaf_watchdog` to the bottom of your `server.cfg`
6. Start/restart your server
