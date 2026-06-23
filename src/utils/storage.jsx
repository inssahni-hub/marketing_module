export const saveDraft = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const loadDraft = (key) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

export const clearDraft = (key) => {
  localStorage.removeItem(key)
}
