import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import assetService from '../features/assets/assetService';
import '../css/EditarAsset.css';

function EditarAsset() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    previewImage: '',
    assetUrl: '',
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [subiendoAsset, setSubiendoAsset] = useState(false);
  const [subiendoCarrusel, setSubiendoCarrusel] = useState(false); // Nuevo estado
  const [previewImage, setPreviewImage] = useState('');
  const [carouselImages, setCarouselImages] = useState([]);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const asset = await assetService.getAssetById(id);
        setFormData({
          title: asset.title,
          description: asset.description,
          type: asset.type,
          previewImage: asset.previewImage,
          assetUrl: asset.assetUrl,
          images: asset.images || [],
        });
        setPreviewImage(asset.previewImage);
        setCarouselImages(asset.images || []);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el asset:', err);
        navigate('/perfil');
      }
    };

    fetchAsset();
  }, [id, navigate]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const subirArchivoADrive = async (file, campo) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      if (campo === 'previewImage') setSubiendoImagen(true);
      if (campo === 'assetUrl') setSubiendoAsset(true);
      if (campo === 'images') setSubiendoCarrusel(true);

      const res = await axios.post('/api/drive/upload', formData);

      if (campo === 'images') {
        setCarouselImages((prev) => [...prev, res.data.url]);
        setFormData((prevState) => ({
          ...prevState,
          images: [...prevState.images, res.data.url],
        }));
      } else {
        setFormData((prevState) => ({
          ...prevState,
          [campo]: res.data.url,
        }));
        if (campo === 'previewImage') setPreviewImage(res.data.url);
      }
    } catch (err) {
      console.error(`Error al subir ${campo}:`, err);
    } finally {
      setSubiendoImagen(false);
      setSubiendoAsset(false);
      setSubiendoCarrusel(false); // Finaliza la carga del carrusel
    }
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      subirArchivoADrive(file, 'previewImage');
    }
  };

  const onAssetChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      subirArchivoADrive(file, 'assetUrl');
    }
  };

  const onCarouselImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      subirArchivoADrive(file, 'images');
    }
  };

  const eliminarImagenCarrusel = (index) => {
    setCarouselImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado');
    try {
      await assetService.updateAsset(id, formData, user.token);
      navigate('/perfil'); // Redirige al perfil después de guardar
    } catch (err) {
      console.error('Error al actualizar el asset:', err);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="editar-asset">
      <h1>Editar Asset</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Tipo</label>
          <select
            name="type"
            value={formData.type}
            onChange={onChange}
            required
          >
            <option value="2D">2D</option>
            <option value="3D">3D</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="code">Código</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Imagen de vista previa</label>
          <div
            className="asset-upload-box"
            onClick={() => document.getElementById('previewInput').click()}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Previsualización"
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
            ) : (
              <p>Selecciona una imagen</p>
            )}
          </div>
          <input
            id="previewInput"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            style={{ display: 'none' }}
          />
          {subiendoImagen && <p>Subiendo imagen...</p>}
        </div>
        <div className="form-group">
          <label>Archivo del asset</label>
          <input
            type="file"
            onChange={onAssetChange}
          />
          {subiendoAsset && <p>Subiendo asset...</p>}
        </div>
        <div className="form-group">
          <label>Imágenes del carrusel</label>
          <div className="asset-upload-box">
            {carouselImages.map((img, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  margin: '5px',
                }}
              >
                <img
                  src={img}
                  alt={`Carrusel ${index + 1}`}
                  style={{ maxWidth: '100px', borderRadius: '8px' }}
                />
                <button
                  type="button"
                  onClick={() => eliminarImagenCarrusel(index)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                  }}
                >
                  X
                </button>
              </div>
            ))}
            <div
              className="no-image-placeholder"
              onClick={() => document.getElementById('carouselInput').click()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '150px',
                backgroundColor: '#f0f0f0',
                color: '#888',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              <p>Haz clic para agregar más imágenes</p>
            </div>
          </div>
          <input
            id="carouselInput"
            type="file"
            accept="image/*"
            onChange={onCarouselImageChange}
            style={{ display: 'none' }}
          />
          {subiendoCarrusel && <p style={{ color: 'orange', fontWeight: 'bold' }}>Subiendo Imagen al Carrusel...</p>}
        </div>
        {(subiendoImagen || subiendoAsset) && (
          <p style={{ color: 'orange', fontWeight: 'bold' }}>
            {subiendoImagen ? 'Subiendo Imagen...' : 'Subiendo Asset...'}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

export default EditarAsset;