import axios from 'axios'

const API_URL = '/api/assets/'

// Crear nuevo asset
const createAsset = async (assetData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, assetData, config)
  return response.data
}

// Obtener todos los assets
const getAssets = async () => {
  const response = await axios.get(API_URL)
  return response.data
}

// Borrar un asset por id
const deleteAsset = async (assetId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.delete(API_URL + assetId, config)
  return response.data
}
const getAssetById = async (id) => {
  const response = await fetch(`/api/assets/${id}`)
  if (!response.ok) throw new Error('No se pudo obtener el asset')
  return await response.json()
}

const comentarAsset = async (id, comentario, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }

  const response = await axios.post(`/api/assets/${id}/comment`, comentario, config)
  return response.data
}

const getUserAssets = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Asegúrate de que el token se envía correctamente
    },
  };

  const response = await axios.get('/api/assets/user', config);
  console.log('Respuesta del backend:', response.data); // Verifica la respuesta
  return response.data;
};


// Actualizar un asset por id
const updateAsset = async (id, assetData, token) => {
  console.log('Datos enviados al backend:', assetData); // Depuración
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`/api/assets/${id}`, assetData, config);
  return response.data;
};


const assetService = {
  getAssets,
  createAsset,
  deleteAsset,
  getAssetById,
  comentarAsset, 
  getUserAssets,
  updateAsset, // Asegúrate de exportar la función de actualización

}


export default assetService
