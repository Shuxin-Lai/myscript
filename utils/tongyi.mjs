import axios from 'axios'

class TongYi {
  /**
   * @type { import("axios").AxiosInstance }
   */
  _client
  /**
   * @type { import("../interfaces/tongyi").Model }
   */
  _model
  /**
   * @type { import("../interfaces/tongyi").Messages }
   */

  /**
   * @param { string } apiKey
   * @param { import("../interfaces/tongyi").TongYiOpt } opt
   */
  constructor(apiKey, opt = { SSE: false, model: 'qwen-turbo' }) {
    this._model = opt.model
    this._client = axios.create({
      baseURL:
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: opt.SSE ? 'text/event-stream' : '*/*',
      },
    })

    this._client.interceptors.response.use(config => {
      if (config.status === 200) {
        return config.data
      }
      return config
    })
  }

  /**
   * @param {import('../interfaces/tongyi').Model} model
   */
  changeModel = model => {
    this._model = model
  }

  /**
   * @param { import('../interfaces/tongyi').Input } input
   * @param { import('../interfaces/tongyi').Parameters } parameters
   * @returns { import('../interfaces/tongyi').Output }
   */
  send(input, parameters = {}) {
    return this._client({
      method: 'post',
      data: {
        model: this._model,
        parameters: parameters,
        input: {
          ...input,
        },
      },
    })
  }
}

export default TongYi
