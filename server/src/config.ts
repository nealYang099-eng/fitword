export const config = {
  azure: {
    key: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || 'eastasia',
  },
  port: parseInt(process.env.PORT || '3000', 10),
}
