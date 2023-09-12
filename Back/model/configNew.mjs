import { Schema } from "redis-om"

const configSchema = new Schema("config", {
	RegistrationEnabled: { type: "boolean" },
	MaintenanceEnabled: { type: "boolean" },
	GamesEnabled: { type: "boolean" },
	KeysEnabled: { type: "boolean" },
	bannermessage: { type: "string" },
})

export default configSchema
