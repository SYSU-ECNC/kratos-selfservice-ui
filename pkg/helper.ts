export const removeTrailingSlash = (s: string) => s.replace(/\/$/, '')
export const getUrlForFlow = (
    flow: string,
    query?: URLSearchParams
  ) =>
    `/api/.ory/self-service/${flow}/browser${
      query ? `?${query.toString()}` : ''
    }`