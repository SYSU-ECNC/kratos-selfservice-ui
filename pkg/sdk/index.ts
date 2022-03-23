import { edgeConfig } from '@ory/integrations/next'
import { Configuration, V0alpha2Api } from '@ory/kratos-client'
import { removeTrailingSlash } from '../helper'

export default new V0alpha2Api(new Configuration(edgeConfig))
export const serverApi = new V0alpha2Api(new Configuration({
    basePath: removeTrailingSlash(process.env.ORY_KRATOS_URL || ''),
}))
