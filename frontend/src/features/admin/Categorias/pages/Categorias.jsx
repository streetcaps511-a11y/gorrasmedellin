import React from 'react';
import '../style/Categorias.css';
import { useCategoriasLogic } from '../hooks/useCategoriasLogic';
import { StatusFilter } from '../components';
import EntityTable from '../../../shared/components/admin/EntityTable';

// Shared Components
import SearchInput from '../../../shared/components/admin/SearchInput';
import UniversalModal from '../../../shared/components/admin/UniversalModal';
import ConfirmDeleteModal from '../../../shared/components/admin/ConfirmDeleteModal';
import AnularOperacionModal from '../../../shared/components/admin/AnularOperacionModal';
import CustomPagination from '../../../shared/components/admin/CustomPagination';
import Alert from '../../../shared/components/admin/Alert';
import StatusPill from '../../../shared/components/admin/StatusPill';

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
    const isError = isReadOnly ? false : (errors[fieldName] || false);
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
          <div className="categorias-page__title-section" style={{ marginBottom: '4px' }}>
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
          <div className="categories-table-wrapper">
            {loading ? (
                <div style={{ textAlign: 'center', color: '#F5C81B', padding: '40px' }}>
                  Cargando categorías...
                </div>
            ) : (
              <EntityTable 
                entities={paginatedCategories}
                columns={[
                  { header: 'Nombre', field: 'nombre', width: '220px' },
                  { header: 'Descripción', field: 'descripcion', width: '350px' },
                  { 
                    header: 'Estado', 
                    field: 'isActive',
                    width: '120px',
                    render: (cat) => <StatusPill status={cat.isActive} />
                  }
                ]}
                onView={(cat) => openModal('view', cat)}
                onEdit={(cat) => openModal('edit', cat)}
                onDelete={(cat) => openDeleteModal(cat)}
                onAnular={(cat) => handleToggleStatus(cat)}
                onReactivar={(cat) => handleToggleStatus(cat)}
                isActiveField="isActive"
                moduleType="categorias"
              />
            )}
          </div>

          {totalItems > 0 && !loading && (
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
        size="medium"
        loading={loading}
        actions={modalState.mode === 'view' ? [
          { label: 'Cerrar', variant: 'primary', onClick: closeModal }
        ] : [
          { label: 'Cancelar', variant: 'secondary', onClick: closeModal },
          { label: modalState.mode === 'create' ? 'Guardar' : 'Guardar Cambios', variant: 'primary', onClick: handleSave }
        ]}
      >
        <div className="modal-content__body">
          {renderField('Nombre', 'nombre')}
          {renderField('Descripción', 'descripcion', 'textarea')}
          {renderField('URL de Imagen', 'imagenUrl')}
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
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'success' })}
        />
      )}
    </>
  );
};

export default CategoriasPage;