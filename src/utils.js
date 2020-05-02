export function rejectFailures(response) {
  if (!response.ok) {
    return Promise.reject('Response is not ok')
  }
  return response
}

export function fetchWithAuth(url, token) {
  return fetch(url, {
    headers: new Headers({
      'Authorization': 'Bearer ' + token
    })
  })
}

