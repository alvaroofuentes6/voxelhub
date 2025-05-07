import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAsset } from '../features/assets/assetSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../css/AssetForm.css';

function AssetForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '2D',
    previewImage: '',
    assetUrl: '',
    images: [], // Nuevo estado para las imágenes del carrusel
  });

  const [subiendoAsset, setSubiendoAsset] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [subiendoCarrusel, setSubiendoCarrusel] = useState(false); // Estado para el carrusel
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const extraerIdGoogle = (url) => {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  };

  const subirArchivoADrive = async (file, campo) => {
    if (campo === 'previewImage' && !file.type.startsWith('image/')) {
      toast.error('El archivo seleccionado no es una imagen válida.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      if (campo === 'assetUrl') setSubiendoAsset(true);
      if (campo === 'previewImage') setSubiendoImagen(true);
      if (campo === 'images') setSubiendoCarrusel(true);

      const res = await axios.post('/api/drive/upload', formData);

      if (campo === 'images') {
        // Agregar la URL al array de imágenes
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, res.data.url],
        }));
      } else {
        setForm((prev) => ({ ...prev, [campo]: res.data.url }));
      }

      toast.success(`${campo === 'assetUrl' ? 'Asset' : 'Imagen'} subida correctamente`);
    } catch (err) {
      toast.error(`Error al subir ${campo === 'assetUrl' ? 'el asset' : 'la imagen'}`);
    } finally {
      setSubiendoAsset(false);
      setSubiendoImagen(false);
      setSubiendoCarrusel(false);
    }
  };

  const eliminarImagenCarrusel = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.previewImage.startsWith('http') || !form.assetUrl.startsWith('http')) {
      return toast.error('Las URLs deben empezar por http:// o https://');
    }

    if (form.images.length > 5) {
      return toast.error('Solo puedes subir un máximo de 5 imágenes para el carrusel.');
    }

    dispatch(createAsset(form))
      .unwrap()
      .then(() => {
        toast.success('Asset subido correctamente');
        setForm({
          title: '',
          description: '',
          type: '2D',
          previewImage: '',
          assetUrl: '',
          images: [],
        });
      })
      .catch(() => toast.error('Error al guardar el asset'));
  };

  if (!user) {
    return <p>Debes iniciar sesión para subir un asset.</p>;
  }

  return (
    <section className="asset-form-container">
      <form onSubmit={handleSubmit}>
        <h2>Subir nuevo Asset</h2>

        <label>Título</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Tipo</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="2D">2D</option>
          <option value="3D">3D</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="code">Código</option>
          <option value="other">Otro</option>
        </select>

        {/* Imagen descriptiva */}
        <label>Imagen descriptiva</label>
        <div
          className="asset-upload-box"
          onClick={() => document.getElementById('previewInput').click()}
        >
          {form.previewImage ? (
            <img
              src={`https://lh3.googleusercontent.com/d/${extraerIdGoogle(form.previewImage)}=s512`}
              alt="preview"
            />
          ) : (
            <>
              <i className="fas fa-image fa-3x"></i>
              <p>Selecciona una imagen</p>
            </>
          )}
        </div>

        <input
          id="previewInput"
          type="file"
          accept="image/*"
          onChange={(e) => subirArchivoADrive(e.target.files[0], 'previewImage')}
          style={{ display: 'none' }}
        />
        {subiendoImagen && <p>Subiendo imagen...</p>}

        {/* Archivo del asset */}
        <label>Archivo del asset</label>
        <input
          type="file"
          onChange={(e) => subirArchivoADrive(e.target.files[0], 'assetUrl')}
        />
        {subiendoAsset && <p>Subiendo asset...</p>}

        {/* Carrusel de imágenes */}
        <label>Imágenes del carrusel (máximo 5)</label>
        <div className="asset-upload-box">
          {form.images.map((img, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                display: 'inline-block',
                margin: '5px',
              }}
            >
              <img
                src={`https://lh3.googleusercontent.com/d/${extraerIdGoogle(img)}=s128`}
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
            <p>Haz clic para agregar imágenes</p>
          </div>
        </div>

        <input
          id="carouselInput"
          type="file"
          accept="image/*"
          onChange={(e) => subirArchivoADrive(e.target.files[0], 'images')}
          style={{ display: 'none' }}
        />
        {subiendoCarrusel && <p>Subiendo imagen al carrusel...</p>}

        <button type="submit">Subir Asset</button>
      </form>
    </section>
  );
}

export default AssetForm;