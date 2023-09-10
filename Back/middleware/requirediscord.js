const requirediscord = (req,res,next) => {
    const discordid = req.userdocument.discordid
    if (!discordid) {
        return res.json({status: "error", error: "Discord link required for develop. Link your discord in the settings panel."})
    }else{
        next();
    }
    
};

module.exports = {requirediscord}