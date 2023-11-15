-- This is the thumbnail script for R6 avatars. Straight up and down, with the right arm out if they have a gear.
local asset = 0
local baseurl = "http://mete0r.xyz" -- have to set to https for production
local HttpService = game:GetService "HttpService"
local InsertService = game:GetService "InsertService"
local Players = game:GetService "Players"
HttpService.HttpEnabled = true

local ThumbnailGenerator = game:GetService "ThumbnailGenerator"

pcall(function()
	game:GetService("ContentProvider"):SetBaseUrl(baseurl)
end)
InsertService:SetBaseSetsUrl(
	baseurl .. "/Game/Tools/InsertAsset.ashx?nsets=10&type=base"
)
InsertService:SetUserSetsUrl(
	baseurl .. "/Game/Tools/InsertAsset.ashx?nsets=20&type=user&userid=%d"
)
InsertService:SetCollectionUrl(baseurl .. "/Game/Tools/InsertAsset.ashx?sid=%d")
InsertService:SetAssetUrl(baseurl .. "/Asset/?id=%d")
InsertService:SetAssetVersionUrl(baseurl .. "/Asset/?assetversionid=%d")
pcall(function()
	game:GetService("ScriptInformationProvider"):SetAssetUrl(url .. "/Asset/")
end)

game:GetService("ScriptContext").ScriptsDisabled = true

thing = InsertService:LoadAsset(asset)
if thing:GetChildren()[1]:IsA "Shirt" or thing:GetChildren()[1]:IsA "Pants" then
	local player = Players:CreateLocalPlayer(0)
	player:LoadCharacter()
	thing:GetChildren()[1].Parent = player.Character
	bcolor = Instance.new "BodyColors"
	bcolor.HeadColor = BrickColor.new(1001)
	bcolor.TorsoColor = BrickColor.new(1001)
	bcolor.LeftArmColor = BrickColor.new(1001)
	bcolor.RightArmColor = BrickColor.new(1001)
	bcolor.LeftLegColor = BrickColor.new(1001)
	bcolor.RightLegColor = BrickColor.new(1001)
	bcolor.Parent = player.Character
elseif thing:GetChildren()[1]:IsA "Decal" then
	local player = Players:CreateLocalPlayer(0)
	player:LoadCharacter()
	player.Character.Head.face:Destroy()
	thing:GetChildren()[1].Parent = player.Character.Head
	bcolor = Instance.new "BodyColors"
	bcolor.HeadColor = BrickColor.new(1001)
	bcolor.TorsoColor = BrickColor.new(1001)
	bcolor.LeftArmColor = BrickColor.new(1001)
	bcolor.RightArmColor = BrickColor.new(1001)
	bcolor.LeftLegColor = BrickColor.new(1001)
	bcolor.RightLegColor = BrickColor.new(1001)
	bcolor.Parent = player.Character

	for _, child in pairs(player.Character:GetChildren()) do
		if child.Name ~= "Head" and child:IsA "BasePart" then
			child:Destroy()
		end
	end
else
	thing.Parent = workspace
end

local arguments = {
	thumbnail = ThumbnailGenerator:Click(
		"PNG",
		400,
		400,
		true -- hideSky
	),
	asset = asset,
}

HttpService:PostAsync(
	baseurl .. "/api/thumbnailrender/rccasset",
	HttpService:JSONEncode(arguments)
)
