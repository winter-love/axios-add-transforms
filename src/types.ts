import {AxiosError, AxiosPromise, AxiosRequestConfig, Method, Status} from 'axios'

// override axios type
declare module 'axios/index' {
  export interface Status {
    retry?: number | boolean | null
    originalConfig: AxiosRequestConfig
    [key: string]: any
  }

  // override axios AxiosRequestConfig
  interface AxiosRequestConfig {
    __status?: Status | null
    __config?: AxiosRequestConfig | null
  }

  export interface AxiosInstance {
    (config: AxiosRequestConfig): AxiosPromise

    (url: string, config?: AxiosRequestConfig): AxiosPromise
  }
}

/**
 * axios method for transform
 */
export type TransformMethod = 'all' | 'ALL' | Method

export interface AxiosErrorEx extends AxiosError {
  /**
   * @deprecated please use example
   * @example
   *  error(error, context, status) {
   *    // this is save as error.retry = true
   *    status.retry = true
   *  }
   */
  retry?: boolean
  config: AxiosRequestConfig
}

export interface InterceptorIds {
  request: number
  response: number
}

export type MargeResponse = 'back' | 'front' | 'none'

export interface TransFormerStatus extends Status {
  retry?: any
}

/**
 * Request Transformer function
 * @deprecated
 */
export type Transformer<C = any> = TransformerRequest<C>

/**
 * Request Transformer function
 */
export type TransformerRequest<C = any> =
  (payload: AxiosRequestConfig, context: C) =>
    Promise<AxiosRequestConfig> | AxiosRequestConfig

/**
 * Response Transformer function
 */
export type TransformerResponse<C = any> =
  (data: any, context: C, config: AxiosRequestConfig) => Promise<any> | any

/**
 * Error transformer function
 */
export type TransformError<C = any> =
  (error: AxiosErrorEx, context: C, status: TransFormerStatus)
    => Promise<AxiosError> | AxiosError

/**
 * Transform Set (has only array type)
 */
export interface TransformSetArray<C = any> {
  request: Array<TransformerRequest<C>>
  response: Array<TransformerResponse<C>>
  error: Array<TransformError<C>>
}

/**
 * Transform Set
 */
export interface TransformSet<C = any> {
  request?: TransformerRequest<C> | Array<TransformerRequest<C>>
  response?: TransformerResponse<C> | Array<TransformerResponse<C>>
  /**
   * This is like axios.interceptors.response.use(__, error)
   */
  error?: TransformError<C> | Array<TransformError<C>>
}

/**
 * Do transform if test is successful
 */
export interface Matcher<C = any> {
  test: RegExp
  // methods. All means all of method
  method?: TransformMethod
  transform: TransformSet<C>
}

/**
 * Transforms options
 */
export interface TransformsOptions<C = any> {
  first?: TransformSet<C>
  final?: TransformSet<C>
  matchers?: Array<Matcher<C>>
  margeResponse?: MargeResponse
  maxCache?: number | null
  context?: () => C
}
