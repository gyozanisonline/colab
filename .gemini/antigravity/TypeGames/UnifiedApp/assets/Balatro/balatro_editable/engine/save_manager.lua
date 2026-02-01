require "love.system" 

if (jit.arch == 'arm64' or jit.arch == 'arm') then jit.off() end

require "love.timer"
require "love.thread"
require "love.filesystem"

-- Try to load platform module (Android-specific), but don't fail if it doesn't exist
local has_platform, platform_module = pcall(require, "love.platform")
if not has_platform then
    print("[DESKTOP MODE] love.platform not available - saves will be local only")
end

require "engine/object"
require "engine/string_packer"
FOS = {
    Success = 0,
    FetchError = 1,
    CloudSaveError = 2,
    Conflict = 3,
    Offline = 4,
    LoadError = 5,
    NotFound = 6
}

--vars needed for sound manager thread
IN_CHANNEL = love.thread.getChannel("save_request")
OUT_CHANNEL = love.thread.getChannel("save_return")

function save_callback(_file, _return_code, _error_string, _local, _remote, _conflictId)
    if _return_code ~= FOS.Conflict then 
        OUT_CHANNEL:push({
            _status = 'OK',
            _filename = _file
        })
    else 
        local _upgrade = nil
        if string.match(_file, "meta") then
            _local = get_table_from_string(_local)
            _remote = get_table_from_string(_remote)
            _local, _upgrade = reconcile_save(_local, _remote, 'meta')
        end

        if string.match(_file, "profile") then
            _local = get_table_from_string(_local)
            _remote = get_table_from_string(_remote)
            _local, _upgrade = reconcile_save(_local, _remote, 'profile')
        end
        
        --CLOUD SAVE AFTER CONFLICT RESOLUTION (only on Android)
        if has_platform and love.platform.resolveConflict then
            love.platform.resolveConflict(_file, compress_table_to_string(_local), _conflictId)
        end

        OUT_CHANNEL:push({
            _status = 'CONFLICT',
            _filename = _file,
            _content = _local,
            _upgrade = _upgrade
        })
    end
end

function cloudsave(_file, _contents)
    -- Only use cloud save on Android
    if has_platform and love.platform.saveGameFile then
        love.platform.saveGameFile(_file, compress_table_to_string(_contents))
    end
    -- Desktop: saves are handled by compress_and_save() which uses local filesystem
end

-- Only set callback if platform module is available
if has_platform and love.platform.setSaveGameCallback then
    love.platform.setSaveGameCallback(save_callback)
end

local status, message = pcall(function()
    while true do
        --Monitor the channel for any new requests
        local request = IN_CHANNEL:pop() -- Value from channel
        while request do
            --Saves progress for settings, unlocks, alerts and discoveries
            if request.type == 'save_progress' then
                local prefix_profile = (request.save_progress.SETTINGS.profile or 1)..''
                if not love.mod_filesystem.getInfo(prefix_profile) then love.mod_filesystem.createDirectory( prefix_profile ) end
                prefix_profile = prefix_profile..'/'

                cloudsave( prefix_profile..'meta.jkr', STR_PACK(request.save_progress.META), save_callback)

                compress_and_save('settings.jkr', request.save_progress.SETTINGS)
                cloudsave(prefix_profile..'profile.jkr', STR_PACK(request.save_progress.PROFILE))
            --Saves the empty profile
            elseif request.type == 'empty_profile' then 
                compress_and_save('settings.jkr', request.save_settings)
                cloudsave(request.profile_num..'/profile.jkr', STR_PACK(request.save_profile), save_callback)
            --Saves the settings file
            elseif request.type == 'save_settings' then 
                compress_and_save('settings.jkr', request.save_settings)
                cloudsave(request.profile_num..'/profile.jkr', STR_PACK(request.save_profile))
            --Saves any notifications
            elseif request.type == 'save_notify' then 
                local prefix_profile = (request.profile_num or 1)..''
                if not love.mod_filesystem.getInfo(prefix_profile) then love.mod_filesystem.createDirectory( prefix_profile ) end
                prefix_profile = prefix_profile..'/'

                local unlock_notify = get_compressed(prefix_profile..'unlock_notify.jkr') or ''

                if request.save_notify and not string.find(unlock_notify, request.save_notify) then 
                    compress_and_save( prefix_profile..'unlock_notify.jkr', unlock_notify..request.save_notify..'\n')
                end

            --Saves the run
            elseif request.type == 'save_run' then 
                local prefix_profile = (request.profile_num or 1)..''
                if not love.mod_filesystem.getInfo(prefix_profile) then love.mod_filesystem.createDirectory( prefix_profile ) end
                prefix_profile = prefix_profile..'/'

                compress_and_save(prefix_profile..'save.jkr', request.save_table)
            end

            request = IN_CHANNEL:pop()
        end

        -- Run callbacks every frame (only on Android)
        if has_platform and love.platform.runSaveGameCallbacks then
            love.platform.runSaveGameCallbacks()
        end

        -- Yield to allow the game to continue running smoothly
        love.timer.sleep(0.01)  -- Small sleep to avoid CPU hogging
    end
end)

if not status then
    print("[PLATFORM] SAVE GAME THREAD ISSUE:")
    print(message)
end
