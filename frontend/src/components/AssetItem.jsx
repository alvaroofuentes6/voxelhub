import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AssetItem.css';
import assetService from '../features/assets/assetService';
import { useSelector } from 'react-redux';

function AssetItem({ asset, isProfile, onDelete }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // Obtener el token del usuario

  const handleClick = () => {
    navigate(`/assets/${asset._id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/editar-asset/${asset._id}`);
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas borrar este asset?')) {
      try {
        await assetService.deleteAsset(asset._id, user.token); // Usar el servicio con el token
        if (onDelete) onDelete(asset._id); // Llama a la función de eliminación si está definida
        alert('Asset borrado correctamente.');
        window.location.reload(); // Recargar la página después de borrar
      } catch (err) {
        console.error('Error al borrar el asset:', err);
        alert('Hubo un error al intentar borrar el asset.');
      }
    }
  };

  const extraerIdGoogle = (url) => {
    const match = url.match(/id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  };

  return (
    <div className="asset-card" onClick={handleClick}>
      <img
        src={`https://lh3.googleusercontent.com/d/${extraerIdGoogle(asset.previewImage)}=s220`}
        alt={asset.title}
        className="asset-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/150x150?text=No+Image';
        }}
      />
      <div className="asset-info">
        <h3>{asset.title}</h3>
        <p>{asset.type}</p>
        {isProfile && (
          <div className="action-buttons">
            <button className="edit-button" onClick={handleEditClick}>
              Editar
            </button>
            <button className="delete-button" onClick={handleDeleteClick}>
              Borrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssetItem;