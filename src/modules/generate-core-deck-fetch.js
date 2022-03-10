import nodeFetch from 'node-fetch'

let fetchFunction = nodeFetch

export default function fetch(url) {
  return fetchFunction(url)
}

export function setFetchFunction(newFetchFunction) {
  fetchFunction = newFetchFunction
}
