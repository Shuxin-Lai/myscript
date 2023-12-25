export interface TongYiOpt {
  SSE: boolean // sse mode
  model: Model
}

export type Model =
  | 'qwen-turbo'
  | 'qwen-plus'
  | 'qwen-max'
  | 'qwen-max-1201'
  | 'qwen-max-longcontext'

export type Messages = {
  content: string
  role: Role
}[]

export type Role = 'system' | 'user' | 'assistant'

export type Input = {
  prompt: string
  messages?: Messages
}

export type Parameters = {
  max_tokens?: number
  top_p?: number
  top_k?: number
  repetition_penalty?: number
  temperature?: number
  stop?: string
  enable_search?: boolean
  incremental_output?: boolean
}

export interface Output {
  output: OutputClass
  usage: Usage
  request_id: string
}

interface OutputClass {
  text: string
  finish_reason: string
}

interface Usage {
  output_tokens: number
  input_tokens: number
}
