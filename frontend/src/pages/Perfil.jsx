import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import assetService from '../features/assets/assetService'; // Servicio para obtener los assets
import AssetItem from '../components/AssetItem'; // Importa el componente AssetItem
import '../css/Perfil.css'; // Asegúrate de tener un archivo CSS para estilos personalizados

function Perfil() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Función para extraer el ID de Google Drive
  const extraerIdGoogle = (url) => {
    if (!url) return '';
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
    if (idMatch) return idMatch[1];
    const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\/?/i);
    if (dMatch) return dMatch[1];
    const ucMatch = url.match(/uc\?id=([a-zA-Z0-9_-]+)/i);
    if (ucMatch) return ucMatch[1];
    return '';
  };

  // Procesar la URL de la imagen de perfil
  const procesarImagenPerfil = (url) => {
    const id = extraerIdGoogle(url);
    return id
      ? `https://lh3.googleusercontent.com/d/${id}=s150`
      : 'https://dummyimage.com/150x150/cccccc/000000&text=Sin+Foto';
  };

  useEffect(() => {
    const fetchUserAssets = async () => {
      if (user) {
        try {
          const userAssets = await assetService.getUserAssets(user.token); // Obtener los assets del usuario
          console.log('Assets recibidos en el frontend:', userAssets);
          setAssets(userAssets);
        } catch (err) {
          console.error('Error al obtener los assets del usuario:', err);
        }
      }
    };

    fetchUserAssets();
  }, [user]);

  if (!user) {
    return <p>Debes iniciar sesión para ver tu perfil.</p>;
  }

  const profileImage = procesarImagenPerfil(user.profileImage);

  console.log('Imagen de perfil procesada:', profileImage);

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-info">
          <img
            src={profileImage}
            alt="Foto de perfil"
            className="perfil-imagen"
          />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <button onClick={() => navigate('/editar-perfil')} className="btn">
            Editar Perfil
          </button>
        </div>
      </div>

      <div className="perfil-portfolio">
        <h2>Portfolio</h2>
        {assets.length === 0 ? (
          <p>No has subido ningún asset todavía.</p>
        ) : (
          <div className="portfolio-grid">
            {assets
              .slice(0, mostrarTodos ? assets.length : 6) // Mostrar 6 assets por defecto
              .map((asset, index) => (
                <AssetItem key={index} asset={asset} isProfile={true} /> // Pasa `isProfile` como true
              ))}
          </div>
        )}
        {assets.length > 6 && (
          <button
            className="btn ver-mas"
            onClick={() => setMostrarTodos(!mostrarTodos)}
          >
            {mostrarTodos ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Perfil;