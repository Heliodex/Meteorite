import { Schema } from 'redis-om'

const ipWhiteListSchema = new Schema('ipWhiteListSchema', {
  ip: { type: 'string' },
})

export default ipWhiteListSchema