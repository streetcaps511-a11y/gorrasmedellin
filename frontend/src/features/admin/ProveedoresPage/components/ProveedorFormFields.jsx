/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';

const RenderField = ({ 
  label, 
  fieldName, 
  type = "text", 
  options = [], 
  required = false,
  value,
  error,
  onChange,
  isViewMode = false,
  autoFocus = false,
  disabled = false,
  onBlur = null,
  onKeyDown = null,
  availableStatuses = [],
  departamentos = [],
  ciudades = [],
  loadingCities = false,
  autoComplete = "on",
  id = null
}) => {
  const inputId = id || `field-${fieldName}`;
  if (isViewMode) {
    let displayValue = value || "N/A";
    if (fieldName === 'isActive') {
      displayValue = value ? (availableStatuses[0] || 'Activo') : (availableStatuses[1] || 'Inactivo');
    }
    return (
      <div className="form-field">
        <label className="form-label readonly-field" style={{ textTransform: 'none' }}>
          {label}:
        </label>
        <div className={`form-input readonly-field disabled-field ${fieldName === 'isActive' ? (value ? 'active' : 'inactive') : ''}`} 
             style={{ 
               height: '30px', 
               display: 'flex', 
               alignItems: 'center',
               background: '#0f172a',
               border: '1px solid #1e293b'
             }}>
          {displayValue}
        </div>
      </div>
    );
  }

  if (type === "select") {
    const currentOptions = fieldName === 'department' ? departamentos : fieldName === 'city' ? ciudades : options;
    return (
      <div className="form-field">
        <label className="form-label" style={{ textTransform: 'none' }}>
          {label}:{required && <span className="required">*</span>}
        </label>
        <div className="select-wrapper">
          <select
            autoFocus={autoFocus}
            name={fieldName}
            value={value || ""}
            onChange={onChange}
            className={`form-select ${error ? 'has-error' : ''}`}
            disabled={disabled}
          >
            <option value="" disabled hidden>Seleccionar</option>
            {currentOptions.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
          {fieldName === 'city' && loadingCities && <div className="spinner-sm" />}
        </div>
        {error && <div className="field-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="form-field">
      <label className="form-label" style={{ textTransform: 'none' }}>
        {label}:{required && <span className="required">*</span>}
      </label>
      <input
        id={inputId}
        autoFocus={autoFocus}
        type={type}
        name={fieldName}
        autoComplete={autoComplete}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`form-input ${error ? 'has-error' : ''}`}
        disabled={disabled}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
};

const ProveedorFormFields = ({ 
  modalMode, 
  formData, 
  handleFieldChange, 
  errors, 
  departamentos = [], 
  ciudades = [], 
  loadingCities = false,
  closeModal,
  handleSave,
  availableStatuses = []
}) => {
  const isViewMode = modalMode === 'view';
  
  const { supplierType } = formData;
  const isJuridica = supplierType?.toLowerCase() === 'persona jurídica';
  const isNatural = supplierType?.toLowerCase() === 'persona natural';
  
  const commonFieldProps = {
    onChange: handleFieldChange,
    isViewMode,
    availableStatuses,
    departamentos,
    ciudades,
    loadingCities
  };
  
  return (
    <div 
      className={`proveedor-form ${isViewMode ? 'view-mode' : ''}`}
    >
      <div className="form-body">
        {isJuridica ? (
          <div className="form-row">
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="Tipo de persona"
                fieldName="supplierType"
                type="select"
                required={true}
                value={formData.supplierType}
                error={errors.supplierType}
                autoFocus={true}
                options={["Persona jurídica", "Persona natural"]}
              />
            </div>
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="NIT"
                fieldName="documentNumber"
                type="text"
                required={true}
                value={formData.documentNumber}
                error={errors.documentNumber}
                autoComplete="off"
              />
            </div>
          </div>
        ) : (
          <>
            <RenderField
              {...commonFieldProps}
              label="Tipo de persona"
              fieldName="supplierType"
              type="select"
              required={true}
              value={formData.supplierType}
              error={errors.supplierType}
              autoFocus={true}
              options={["Persona jurídica", "Persona natural"]}
            />
            <div className="form-row">
              <div className="col" style={{ flex: '0 0 45%' }}>
                <RenderField
                  {...commonFieldProps}
                  label="Tipo"
                  fieldName="documentType"
                  type="select"
                  required={true}
                  value={formData.documentType}
                  error={errors.documentType}
                  options={[
                    "Cédula de ciudadanía",
                    "Cédula de extranjería",
                    "Permiso especial (PEP)",
                    "Permiso temporal (PPT)",
                    "Pasaporte"
                  ]}
                />
              </div>
              <div className="col" style={{ flex: '1' }}>
                <RenderField
                  {...commonFieldProps}
                  label="Documento"
                  fieldName="documentNumber"
                  type="text"
                  required={true}
                  value={formData.documentNumber}
                  error={errors.documentNumber}
                  autoComplete="off"
                />
              </div>
            </div>
          </>
        )}

        {isJuridica && (
          <div className="form-row">
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="Empresa"
                fieldName="companyName"
                type="text"
                required={true}
                value={formData.companyName}
                error={errors.companyName}
                autoComplete="organization"
              />
            </div>
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="Encargado"
                fieldName="contactName"
                type="text"
                required={true}
                value={formData.contactName}
                error={errors.contactName}
                autoComplete="name"
              />
            </div>
          </div>
        )}

        {isNatural && (
          <div className="form-row">
            <div className="col">
              <RenderField
                {...commonFieldProps}
                label="Nombre completo"
                fieldName="contactName"
                type="text"
                required={true}
                value={formData.contactName}
                error={errors.contactName}
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="col">
            <RenderField
              {...commonFieldProps}
              label="Dirección"
              fieldName="address"
              type="text"
              required={true}
              value={formData.address}
              error={errors.address}
              autoComplete="street-address"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="col">
            <RenderField
              {...commonFieldProps}
              label="Email"
              fieldName="email"
              type="email"
              required={true}
              value={formData.email}
              error={errors.email}
              autoComplete="email"
            />
          </div>
          <div className="col">
            <RenderField
              {...commonFieldProps}
              label="Teléfono"
              fieldName="phone"
              type="tel"
              required={true}
              value={formData.phone}
              error={errors.phone}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="col">
            <RenderField
              {...commonFieldProps}
              label="Departamento"
              fieldName="department"
              type="select"
              required={true}
              value={formData.department}
              error={errors.department}
            />
          </div>
          <div className="col">
            <RenderField
              {...commonFieldProps}
              label="Ciudad"
              fieldName="city"
              type="select"
              required={true}
              value={formData.city}
              error={errors.city}
              disabled={!formData.department}
            />
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProveedorFormFields;
