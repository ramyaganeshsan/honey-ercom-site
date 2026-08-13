import client, { apiRequest } from './client'

const q = (params) => ({ params })

export const authApi = {
  login: (payload) =>
    apiRequest(() => client.post('/auth/login', payload), { silent: true }),
  me: () => apiRequest(() => client.get('/auth/me'), { silent: true }),
}

export const dashboardApi = {
  get: () => apiRequest(() => client.get('/dashboard'), { silent: true }),
}

export const usersApi = {
  list: (params) =>
    apiRequest(() => client.get('/users', q(params)), { silent: true }),
  get: (id) => apiRequest(() => client.get(`/users/${id}`), { silent: true }),
  block: (id) => apiRequest(() => client.post(`/users/${id}/block`)),
  unblock: (id) => apiRequest(() => client.post(`/users/${id}/unblock`)),
  update: (id, payload) =>
    apiRequest(() => client.put(`/users/${id}`, payload)),
}

export const categoriesApi = {
  list: (params) =>
    apiRequest(() => client.get('/categories', q(params)), { silent: true }),
  get: (id) =>
    apiRequest(() => client.get(`/categories/${id}`), { silent: true }),
  create: (payload) => apiRequest(() => client.post('/categories', payload)),
  update: (id, payload) =>
    apiRequest(() => client.put(`/categories/${id}`, payload)),
  remove: (id) => apiRequest(() => client.delete(`/categories/${id}`)),
}

export const productsApi = {
  list: (params) =>
    apiRequest(() => client.get('/products', q(params)), { silent: true }),
  get: (id) =>
    apiRequest(() => client.get(`/products/${id}`), { silent: true }),
  create: (payload) => apiRequest(() => client.post('/products', payload)),
  update: (id, payload) =>
    apiRequest(() => client.put(`/products/${id}`, payload)),
  remove: (id) => apiRequest(() => client.delete(`/products/${id}`)),
  uploadImage: (id, file) => {
    const fd = new FormData()
    fd.append('image', file)
    return apiRequest(() =>
      client.post(`/products/${id}/image`, fd, {
        headers: { 'Content-Type': undefined },
      })
    )
  },
}

export const ordersApi = {
  list: (params) =>
    apiRequest(() => client.get('/orders', q(params)), { silent: true }),
  get: (id) => apiRequest(() => client.get(`/orders/${id}`), { silent: true }),
  updateStatus: (id, payload) =>
    apiRequest(() => client.put(`/orders/${id}/status`, payload)),
}

export const transactionsApi = {
  list: (params) =>
    apiRequest(() => client.get('/transactions', q(params)), { silent: true }),
  get: (id) =>
    apiRequest(() => client.get(`/transactions/${id}`), { silent: true }),
}

export const promocodesApi = {
  list: (params) =>
    apiRequest(() => client.get('/promocodes', q(params)), { silent: true }),
  get: (id) =>
    apiRequest(() => client.get(`/promocodes/${id}`), { silent: true }),
  create: (payload) => apiRequest(() => client.post('/promocodes', payload)),
  update: (id, payload) =>
    apiRequest(() => client.put(`/promocodes/${id}`, payload)),
  remove: (id) => apiRequest(() => client.delete(`/promocodes/${id}`)),
}

export const cmsApi = {
  list: (params) =>
    apiRequest(() => client.get('/cms', q(params)), { silent: true }),
  get: (id) => apiRequest(() => client.get(`/cms/${id}`), { silent: true }),
  create: (payload) => apiRequest(() => client.post('/cms', payload)),
  update: (id, payload) => apiRequest(() => client.put(`/cms/${id}`, payload)),
  remove: (id) => apiRequest(() => client.delete(`/cms/${id}`)),
}

export const bannersApi = {
  list: (params) =>
    apiRequest(() => client.get('/banners', q(params)), { silent: true }),
  get: (id) =>
    apiRequest(() => client.get(`/banners/${id}`), { silent: true }),
  create: (payload) => apiRequest(() => client.post('/banners', payload)),
  update: (id, payload) =>
    apiRequest(() => client.put(`/banners/${id}`, payload)),
  remove: (id) => apiRequest(() => client.delete(`/banners/${id}`)),
  uploadImage: (id, file) => {
    const fd = new FormData()
    fd.append('image', file)
    return apiRequest(() =>
      client.post(`/banners/${id}/image`, fd, {
        headers: { 'Content-Type': undefined },
      })
    )
  },
}

export const reviewsApi = {
  list: (params) =>
    apiRequest(() => client.get('/reviews', q(params)), { silent: true }),
  approve: (id) => apiRequest(() => client.post(`/reviews/${id}/approve`)),
  reject: (id) => apiRequest(() => client.post(`/reviews/${id}/reject`)),
}

export const settingsApi = {
  get: () => apiRequest(() => client.get('/settings'), { silent: true }),
  update: (payload) => apiRequest(() => client.put('/settings', payload)),
}

export const shippingApi = {
  countries: {
    list: (params) =>
      apiRequest(() => client.get('/shipping/countries', q(params)), {
        silent: true,
      }),
    create: (payload) =>
      apiRequest(() => client.post('/shipping/countries', payload)),
    update: (id, payload) =>
      apiRequest(() => client.put(`/shipping/countries/${id}`, payload)),
    remove: (id) =>
      apiRequest(() => client.delete(`/shipping/countries/${id}`)),
  },
  states: {
    list: (params) =>
      apiRequest(() => client.get('/shipping/states', q(params)), {
        silent: true,
      }),
    create: (payload) =>
      apiRequest(() => client.post('/shipping/states', payload)),
    update: (id, payload) =>
      apiRequest(() => client.put(`/shipping/states/${id}`, payload)),
    remove: (id) =>
      apiRequest(() => client.delete(`/shipping/states/${id}`)),
  },
  cities: {
    list: (params) =>
      apiRequest(() => client.get('/shipping/cities', q(params)), {
        silent: true,
      }),
    create: (payload) =>
      apiRequest(() => client.post('/shipping/cities', payload)),
    update: (id, payload) =>
      apiRequest(() => client.put(`/shipping/cities/${id}`, payload)),
    remove: (id) =>
      apiRequest(() => client.delete(`/shipping/cities/${id}`)),
  },
}

export const contactApi = {
  list: (params) =>
    apiRequest(() => client.get('/contact', q(params)), { silent: true }),
  get: (id) =>
    apiRequest(() => client.get(`/contact/${id}`), { silent: true }),
  update: (id, payload) =>
    apiRequest(() => client.put(`/contact/${id}`, payload)),
}

export const reportsApi = {
  summary: (params) =>
    apiRequest(() => client.get('/reports', q(params)), { silent: true }),
}
