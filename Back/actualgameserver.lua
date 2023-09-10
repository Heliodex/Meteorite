local url = "http://mete0r.xyz"  -- have to set to https for production
------------------- UTILITY FUNCTIONS --------------------------



function waitForChild(parent, childName)
	while true do
		local child = parent:findFirstChild(childName)
		if child then
			return child
		end
		parent.ChildAdded:wait()
	end
end

-----------------------------------END UTILITY FUNCTIONS -------------------------

-----------------------------------"CUSTOM" SHARED CODE----------------------------------
--print(port)
pcall(function() settings().Network.UseInstancePacketCache = true end)
pcall(function() settings().Network.UsePhysicsPacketCache = true end)
--pcall(function() settings()["Task Scheduler"].PriorityMethod = Enum.PriorityMethod.FIFO end)
pcall(function() settings()["Task Scheduler"].PriorityMethod = Enum.PriorityMethod.AccumulatedError end)

--settings().Network.PhysicsSend = 1 -- 1==RoundRobin
--settings().Network.PhysicsSend = Enum.PhysicsSendMethod.ErrorComputation2
settings().Network.PhysicsSend = Enum.PhysicsSendMethod.TopNErrors
settings().Network.ExperimentalPhysicsEnabled = true
settings().Network.WaitingForCharacterLogRate = 100
pcall(function() settings().Diagnostics:LegacyScriptMode() end)

-----------------------------------START GAME SHARED SCRIPT------------------------------

local assetId = placeId -- might be able to remove this now

local scriptContext = game:GetService('ScriptContext')
pcall(function() scriptContext:AddStarterScript(37801172) end)
scriptContext.ScriptsDisabled = true

game:SetPlaceID(assetId, false)
game:GetService("ChangeHistoryService"):SetEnabled(false)

-- establish this peer as the Server
local ns = game:GetService("NetworkServer")

if url~=nil then
	pcall(function() game:GetService("Players"):SetAbuseReportUrl(url .. "/AbuseReport/InGameChatHandler.ashx") end)
---@diagnostic disable-next-line: invalid-class-name
	pcall(function() game:GetService("ScriptInformationProvider"):SetAssetUrl(url .. "/Asset/") end)
	pcall(function() game:GetService("ContentProvider"):SetBaseUrl(url .. "/") end)
	--pcall(function() game:GetService("Players"):SetChatFilterUrl(url .. "/Game/ChatFilter.ashx") end)

	game:GetService("BadgeService"):SetPlaceId(placeId)

	game:GetService("BadgeService"):SetIsBadgeLegalUrl("")
	game:GetService("InsertService"):SetBaseSetsUrl(url .. "/Game/Tools/InsertAsset.ashx?nsets=10&type=base")
	game:GetService("InsertService"):SetUserSetsUrl(url .. "/Game/Tools/InsertAsset.ashx?nsets=20&type=user&userid=%d")
	game:GetService("InsertService"):SetCollectionUrl(url .. "/Game/Tools/InsertAsset.ashx?sid=%d")
	game:GetService("InsertService"):SetAssetUrl(url .. "/Asset/?id=%d")
	game:GetService("InsertService"):SetAssetVersionUrl(url .. "/Asset/?assetversionid=%d")
	
	pcall(function() loadfile(url .. "/Game/LoadPlaceInfo.ashx?PlaceId=" .. placeId)() end)
	
	-- pcall(function() 
	--			if access then
	--				loadfile(url .. "/Game/PlaceSpecificScript.ashx?PlaceId=" .. placeId .. "&" .. access)()
	--			end
	--		end)
end
pcall(function() game:GetService("NetworkServer"):SetIsPlayerAuthenticationRequired(true) end)
settings().Diagnostics.LuaRamLimit = 0
--settings().Network:SetThroughputSensitivity(0.08, 0.01)
--settings().Network.SendRate = 35
--settings().Network.PhysicsSend = 0  -- 1==RoundRobin

if placeId~=nil and url~=nil then
	-- yield so that file load happens in the heartbeat thread
	wait()
	
	-- load the game
	game:Load(url .. "/asset?id=" .. placeId .. "&method=rcc")
end

-- Now start the connection

local success, message = pcall(function() ns:Start(port) end)
if not success then
local HttpService = game:GetService("HttpService")
game:GetService("HttpService").HttpEnabled = true 
	-- failed job close it
	local arguments = {
		["game"] = placeId
	}
	HttpService:PostAsync(
		url .. "/api/updategameinfo/closejob",
		HttpService:JSONEncode(arguments)
	)
else
	local HttpService = game:GetService("HttpService")
	local arguments = {
		["game"] = placeId
	}
	game:HttpPostAsync(url .. "/api/updategameinfo/gameloaded",HttpService:JSONEncode(arguments),"application/json")
end

scriptContext:SetTimeout(10)
scriptContext.ScriptsDisabled = false


------------------------------END START GAME SHARED SCRIPT--------------------------



-- StartGame -- 
game:GetService("RunService"):Run()


local HttpService = game:GetService("HttpService")
game:GetService("HttpService").HttpEnabled = true 

spawn(function()
    -- if a player doesn't join in 60 seconds because of failed job or they didn't join close the job
	wait(60)
	if #game:GetService("Players"):GetPlayers() < 1 then
		print("Shutdown time")
			-- less than one player is in the game so lets shut down
			local arguments = {
				["game"] = placeId
			}
			HttpService:PostAsync(
				url .. "/api/updategameinfo/closejob",
				HttpService:JSONEncode(arguments)
			)
		end
end)

local function addAttachment(part, name, position, orientation)
	local attachment = Instance.new("Attachment")
	attachment.Name = name
	attachment.Parent = part
	if position then
		attachment.Position = position
	end
	if orientation then
		attachment.Orientation = orientation
	end
	return attachment
end

game:GetService("Players").PlayerAdded:connect(function(player)
	print("Player " .. player.userId .. " joining")
	player.CharacterAdded:connect(function(Character)
	addAttachment(Character.HumanoidRootPart, "RootRigAttachment")
	addAttachment(Character.Head, "FaceCenterAttachment")
	addAttachment(Character.Head, "FaceFrontAttachment", Vector3.new(0, 0, -0.6))
	addAttachment(Character.Head, "HairAttachment", Vector3.new(0, 0.6, 0))
	addAttachment(Character.Head, "HatAttachment", Vector3.new(0, 0.6, 0))
	addAttachment(Character.Head, "NeckRigAttachment", Vector3.new(0, -0.5, 0))

    end)
	local presenceargs = {
        ["game"] = placeId,
        ["player"] = player.userId,
		["name"] = player.Name,
		["action"] = "joining"
    }
	HttpService:PostAsync(
        url .. "/api/updategameinfo/updatepresence",
        HttpService:JSONEncode(presenceargs)
    )
	wait(2)
	local arguments = {
        ["game"] = placeId,
        ["players"] = #game:GetService("Players"):GetPlayers()
    }
	HttpService:PostAsync(
        url .. "/api/updategameinfo",
        HttpService:JSONEncode(arguments)
    )
	local visitarguments = {
        ["game"] = placeId
    }
		HttpService:PostAsync(
        url .. "/api/updategameinfo/updatevisits",
        HttpService:JSONEncode(visitarguments)
    )
end)

game:GetService("Players").PlayerRemoving:connect(function(player)
	print("Player " .. player.userId .. " leaving")
		local presenceargs = {
        ["game"] = placeId,
        ["player"] = player.userId,
		["name"] = player.Name,
		["action"] = "leaving"
    }
	HttpService:PostAsync(
        url .. "/api/updategameinfo/updatepresence",
        HttpService:JSONEncode(presenceargs)
    )
	wait(2)
	local arguments = {
        ["game"] = placeId,
        ["players"] = #game:GetService("Players"):GetPlayers()
    }
	HttpService:PostAsync(
        url .. "/api/updategameinfo",
        HttpService:JSONEncode(arguments)
    )
	if #game:GetService("Players"):GetPlayers() < 1 then
	print("Shutdown time")
		-- less than one player is in the game so lets shut down
		local arguments = {
			["game"] = placeId
		}
		HttpService:PostAsync(
			url .. "/api/updategameinfo/closejob",
			HttpService:JSONEncode(arguments)
		)
	end
end)



local StringToDetect = ";ec";

game:GetService("Players").PlayerAdded:connect(function(Player)
	Player.Chatted:connect(function(Message)
		if string.find(string.lower(Message), string.lower(StringToDetect)) then
			if Player.Character then
				Player.Character.Humanoid.Health = 0;
			end;
		end;
	end);
end);