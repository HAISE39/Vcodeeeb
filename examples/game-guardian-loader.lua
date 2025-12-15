--[[
  Secure Script Loader for Game Guardian
  
  This loader fetches and executes encrypted Lua scripts from your
  Secure Script Delivery Platform.
  
  SETUP:
  1. Replace YOUR_DOMAIN with your Vercel domain
  2. Replace YOUR_GG_SECRET_KEY with your GG_SECRET_KEY from .env
  3. Replace YOUR_ENCRYPTION_KEY with your ENCRYPTION_KEY from .env
  4. Replace YOUR_SCRIPT_ID with the script ID from dashboard
  
  USAGE:
  Load this script in Game Guardian and it will automatically
  fetch and execute your secure script.
]]

-- CONFIGURATION (EDIT THESE)
local CONFIG = {
    DOMAIN = "YOUR_DOMAIN.vercel.app",
    GG_SECRET_KEY = "YOUR_GG_SECRET_KEY",
    ENCRYPTION_KEY = "YOUR_ENCRYPTION_KEY",
    SCRIPT_ID = "YOUR_SCRIPT_ID"
}

-- AES Decryption Function
-- Note: You may need a Lua crypto library for AES decryption
-- This is a simplified example - adjust based on your crypto library
local function decryptScript(encrypted)
    -- Using crypto-js compatible library (install separately)
    local CryptoJS = require("crypto-js")
    
    local key = CONFIG.ENCRYPTION_KEY
    local bytes = CryptoJS.AES.decrypt(encrypted, key)
    local decrypted = bytes:toString(CryptoJS.enc.Utf8)
    
    return decrypted
end

-- Fallback: Base64 decode (if you prefer simpler encoding)
local function base64Decode(data)
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r,f='',(b:find(x)-1)
        for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if (#x ~= 8) then return '' end
        local c=0
        for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
        return string.char(c)
    end))
end

-- Main Loader Function
local function loadScript(scriptId)
    gg.alert("🔄 Loading script from secure server...")
    
    -- Make HTTP request to secure endpoint
    local response = gg.makeRequest({
        url = "https://" .. CONFIG.DOMAIN .. "/api/raw/" .. scriptId,
        headers = {
            ["X-GG-KEY"] = CONFIG.GG_SECRET_KEY,
            ["X-CLIENT-TYPE"] = "GG",
            ["User-Agent"] = "GameGuardian/Loader"
        }
    })
    
    -- Check response
    if not response then
        gg.alert("❌ Error: No response from server")
        return false
    end
    
    if response.code ~= 200 then
        gg.alert("❌ Error: Server returned " .. tostring(response.code))
        return false
    end
    
    -- Decrypt script content
    local decrypted
    local success, err = pcall(function()
        decrypted = decryptScript(response.content)
    end)
    
    if not success then
        gg.alert("❌ Decryption failed: " .. tostring(err))
        return false
    end
    
    -- Load and execute script
    local func, loadErr = load(decrypted)
    if not func then
        gg.alert("❌ Script load error: " .. tostring(loadErr))
        return false
    end
    
    -- Execute the script
    local execSuccess, execErr = pcall(func)
    if not execSuccess then
        gg.alert("❌ Script execution error: " .. tostring(execErr))
        return false
    end
    
    gg.alert("✅ Script loaded successfully!")
    return true
end

-- Alternative: Simpler loader without decryption (for testing)
local function loadScriptSimple(scriptId)
    gg.alert("🔄 Loading script...")
    
    local response = gg.makeRequest({
        url = "https://" .. CONFIG.DOMAIN .. "/api/raw/" .. scriptId,
        headers = {
            ["X-GG-KEY"] = CONFIG.GG_SECRET_KEY,
            ["X-CLIENT-TYPE"] = "GG"
        }
    })
    
    if response and response.code == 200 then
        -- Assuming script is base64 encoded instead of AES
        local decoded = base64Decode(response.content)
        local func = load(decoded)
        if func then
            func()
            return true
        end
    end
    
    gg.alert("❌ Failed to load script")
    return false
end

-- Multi-Script Loader (load multiple scripts)
local function loadMultipleScripts(scriptIds)
    for i, scriptId in ipairs(scriptIds) do
        gg.alert("Loading script " .. i .. " of " .. #scriptIds)
        if not loadScript(scriptId) then
            return false
        end
    end
    return true
end

-- Main Menu
local function showMenu()
    local menu = gg.choice({
        "🚀 Load Main Script",
        "📋 Load Multiple Scripts",
        "ℹ️ About",
        "❌ Exit"
    }, nil, "Secure Script Loader")
    
    if menu == 1 then
        loadScript(CONFIG.SCRIPT_ID)
    elseif menu == 2 then
        -- Example: Load multiple scripts
        local scripts = {
            "script-id-1",
            "script-id-2",
            "script-id-3"
        }
        loadMultipleScripts(scripts)
    elseif menu == 3 then
        gg.alert([[
Secure Script Loader v1.0

This loader fetches encrypted scripts from your
secure delivery platform and executes them safely.

Features:
✅ AES Encryption
✅ Header Validation
✅ Secure Delivery
✅ Auto Updates

Domain: ]] .. CONFIG.DOMAIN .. [[

Script ID: ]] .. CONFIG.SCRIPT_ID)
    elseif menu == 4 then
        gg.alert("Goodbye! 👋")
        os.exit()
    end
end

-- Auto-load script on start (comment out if you want menu)
loadScript(CONFIG.SCRIPT_ID)

-- Uncomment to show menu instead:
-- while true do
--     if gg.isVisible() then
--         gg.setVisible(false)
--         showMenu()
--     end
--     gg.sleep(100)
-- end
