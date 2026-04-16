import React from 'react';
import '../style/Categorias.css';
import { useCategoriasLogic } from '../hooks/useCategoriasLogic';
import { CategoryCard, StatusFilter } from '../components';

// Shared Components
import SearchInput from '../../../shared/components/admin/SearchInput';
import UniversalModal from '../../../shared/components/admin/UniversalModal';
import ConfirmDeleteModal from '../../../shared/components/admin/ConfirmDeleteModal';
import AnularOperacionModal from '../../../shared/components/admin/AnularOperacionModal';
import CustomPagination from '../../../shared/components/admin/CustomPagination';

const CategoriasPage = () => {
  const {
    alert, modalState, deleteModalState, searchTerm, setSearchTerm,
    filterStatus, currentPage, totalItems, totalPages, startItem, endItem,
    paginatedCategories, handlePageChange, handleFilterSelect, clearSearch,
    openModal, closeModal, openDeleteModal, closeDeleteModal,
    anularModalState, handleConfirmToggle, closeAnularModal,
    handleSave, handleDelete, handleToggleStatus, formData, errors,
    handleInputChange, loading
  } = useCategoriasLogic();

  const renderField = (label, fieldName, type = 'text') => {
    const isReadOnly = modalState.mode === 'view';
    const isError = errors[fieldName] || false;
    const value = isReadOnly ? (modalState.category?.[fieldName] || 'N/A') : (formData[fieldName] || '');

    return (
      <div className="form-field">
        <label className={`form-field__label ${isReadOnly ? 'readonly-field' : 'form-field__label--required'}`}>
          {label}:
        </label>
        {type === 'textarea' ? (
          <textarea
            name={fieldName}
            value={value}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field__textarea ${isReadOnly ? 'readonly-field' : ''} ${isError ? 'form-field__textarea--error' : ''}`}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            name={fieldName}
            type={type}
            value={value}
            disabled={isReadOnly}
            readOnly={isReadOnly}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            className={`form-field__input ${isReadOnly ? 'readonly-field' : ''} ${isError ? 'form-field__input--error' : ''}`}
            placeholder={isReadOnly ? '' : `Ingrese ${label.toLowerCase()}...`}
          />
        )}
        
        {fieldName === 'imagenUrl' && value && value !== 'N/A' && (
          <div className="image-preview" style={{ marginTop: '10px' }}>
            <img src={value} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
        )}
        
        {!isReadOnly && (
          <div className={`form-field__error ${isError ? 'form-field__error--visible' : ''}`}>
            {isError && (
              <>
                <span className="form-field__error-icon">●</span>
                {isError}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="categorias-page">
        {/* Header */}
        <div className="categorias-page__header">
          <div className="categorias-page__title-section">
            <div>
              <h1 className="categorias-page__title">Categorías</h1>
              <p className="categorias-page__subtitle">Administra las categorías de productos</p>
            </div>
            <button onClick={() => openModal('create')} className="btn-primary">
              Registrar Categoría
            </button>
          </div>
          <div className="categorias-page__actions">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre o descripción..."
              onClear={clearSearch}
              fullWidth={true}
              style={{ height: '32px' }}
            />
            <StatusFilter filterStatus={filterStatus} onFilterChange={handleFilterSelect} />
          </div>
        </div>

        {/* Content Area */}
        <div className="categories-container">
          <div className="categories-grid yellow-scrollbar" style={{ overflowY: 'auto' }}>
            {loading ? (
                <div style={{ gridColumn: '1 / span 3', textAlign: 'center', color: '#F5C81B', padding: '40px' }}>
                  Cargando categorías...
                </div>
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map(category => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  onView={() => openModal('view', category)}
                  onEdit={() => openModal('edit', category)}
                  onDelete={() => openDeleteModal(category)}
                  onToggleStatus={() => handleToggleStatus(category)}
                />
              ))
            ) : (
              <div className="empty-state">
                <svg className="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 5h16v14H4V5z" /><path d="M9 3l3 3m3-3l-3 3" />
                </svg>
                <h3 className="empty-state__title">No se encontraron categorías</h3>
                <p className="empty-state__message">{searchTerm || filterStatus !== 'Todos' ? 'Intenta ajustar los filtros de búsqueda' : 'No hay categorías registradas'}</p>
              </div>
            )}
            
            {!loading && paginatedCategories.length > 0 && paginatedCategories.length < 3 &&
              Array.from({ length: 3 - paginatedCategories.length }).map((_, index) => (
                <div key={`empty-${index}`} className="category-card__placeholder" />
              ))
            }
          </div>

          {totalItems > 0 && (
            <CustomPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              showingStart={startItem}
              endIndex={endItem}
              itemsName="categorías"
            />
          )}
        </div>
      </div>

      <UniversalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Registrar categoría' : modalState.mode === 'edit' ? 'Editar categoría' : 'Detalles de la categoría'}
        subtitle={modalState.mode === 'create' ? 'Complete la información para registrar una nueva categoría' : modalState.mode === 'edit' ? 'Modifique la información de la categoría' : 'Información detallada de la categoría'}
        showActions={false}
        size="medium"
        contentStyle={{ padding: 0 }}
        loading={loading}
      >
        <div className="modal-content">
          <div className="modal-content__body yellow-scrollbar" style={{ overflowY: 'auto' }}>
            {renderField('Nombre', 'nombre')}
            {renderField('Descripción', 'descripcion', 'textarea')}
            {renderField('URL de Imagen', 'imagenUrl')}
          </div>
          
          <div className="modal-content__footer">
            {modalState.mode === 'view' ? (
              <button onClick={closeModal} className="btn-modal-save" style={{ minWidth: '100px' }}>Cerrar</button>
            ) : (
              <>
                <button onClick={closeModal} className="btn-modal-cancel" disabled={loading}>Cancelar</button>
                <button onClick={handleSave} className="btn-modal-save" disabled={loading}>
                  {loading ? 'Guardando...' : (modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios')}
                </button>
              </>
            )}
          </div>
        </div>
      </UniversalModal>

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        entityName="categoría"
        entityData={deleteModalState.category}
        loading={loading}
      />

      <AnularOperacionModal
        isOpen={anularModalState.isOpen}
        onClose={closeAnularModal}
        onConfirm={() => handleConfirmToggle()}
        title={anularModalState.category?.isActive ? 'Confirmar Desactivación' : 'Confirmar Activación'}
        operationType="categoría"
        operationData={anularModalState.category}
        confirmButtonText={anularModalState.category?.isActive ? 'Desactivar' : 'Activar'}
        cancelButtonText="Cancelar"
        loading={loading}
      />

      {alert.show && (
        <div className={`categorias-alert ${alert.type}`}>
          {alert.message}
        </div>
      )}
    </>
  );
};

export default CategoriasPage;