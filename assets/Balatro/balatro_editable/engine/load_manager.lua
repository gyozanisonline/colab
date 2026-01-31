require "love.system" 

if (jit.arch == 'arm64' or jit.arch == 'arm') then jit.off() end

require "love.timer"
require "love.thread"
require "love.filesystem"

-- Try to load platform module (Android-specific), but don't fail if it doesn't exist
local has_platform, platform_module = pcall(require, "love.platform")
if not has_platform then
    print("[DESKTOP MODE] love.platform not available - using local file system only")
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

IN_CHANNEL = love.thread.getChannel("load_request")
OUT_CHANNEL = love.thread.getChannel('load_return')

function load_callback(_file, _return_code, _error_string, _local, _remote, _conflictId)
    if _return_code == FOS.Conflict then
        local _upgrade = nil
        if string.match(_file, "meta") then
            _local = get_table_from_string(_local)
            _remote = get_table_from_string(_remote)
            _local = reconcile_save(_local, _remote, 'meta', true)
        end

        if string.match(_file, "profile") then
            _local = get_table_from_string(_local)
            _remote = get_table_from_string(_remote)
            _local = reconcile_save(_local, _remote, 'profile', true)
        end
        
        --CLOUD SAVE AFTER CONFLICT RESOLUTION (only on Android)
        if has_platform and love.platform.resolveConflict then
            love.platform.resolveConflict(_file, compress_table_to_string(_local), _conflictId)
        end

        OUT_CHANNEL:push({
            _status = 'OK',
            _filename = _file,
            _content = _local,
            _upgrade = _upgrade
        })
    elseif _local ~= nil then
        -- irrespective of return code, if we have no conflict, local will always contain what we want to load
        _local = get_table_from_string(_local)
        OUT_CHANNEL:push({
            _status = 'OK',
            _filename = _file,
            _content = _local
        })
    else
        -- if not conflict, and no local file, consider this not found
        OUT_CHANNEL:push({
            _status = 'NOT FOUND',
            _filename = _file,
            _content = nil
        })    
    end
end

function fakeload(_file, _callback)
    local _contents = get_compressed(_file)
    if _contents then
        _callback(_file, FOS.Success, '', _contents, nil)
        return
    end
    _callback(_file, FOS.NotFound, '', _contents, nil)
end

-- Only set callback if platform module is available
if has_platform and love.platform.setLoadGameCallback then
    love.platform.setLoadGameCallback(load_callback)
end

local status, message = pcall(function()
    while true do
        -- Check the channel for any new requests without blocking
        local request = IN_CHANNEL:pop()  -- Non-blocking check
        
        while request do
            -- Async Load
            if request.type == 'load_request' then
                -- CLOUD SAVE (only on Android)
                if has_platform and love.platform.loadGameFile then
                    love.platform.loadGameFile(request.file)
                else
                    -- Desktop fallback: use local file system
                    fakeload(request.file, load_callback)
                end
            end
            
            -- Check for the next message
            request = IN_CHANNEL:pop()
        end


        -- Run callbacks every frame (only on Android)
        if has_platform and love.platform.runLoadGameCallbacks then
            love.platform.runLoadGameCallbacks()
        end

        -- Yield to allow the game to continue running smoothly
        love.timer.sleep(0.01)  -- Small sleep to avoid CPU hogging
    end

end)

if not status then
    print("[PLATFORM] LOAD GAME THREAD ISSUE:")
    print(message)
end
