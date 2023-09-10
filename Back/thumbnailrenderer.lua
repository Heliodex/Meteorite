-- This is the thumbnail script for R6 avatars. Straight up and down, with the right arm out if they have a gear.
local person = 0
local baseurl = "http://mete0r.xyz" -- have to set to https for production
local HttpService = game:GetService("HttpService")
HttpService.HttpEnabled = true

---@diagnostic disable-next-line: invalid-class-name
local ThumbnailGenerator = game:GetService("ThumbnailGenerator")

pcall(function() game:GetService("ContentProvider"):SetBaseUrl(baseurl) end)
game:GetService("ScriptContext").ScriptsDisabled = true

local player = game:GetService("Players"):CreateLocalPlayer(0)
player:LoadCharacter()

-- bodycolors
a = HttpService:JSONDecode(HttpService:GetAsync("http://mete0r.xyz/game/colors?name="..person.."&rcc=''"))
bcolor = Instance.new("BodyColors", player.Character)
bcolor.HeadColor = BrickColor.new(a[1])
bcolor.TorsoColor = BrickColor.new(a[2])
bcolor.LeftArmColor = BrickColor.new(a[3])
bcolor.RightArmColor = BrickColor.new(a[4])
bcolor.LeftLegColor = BrickColor.new(a[5])
bcolor.RightLegColor = BrickColor.new(a[6])


-- charapp
b = HttpService:JSONDecode(HttpService:GetAsync("http://mete0r.xyz/game/charapp?name="..person.."&rcc=''"))
tool = false
pcall(function()

for i,v in pairs(b) do
pcall(function()
    print(v.item.itemid)
---@diagnostic disable-next-line: undefined-global
    thing = game:GetService("InsertService"):LoadAsset(v.item.itemid)

    if thing:GetChildren()[1].ClassName == "Tool" then
    if tool == false then
      tool = true
      thing:GetChildren()[1].Parent = player.Character
    end
  elseif thing:GetChildren()[1]:IsA("Decal") then
    --face
    player.Character.Head.face:Destroy()
    thing:GetChildren()[1].Parent = player.Character.Head
  else
    thing:GetChildren()[1].Parent = player.Character

end
end)
end

end)


-- Raise up the character's arm if they have gear.
if player.Character then
    for _, child in pairs(player.Character:GetChildren()) do
        if child:IsA("Tool") then
            player.Character.Torso["Right Shoulder"].CurrentAngle = math.rad(90)
            break
        end
    end
end
game.CoreGui.RobloxGui.HealthGui:Destroy()
game.CoreGui.RobloxGui.Backpack:Destroy()

local arguments = {
        ["thumbnail"] = ThumbnailGenerator:Click("PNG", 400, 400, --[[hideSky = ]] true),
        ["player"] = person
    }

HttpService:PostAsync(
        baseurl .. "/api/thumbnailrender/rcc",
        HttpService:JSONEncode(arguments)
    )