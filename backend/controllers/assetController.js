const asyncHandler = require('express-async-handler')
const Asset = require('../models/assetModel')

// @desc    Get all assets
// @route   GET /api/assets
// @access  Public
const getAssets = asyncHandler(async (req, res) => {
  const assets = await Asset.find()
  res.status(200).json(assets)
})

// @desc    Create asset
// @route   POST /api/assets
// @access  Private
const createAsset = asyncHandler(async (req, res) => {
  const { title, description, type, previewImage, assetUrl, images } = req.body;

  if (!title || !description || !type || !previewImage || !assetUrl) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Validar que el array de imágenes no exceda el límite de 5
  if (images && images.length > 5) {
    res.status(400);
    throw new Error('You can upload a maximum of 5 images for the carousel');
  }

  const asset = await Asset.create({
    user: req.user.id,
    title,
    description,
    type,
    previewImage,
    assetUrl,
    images, // Guardar las imágenes del carrusel
  });

  res.status(201).json(asset);
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)

  if (!asset) {
    res.status(404)
    throw new Error('Asset not found')
  }

  if (asset.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('Not authorized')
  }

  await asset.deleteOne()

  res.status(200).json({ id: req.params.id })
})

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = asyncHandler(async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body); // Depuración
  console.log('ID del asset:', req.params.id); // Depuración

  const { images } = req.body;

  const asset = await Asset.findById(req.params.id);

  if (!asset) {
    res.status(404);
    throw new Error('Asset not found');
  }

  if (asset.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Validar que el array de imágenes no exceda el límite de 5
  if (images && images.length > 5) {
    res.status(400);
    throw new Error('You can upload a maximum of 5 images for the carousel');
  }

  const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  console.log('Asset actualizado:', updated); // Depuración
  res.status(200).json(updated);
});

// @desc    Get one asset
// @route   GET /api/assets/:id
// @access  Public
const getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('user', 'name') // autor
    .populate('comments.user', 'name profileImage') // usuario que hizo el comentario;

  if (!asset) {
    res.status(404);
    throw new Error('Asset no encontrado');
  }

  res.json(asset); // Incluye el campo `images` automáticamente
});

const getUserAssets = asyncHandler(async (req, res) => {
  console.log('Usuario autenticado:', req.user); // Verifica el usuario autenticado
  const assets = await Asset.find({ user: req.user.id }); // Filtrar por el usuario autenticado
  console.log('Assets encontrados:', assets); // Verifica los assets encontrados
  res.status(200).json(assets);
});

const comentarAsset = asyncHandler(async (req, res) => {
  const { text } = req.body
  const asset = await Asset.findById(req.params.id)

  if (!asset) {
    res.status(404)
    throw new Error('Asset not found')
  }

  const nuevoComentario = {
    user: req.user._id,
    text,
  }

  asset.comments.push(nuevoComentario)
  await asset.save()

  res.status(201).json(asset.comments)
})



module.exports = {
  getAssets,
  createAsset,
  deleteAsset,
  updateAsset,
  getAssetById,
  comentarAsset,
  getUserAssets,
}
