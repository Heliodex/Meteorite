-- This is the thumbnail script for R6 avatars. Straight up and down, with the right arm out if they have a gear.
local asset = 0
local baseurl = "http://mete0r.xyz" -- have to set to https for production
local HttpService = game:GetService("HttpService")
HttpService.HttpEnabled = true

---@diagnostic disable-next-line: invalid-class-name
local ThumbnailGenerator = game:GetService("ThumbnailGenerator")

pcall(function() game:GetService("ContentProvider"):SetBaseUrl(baseurl) end)
game:GetService("InsertService"):SetBaseSetsUrl(baseurl .. "/Game/Tools/InsertAsset.ashx?nsets=10&type=base")
game:GetService("InsertService"):SetUserSetsUrl(baseurl .. "/Game/Tools/InsertAsset.ashx?nsets=20&type=user&userid=%d")
game:GetService("InsertService"):SetCollectionUrl(baseurl .. "/Game/Tools/InsertAsset.ashx?sid=%d")
game:GetService("InsertService"):SetAssetUrl(baseurl .. "/Asset/?id=%d")
game:GetService("InsertService"):SetAssetVersionUrl(baseurl .. "/Asset/?assetversionid=%d")
---@diagnostic disable-next-line: invalid-class-name
pcall(function() game:GetService("ScriptInformationProvider"):SetAssetUrl(url .. "/Asset/") end)

game:GetService("ScriptContext").ScriptsDisabled = true

thing = game:GetService("InsertService"):LoadAsset(asset)
if thing:GetChildren()[1]:IsA("Shirt") or thing:GetChildren()[1]:IsA("Pants") then
	local player = game:GetService("Players"):CreateLocalPlayer(0)
	player:LoadCharacter()
	thing:GetChildren()[1].Parent = player.Character
    bcolor = Instance.new("BodyColors", player.Character)
bcolor.HeadColor = BrickColor.new(1001)
bcolor.TorsoColor = BrickColor.new(1001)
bcolor.LeftArmColor = BrickColor.new(1001)
bcolor.RightArmColor = BrickColor.new(1001)
bcolor.LeftLegColor = BrickColor.new(1001)
bcolor.RightLegColor = BrickColor.new(1001)
elseif thing:GetChildren()[1]:IsA("Decal") then
	local player = game:GetService("Players"):CreateLocalPlayer(0)
	player:LoadCharacter()
    player.Character.Head.face:Destroy()
	thing:GetChildren()[1].Parent = player.Character.Head
    bcolor = Instance.new("BodyColors", player.Character)
bcolor.HeadColor = BrickColor.new(1001)
bcolor.TorsoColor = BrickColor.new(1001)
bcolor.LeftArmColor = BrickColor.new(1001)
bcolor.RightArmColor = BrickColor.new(1001)
bcolor.LeftLegColor = BrickColor.new(1001)
bcolor.RightLegColor = BrickColor.new(1001)

    for _, child in pairs(player.Character:GetChildren()) do
if child.Name ~= "Head" and child:IsA("BasePart") then
child:Destroy()
end
end

else
	thing.Parent = game.workspace
end

local arguments = {
        ["thumbnail"] = ThumbnailGenerator:Click("PNG", 400, 400, --[[hideSky = ]] true),
        ["asset"] = asset
    }

HttpService:PostAsync(
        baseurl .. "/api/thumbnailrender/rccasset",
        HttpService:JSONEncode(arguments)
    )


